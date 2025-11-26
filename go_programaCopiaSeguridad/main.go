package main

import (
	"fmt"
	"go_programaCopiaSeguridad/usb"

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

	// Goroutine que actualiza el binding
	go func() {
		for ev := range events {
			statusBind.Set(fmt.Sprintf("USB detectada en: %s", ev.Path))
		}
	}()

	a.Run()
}
