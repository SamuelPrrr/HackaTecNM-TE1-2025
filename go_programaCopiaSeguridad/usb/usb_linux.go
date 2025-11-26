//go:build linux

package usb

import (
	"os"
	"time"
)

func WatchUSB(events chan USBEvent) {
    known := make(map[string]bool)

    for {
        entries, _ := os.ReadDir("/media")
        for _, e := range entries {
            path := "/media/" + e.Name()

            if !known[path] {
                known[path] = true
                events <- USBEvent{Path: path}
            }
        }
        time.Sleep(2 * time.Second)
    }
}
