//go:build darwin

package usb

import (
	"os"
	"time"
)

func WatchUSB(events chan USBEvent) {
    known := make(map[string]bool)

    for {
        entries, _ := os.ReadDir("/Volumes")
        for _, e := range entries {
            path := "/Volumes/" + e.Name()

            // ignorar disco del sistema
            if path == "/Volumes/Macintosh HD" {
                continue
            }

            if !known[path] {
                known[path] = true
                events <- USBEvent{Path: path}
            }
        }
        time.Sleep(2 * time.Second)
    }
}
