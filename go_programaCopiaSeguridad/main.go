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
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

func main() {
	a := app.New()
	w := a.NewWindow("Control USB - Cliente")
	w.Resize(fyne.NewSize(500, 300))

	statusBind := binding.NewString()
	statusBind.Set("Esperando dispositivo USB...")

	statusLabel := widget.NewLabelWithData(statusBind)

	content := container.NewVBox(
		widget.NewLabel("Monitor de USB activo"),
		statusLabel,
	)

	w.SetContent(content)
	w.Show()

	events := make(chan usb.USBEvent)

	go usb.WatchUSB(events)

	// Cargar reglas
	go func() {
		r, err := rules.FetchRules()
		if err != nil {
			log.Printf("[MAIN] ERROR: %v", err)
			statusBind.Set("No se pudieron obtener reglas del servidor")
			return
		}

		var extCorrect []string
		for _, e := range r.Extensions {
			if e[0] != '.' {
				extCorrect = append(extCorrect, "."+e)
			} else {
				extCorrect = append(extCorrect, e)
			}
		}
		copy.SetExtensions(extCorrect)
		statusBind.Set("Reglas sincronizadas con servidor")
	}()

	// Manejo de eventos USB
	go func() {
		for ev := range events {

			usbPath := ev.Path
			statusBind.Set(fmt.Sprintf("Dispositivo detectado: %s", usbPath))

			// Mostrar ventana de confirmación
			dialog.NewConfirm(
				"Iniciar Backup",
				fmt.Sprintf("¿Deseas iniciar la copia de seguridad de la USB?\n\nRuta detectada:\n%s", usbPath),
				func(confirm bool) {
					if !confirm {
						statusBind.Set("Copia cancelada por el usuario")
						return
					}

					// Usuario aceptó → iniciar backup
					statusBind.Set("Iniciando copia de archivos...")

					progress := make(chan copy.CopyProgress)
					dest := "/Users/samuel_prr/BackupsUSB"

					// Mostrar progreso
					go func() {
						for p := range progress {
							if p.Error != nil {
								statusBind.Set("Error: " + p.Error.Error())
								continue
							}
							if p.Done {
								statusBind.Set("Copia completada: " + p.FileName)
								continue
							}
							statusBind.Set(fmt.Sprintf(
								"Copiando %s... %d/%d MB",
								p.FileName,
								p.BytesCopied/1024/1024,
								p.TotalBytes/1024/1024,
							))
						}
					}()

					// Ejecutar copia USB
					go copy.CopyUSB(usbPath, dest, progress)
				},
				w,
			).Show()
		}
	}()

	a.Run()
}
