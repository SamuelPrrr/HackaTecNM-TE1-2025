package main

import (
	"fmt"
	"go_programaCopiaSeguridad/copy"
	"go_programaCopiaSeguridad/rules"
	"go_programaCopiaSeguridad/usb"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

func main() {
	a := app.New()

	// Tema oscuro
	a.Settings().SetTheme(theme.DarkTheme())

	w := a.NewWindow("Control USB - Cliente")
	w.Resize(fyne.NewSize(650, 550))

	//-------------------------------------------
	//   ESTADO GENERAL
	//-------------------------------------------
	statusBind := binding.NewString()
	statusBind.Set("Esperando dispositivo USB...")

	statusLabel := widget.NewLabelWithData(statusBind)

	globalProgress := widget.NewProgressBar()
	globalProgress.SetValue(0)

	logBox := widget.NewMultiLineEntry()
	logBox.Wrapping = fyne.TextWrapWord
	logBox.Disable()

	addLog := func(msg string) {
		logBox.SetText(logBox.Text + msg + "\n")
	}

	//-------------------------------------------
	//   DESTINO SELECCIONADO POR EL USUARIO
	//-------------------------------------------
	destBind := binding.NewString()
	destBind.Set("/Users/samuel_prr/BackupsUSB")

	destLabel := widget.NewLabelWithData(destBind)

	selectDestButton := widget.NewButton("Seleccionar carpeta destino", func() {
		dialog.NewFolderOpen(func(uri fyne.ListableURI, err error) {
			if err != nil || uri == nil {
				return
			}
			destBind.Set(uri.Path())
			addLog("Nueva carpeta seleccionada: " + uri.Path())
		}, w).Show()
	})

	//-------------------------------------------
	//   UI CON PADDING
	//-------------------------------------------
	content := container.NewPadded(
		container.NewVBox(
			widget.NewLabelWithStyle("Monitor USB - Cliente", fyne.TextAlignCenter, fyne.TextStyle{Bold: true}),
			statusLabel,

			widget.NewSeparator(),

			widget.NewLabel("Carpeta destino:"),
			destLabel,
			selectDestButton,

			widget.NewSeparator(),

			widget.NewLabel("Progreso total:"),
			globalProgress,

			widget.NewSeparator(),

			widget.NewLabel("Logs:"),
			container.NewVScroll(logBox),
		),
	)

	w.SetContent(content)
	w.Show()

	//-------------------------------------------
	//   MONITOREO USB
	//-------------------------------------------
	events := make(chan usb.USBEvent)
	go usb.WatchUSB(events)

	//-------------------------------------------
	//   OBTENER REGLAS
	//-------------------------------------------
	go func() {
		r, err := rules.FetchRules()
		if err != nil {
			statusBind.Set("No se pudieron obtener reglas del servidor")
			addLog("ERROR al obtener reglas: " + err.Error())
			return
		}

		var ext []string
		for _, e := range r.Extensions {
			if e[0] != '.' {
				ext = append(ext, "."+e)
			} else {
				ext = append(ext, e)
			}
		}

		copy.SetExtensions(ext)

		addLog("Reglas sincronizadas con servidor:")
		addLog(fmt.Sprintf("%v", ext))

		statusBind.Set("Esperando dispositivo USB...")
	}()

	//-------------------------------------------
	//   MANEJO DE EVENTOS USB
	//-------------------------------------------
	go func() {
		for ev := range events {

			// Si no hay ruta, significa que la USB se quitó
			if ev.Path == "" {
				statusBind.Set("Esperando dispositivo USB...")
				continue
			}

			usbPath := ev.Path
			statusBind.Set("Dispositivo detectado: " + usbPath)
			addLog("USB detectada en: " + usbPath)

			//-------------------------------------------
			//   CONFIRMAR COPIA ANTES DE INICIAR
			//-------------------------------------------
			dialog.NewConfirm(
				"Confirmar copia",
				fmt.Sprintf("¿Deseas iniciar la copia de seguridad?\n\nUSB detectada:\n%s", usbPath),
				func(ok bool) {
					if !ok {
						statusBind.Set("Esperando dispositivo USB...")
						addLog("Copia cancelada por el usuario.")
						return
					}

					//-------------------------------------------
					//   INICIAR COPIA
					//-------------------------------------------
					dest, _ := destBind.Get()
					progress := make(chan copy.CopyProgress)

					globalProgress.SetValue(0)
					statusBind.Set("Preparando copia...")
					addLog("Destino de copia: " + dest)

					// Contar archivos válidos
					totalFiles := copy.CountAllowedFiles(usbPath)
					if totalFiles == 0 {
						statusBind.Set("Esperando dispositivo USB...")
						addLog("No hay archivos permitidos que copiar.")
						return
					}

					var finished float64 = 0

					// Progreso en goroutine
					go func() {
						for p := range progress {
							if p.Error != nil {
								addLog("ERROR en " + p.FileName + ": " + p.Error.Error())
								statusBind.Set("Error en copia.")
								continue
							}

							if p.Done {
								finished++
								globalProgress.SetValue(finished / float64(totalFiles))
								addLog("Archivo copiado: " + p.FileName)

								if finished == float64(totalFiles) {
									statusBind.Set("Copia finalizada.")
									addLog("✔ Backup COMPLETO")
								}

								continue
							}


							// Progreso parcial
							statusBind.Set(fmt.Sprintf(
								"Copiando %s... %d/%d MB",
								p.FileName,
								p.BytesCopied/1024/1024,
								p.TotalBytes/1024/1024,
							))
						}
					}()

					// Ejecutar copia
					go copy.CopyUSB(usbPath, dest, progress)
				},
				w,
			).Show()
		}
	}()

	a.Run()
}
