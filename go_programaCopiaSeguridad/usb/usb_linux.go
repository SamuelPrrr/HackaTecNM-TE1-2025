//go:build linux

package usb

import (
	"log"
	"os"
	"os/user"
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

    usr, _ := user.Current()
    dirs := []string{
        "/media/" + usr.Username,
        "/run/media/" + usr.Username,
    }

    for _, d := range dirs {
        if _, err := os.Stat(d); err == nil {
            watcher.Add(d)
            log.Println("Vigilando:", d)
        }
    }

    for {
        select {
        case ev := <-watcher.Events:
            if ev.Op&fsnotify.Create == fsnotify.Create {
                time.Sleep(500 * time.Millisecond)
                events <- USBEvent{Path: ev.Name}
            }
        case err := <-watcher.Errors:
            log.Println("Error:", err)
        }
    }
}
