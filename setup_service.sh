#!/bin/bash
set -e

IMAGE_URL="https://cdimage.ubuntu.com/releases/jammy/release/ubuntu-22.04.5-preinstalled-server-arm64+raspi.img.xz"
IMAGE_NAME="custom-pi-image.img"

echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

echo "Downloading Ubuntu Server for Pi..."
wget -q --show-progress -O pi.img.xz "$IMAGE_URL"

echo "Extracting image..."
if ! unxz -v pi.img.xz; then
    echo "Extraction failed!"
    exit 1
fi

mv pi.img "$IMAGE_NAME"

echo "Creating mount point..."
mkdir -p /mnt/pi

echo "Analyzing image partitions..."
fdisk -l "$IMAGE_NAME"

# More robust partition offset calculation
OFFSET=$(fdisk -l "$IMAGE_NAME" | grep "Linux" | head -1 | awk '{print $2 * 512}')
echo "Calculated offset: $OFFSET"

if [ -z "$OFFSET" ] || [ "$OFFSET" -eq 0 ]; then
    echo "Error: Could not determine partition offset"
    echo "Trying alternative partition detection..."
    OFFSET=$(fdisk -l "$IMAGE_NAME" | grep "img2" | awk '{print $2 * 512}')
    echo "Alternative offset: $OFFSET"
    
    if [ -z "$OFFSET" ] || [ "$OFFSET" -eq 0 ]; then
        echo "Failed to find partition offset"
        exit 1
    fi
fi

echo "Mounting the image..."
if mount -o loop,offset=$OFFSET "$IMAGE_NAME" /mnt/pi; then
    echo "Mount successful"
    
    echo "Installing Monitor Script..."
    mkdir -p /mnt/pi/usr/local/bin
    cp /opt/monitor.py /mnt/pi/usr/local/bin/monitor.py
    chmod +x /mnt/pi/usr/local/bin/monitor.py

    echo "Creating systemd service..."
    mkdir -p /mnt/pi/etc/systemd/system
    cat <<EOF > /mnt/pi/etc/systemd/system/usb-monitor.service
[Unit]
Description=USB Monitor Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/monitor.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

    # Enable service
    mkdir -p /mnt/pi/etc/systemd/system/multi-user.target.wants
    ln -sf /etc/systemd/system/usb-monitor.service /mnt/pi/etc/systemd/system/multi-user.target.wants/usb-monitor.service

    echo "Unmounting..."
    umount /mnt/pi
else
    echo "Mount failed!"
    echo "Trying to install libguestfs-tools as alternative..."
    apt-get update && apt-get install -y libguestfs-tools
    
    if guestfish --rw -a "$IMAGE_NAME" -m /dev/sda2 <<EOF
        copy-in /opt/monitor.py /usr/local/bin/
        write /etc/systemd/system/usb-monitor.service "[Unit]
Description=USB Monitor Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/monitor.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
"
        mkdir-p /etc/systemd/system/multi-user.target.wants
        ln-sf /etc/systemd/system/usb-monitor.service /etc/systemd/system/multi-user.target.wants/usb-monitor.service
EOF
    then
        echo "Guestfish modification successful"
    else
        echo "All modification methods failed"
        exit 1
    fi
fi

echo "Copying final image to output..."
cp "$IMAGE_NAME" /output/

echo "Build Complete!"
echo "Final image: /output/$IMAGE_NAME"
ls -lh /output/
