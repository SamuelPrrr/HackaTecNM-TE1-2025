//go:build windows

package usb

import (
	"bufio"
	"os/exec"
	"strings"
	"time"
)

func WatchUSB(events chan USBEvent) {
    known := make(map[string]bool)

    for {
        // obtener todas las unidades visibles
        cmd := exec.Command("wmic", "logicaldisk", "get", "name")
        out, _ := cmd.Output()
        scanner := bufio.NewScanner(strings.NewReader(string(out)))

        for scanner.Scan() {
            line := strings.TrimSpace(scanner.Text())
            if strings.HasSuffix(line, ":") {
                path := line + "\\"

                if !known[path] {
                    known[path] = true
                    events <- USBEvent{Path: path}
                }
            }
        }
        time.Sleep(2 * time.Second)
    }
}
