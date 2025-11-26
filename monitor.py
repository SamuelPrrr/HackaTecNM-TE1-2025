import pyudev
import time
import os

def main():
    print("Starting USB/SD Card Monitor...")
    
    # Create the context for hardware monitoring
    context = pyudev.Context()
    monitor = pyudev.Monitor.from_netlink(context)
    
    # Filter only for 'block' devices (storage like USB and SD)
    monitor.filter_by(subsystem='block')
    
    # Start the monitoring loop
    for device in monitor:
        if device.action == 'add':
            # Filter out partitions (usually we want the main disk, e.g., sda, not sda1)
            # Depending on your needs, you might remove this if check.
            dev_node = device.device_node
            print(f"EVENT: Storage device connected: {dev_node}")
            
            # Optional: Check if it is a specific type (USB vs SD)
            # ID_BUS usually returns 'usb' or 'mmc' (for SD cards)
            bus = device.get('ID_BUS')
            print(f"Type: {bus}")
            
        elif device.action == 'remove':
            print(f"EVENT: Storage device removed: {device.device_node}")

if __name__ == "__main__":
    main()
