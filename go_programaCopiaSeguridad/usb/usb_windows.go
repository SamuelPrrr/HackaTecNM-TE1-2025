//go:build windows

package usb

import (
	"fmt"
	"log"
	"os"
	"time"
)

func driveExists(path string) bool {
    _, err := os.Stat(path)
    return err == nil
}

func WatchUSB(events chan USBEvent) {
    known := make(map[string]bool)

    for {
        for letter := 'D'; letter <= 'Z'; letter++ {
            path := fmt.Sprintf("%c:\\", letter)

            exists := driveExists(path)

            if exists && !known[path] {
                known[path] = true
                log.Println("USB detectada:", path)
                events <- USBEvent{Path: path}
            }

            if !exists && known[path] {
                delete(known, path)
            }
        }

        time.Sleep(1 * time.Second)
    }
}
