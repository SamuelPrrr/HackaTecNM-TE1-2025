package main

import (
	"fmt"
	"go_programaCopiaSeguridad/copy"
	"go_programaCopiaSeguridad/rules"
	"go_programaCopiaSeguridad/usb"
	"log"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/widget"
)

func main() {
	a := app.New()
	w := a.NewWindow("Control USB - Cliente")
	w.Resize(fyne.NewSize(500, 300))

	// Binding para el texto
	statusBind := binding.NewString()
	statusBind.Set("Esperando dispositivo USB...")

	// Widget que usa binding
	statusLabel := widget.NewLabelWithData(statusBind)

	content := container.NewVBox(
		widget.NewLabel("Monitor de USB activo"),
		statusLabel,
	)

	w.SetContent(content)
	w.Show()

	events := make(chan usb.USBEvent)

	// Llamar WatchUSB del paquete usb
	go usb.WatchUSB(events)

go func() {
    r, err := rules.FetchRules()

    if err != nil {
        log.Printf("[MAIN] ERROR: %v", err)
        statusBind.Set("No se pudieron obtener reglas del servidor")
        return
    }

    // Aplicar extensiones al motor de copia
    var extCorrect []string
for _, e := range r.Extensions {
        if e[0] != '.' {
            extCorrect = append(extCorrect, "."+e)
        } else {
            extCorrect = append(extCorrect, e)
        }
    }
    copy.SetExtensions(extCorrect)
    log.Printf("[MAIN] Extensiones configuradas: %v", extCorrect)

    statusBind.Set("Reglas sincronizadas con servidor")
}()


	// Goroutine que actualiza el binding
	go func() {
		for ev := range events {
			statusBind.Set(fmt.Sprintf("USB detectada en: %s", ev.Path))
		}
	}()

	a.Run()
}
