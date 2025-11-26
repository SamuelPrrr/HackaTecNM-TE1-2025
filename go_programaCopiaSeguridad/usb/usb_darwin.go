//go:build darwin

package usb

import (
	"log"
	"time"

	"github.com/fsnotify/fsnotify"
)

func WatchUSB(events chan USBEvent) {
    watcher, err := fsnotify.NewWatcher()
    if err != nil {
        log.Println("Error watcher:", err)
        return
    }
    defer watcher.Close()

    err = watcher.Add("/Volumes")
    if err != nil {
        log.Println("Error watching /Volumes:", err)
        return
    }

    log.Println("Esperando USB en macOS...")

    for {
        select {
        case ev := <-watcher.Events:
            if ev.Op&fsnotify.Create == fsnotify.Create {
                // Se montó algo
                time.Sleep(500 * time.Millisecond) // esperar montado completo
                events <- USBEvent{Path: ev.Name}
            }
        case err := <-watcher.Errors:
            log.Println("Error:", err)
        }
    }
}
