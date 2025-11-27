package main

import (
	"fmt"
	"image/color"
	"path/filepath"
	"time"

	"go_programaCopiaSeguridad/copy"
	"go_programaCopiaSeguridad/db"
	"go_programaCopiaSeguridad/metadata"
	"go_programaCopiaSeguridad/rules"
	"go_programaCopiaSeguridad/usb"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

// ========================================
// TEMA CORPORATIVO (AMARILLO Y VERDE)
// ========================================
type corporateTheme struct{}

var (
	corpYellow    = color.NRGBA{R: 0xFF, G: 0xC1, B: 0x07, A: 0xFF}
	corpGreen     = color.NRGBA{R: 0x00, G: 0xC8, B: 0x53, A: 0xFF}
	corpBg        = color.NRGBA{R: 0x12, G: 0x12, B: 0x12, A: 0xFF}
	corpSurface   = color.NRGBA{R: 0x1E, G: 0x1E, B: 0x1E, A: 0xFF}
	corpSurface2  = color.NRGBA{R: 0x2C, G: 0x2C, B: 0x2C, A: 0xFF}
	corpTextLight = color.NRGBA{R: 0xFF, G: 0xFF, B: 0xFF, A: 0xFF}
	corpTextMuted = color.NRGBA{R: 0xAA, G: 0xAA, B: 0xAA, A: 0xFF}
)

func (corporateTheme) Color(name fyne.ThemeColorName, variant fyne.ThemeVariant) color.Color {
	switch name {
	case theme.ColorNameBackground:
		return corpBg
	case theme.ColorNameInputBackground:
		return corpSurface2
	case theme.ColorNameButton:
		return corpSurface2
	case theme.ColorNamePrimary:
		return corpYellow
	case theme.ColorNameForeground:
		return corpTextLight
	case theme.ColorNameDisabled:
		return corpTextMuted
	case theme.ColorNameScrollBar:
		return corpYellow
	case theme.ColorNameSuccess:
		return corpGreen
	default:
		return theme.DefaultTheme().Color(name, variant)
	}
}
func (corporateTheme) Icon(name fyne.ThemeIconName) fyne.Resource {
	return theme.DefaultTheme().Icon(name)
}
func (corporateTheme) Font(style fyne.TextStyle) fyne.Resource {
	return theme.DefaultTheme().Font(style)
}
func (corporateTheme) Size(name fyne.ThemeSizeName) float32 { return theme.DefaultTheme().Size(name) }

// ========================================
// HELPER UI
// ========================================
func createDashboardCard(title string, accent color.Color, content fyne.CanvasObject) fyne.CanvasObject {
	bg := canvas.NewRectangle(corpSurface)
	bg.CornerRadius = 8
	topBar := canvas.NewRectangle(accent)
	topBar.SetMinSize(fyne.NewSize(0, 3))
	cardLabel := canvas.NewText(title, accent)
	cardLabel.TextStyle = fyne.TextStyle{Bold: true}
	cardLabel.TextSize = 12
	header := container.NewVBox(topBar, container.NewPadded(cardLabel))
	return container.NewStack(bg, container.NewBorder(header, nil, nil, nil, container.NewPadded(content)))
}

func main() {
	a := app.New()
	a.Settings().SetTheme(&corporateTheme{})
	w := a.NewWindow("SystemBackup | Pro Enterprise")
	w.Resize(fyne.NewSize(1280, 800))

	// VARIABLES BINDING
	statusMsg := binding.NewString()
	statusMsg.Set("INICIALIZANDO...")
	destPathBind := binding.NewString()
	destPathBind.Set("C:\\Backups_Camaras")
	progressFloat := binding.NewFloat()
	progressLabelStr := binding.NewString()
	progressLabelStr.Set("0%")
	currentFileMsg := binding.NewString()
	currentFileMsg.Set("Esperando USB...")
	clockBind := binding.NewString()
	statTotalBind := binding.NewString()
	statTotalBind.Set("Archivos: 0")
	statMetaBind := binding.NewString()
	statMetaBind.Set("Metadata: 0")
	logContent := binding.NewString()
	logContent.Set("Sistema iniciado...")

	addLog := func(msg string) {
		current, _ := logContent.Get()
		t := time.Now().Format("15:04:05")
		logContent.Set(fmt.Sprintf("[%s] %s\n%s", t, msg, current))
	}

	// HEADER & UI (Simplificado visualmente, código igual al original)
	logoTxt := canvas.NewText("CONABIO BACKUP", corpYellow)
	logoTxt.TextStyle = fyne.TextStyle{Bold: true}
	logoTxt.TextSize = 24
	subLogoTxt := canvas.NewText("MÓDULO DE EXTRACCIÓN AVANZADA PARA CONABIO", corpGreen)
	subLogoTxt.TextSize = 11
	clockLabel := widget.NewLabelWithData(clockBind)
	go func() {
		for range time.Tick(time.Second) {
			clockBind.Set(time.Now().Format("15:04:05 | 02 Jan 2006"))
		}
	}()
	header := container.NewPadded(container.NewHBox(widget.NewIcon(theme.StorageIcon()), container.NewVBox(logoTxt, subLogoTxt), layout.NewSpacer(), clockLabel))

	lblStatus := widget.NewLabelWithData(statusMsg)
	lblStatus.Alignment = fyne.TextAlignCenter
	lblStatus.TextStyle = fyne.TextStyle{Bold: true}

	lblDest := widget.NewLabelWithData(destPathBind)
	btnChangeDest := widget.NewButtonWithIcon("Carpeta Destino", theme.FolderOpenIcon(), func() {
		dialog.NewFolderOpen(func(uri fyne.ListableURI, err error) {
			if uri != nil {
				destPathBind.Set(uri.Path())
			}
		}, w).Show()
	})

	progressBar := widget.NewProgressBarWithData(progressFloat)
	lblPercentage := widget.NewLabelWithData(progressLabelStr)
	lblPercentage.Alignment = fyne.TextAlignCenter
	lblCurrent := widget.NewLabelWithData(currentFileMsg)
	lblCurrent.Alignment = fyne.TextAlignCenter

	leftCol := container.NewVBox(
		createDashboardCard("ESTADO", corpYellow, lblStatus),
		createDashboardCard("CONFIGURACIÓN", corpGreen, container.NewVBox(lblDest, btnChangeDest)),
	)

	progContainer := container.NewVBox(
		container.NewPadded(lblPercentage), progressBar, container.NewPadded(lblCurrent), layout.NewSpacer(),
		container.NewGridWithColumns(2,
			container.NewCenter(widget.NewLabelWithData(statTotalBind)),
			container.NewCenter(widget.NewLabelWithData(statMetaBind))),
	)

	logEntry := widget.NewMultiLineEntry()
	logEntry.Bind(logContent)
	logEntry.Disable()

	contentGrid := container.NewHSplit(container.NewHSplit(leftCol, createDashboardCard("PROCESO", corpYellow, progContainer)), createDashboardCard("REGISTRO", corpGreen, logEntry))
	contentGrid.Offset = 0.6

	w.SetContent(container.NewStack(canvas.NewRectangle(corpBg), container.NewBorder(header, nil, nil, nil, container.NewPadded(contentGrid))))

	// ========================================
	// LÓGICA PRINCIPAL (CON FIREBASE MANUAL)
	// ========================================

	usbEvents := make(chan usb.USBEvent)
	go usb.WatchUSB(usbEvents)

	go func() {
		// 1. INICIALIZAR FIRESTORE (SIN URL)
		statusMsg.Set("Conectando base de datos...")

		// Solo necesitamos el archivo que ya tienes
		credPath := "serviceAccountKey.json"

		// CAMBIO AQUÍ: Llamamos a InitFirestore
		errDB := db.InitFirestore(credPath)

		if errDB != nil {
			addLog("ERROR DB (Firestore):")
			addLog("   " + errDB.Error())
		} else {
			addLog("Conectado a Firestore (ID Automático).")
		}

		// 2. REGLAS
		r, errRules := rules.FetchRules()
		var combinedExt []string
		if errRules == nil {
			for _, e := range r.Extensions {
				if len(e) > 0 && e[0] != '.' {
					e = "." + e
				}
				combinedExt = append(combinedExt, e)
			}
		} else {
			addLog("Usando reglas locales (Error servidor).")
		}

		// Forzar AVIs y MP4
		forced := []string{".avi", ".jpg", ".jpeg", ".mp4", ".png", ".mov"}
		for _, f := range forced {
			found := false
			for _, c := range combinedExt {
				if c == f {
					found = true
					break
				}
			}
			if !found {
				combinedExt = append(combinedExt, f)
			}
		}
		copy.SetExtensions(combinedExt)
		statusMsg.Set("Sincronizando reglas...")
	}()

	go func() {
		for ev := range usbEvents {
			if ev.Path == "" {
				statusMsg.Set("USB DESCONECTADA")
				progressFloat.Set(0)
				progressLabelStr.Set("0%")
				continue
			}
			statusMsg.Set("USB: " + ev.Path)
			addLog("USB Detectada: " + ev.Path)

			dialog.NewConfirm("Confirmar", "¿Procesar "+ev.Path+"?", func(ok bool) {
				if !ok {
					statusMsg.Set("CANCELADO")
					return
				}

				destDir, _ := destPathBind.Get()
				statusMsg.Set("EXTRAYENDO Y COPIANDO...")
				addLog("--- INICIO PROCESO ---")
				progressFloat.Set(0)
				progressLabelStr.Set("0%")

				progChan := make(chan copy.CopyProgress)
				totalFiles := copy.CountAllowedFiles(ev.Path)
				statTotalBind.Set(fmt.Sprintf("Archivos: 0/%d", totalFiles))

				// Iniciar proceso pesado
				go copy.CopyUSBWithMetadata(ev.Path, destDir, progChan)

				// Monitor de proceso
				go func() {
					metaCount := 0
					processedCount := 0
					var currentCopied float64 = 0

					for p := range progChan {
						if p.Error != nil {
							addLog("Err: " + p.FileName)
							continue
						}

						// DETECCIÓN DE METADATA (Mandar a Firebase)
						if p.MetadataReady {
							metaCount++
							statMetaBind.Set(fmt.Sprintf("Metadata: %d", metaCount))

							// Cargar lo que generó 'metadata.go' (JSON + PNG -> Struct en RAM)
							metaPath := filepath.Join(destDir, "_metadata")
							baseName := p.FileName[:len(p.FileName)-len(filepath.Ext(p.FileName))]
							jsonPath := filepath.Join(metaPath, baseName+"_metadata.json")

							if m, err := metadata.LoadMetadataFromJSON(jsonPath); err == nil {
								// Adjuntar PNG como Base64 (si existe)
								_ = metadata.AttachThumbnail(m, metaPath)

								// ENVIAR A FIREBASE
								// Importante: No bloqueamos el hilo principal
								go func(data *metadata.VideoMetadata) {
									if err := db.UploadMetadata(data); err != nil {
										fmt.Printf("Error Firebase: %v\n", err)
									}
								}(m)

								addLog("✅ Metadata DB OK: " + p.FileName)
							}
							continue
						}

						// FINALIZACIÓN DE COPIA FÍSICA
						if p.Done {
							processedCount++
							currentCopied++
							val := currentCopied / float64(totalFiles)
							progressFloat.Set(val)
							progressLabelStr.Set(fmt.Sprintf("%d%%", int(val*100)))
							statTotalBind.Set(fmt.Sprintf("Archivos: %d/%d", processedCount, totalFiles))
							currentFileMsg.Set("OK: " + p.FileName)

							if int64(processedCount) >= totalFiles {
								statusMsg.Set("COMPLETADO")
								dialog.ShowInformation("Éxito", "Proceso completado correctamente", w)
							}
							continue
						}
						currentFileMsg.Set("Copiando " + p.FileName)
					}
				}()
			}, w).Show()
		}
	}()
	w.ShowAndRun()
}
