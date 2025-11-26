FROM ubuntu:22.04

# Install libguestfs-tools which includes guestfish
RUN apt-get update && apt-get install -y \
    wget \
    xz-utils \
    libguestfs-tools \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy your scripts
COPY monitor.py /opt/monitor.py
COPY setup_service.sh /opt/setup_service.sh

# Make scripts executable
RUN chmod +x /opt/setup_service.sh

# Create output directory
RUN mkdir -p /output

CMD ["/bin/bash", "/opt/setup_service.sh"]
