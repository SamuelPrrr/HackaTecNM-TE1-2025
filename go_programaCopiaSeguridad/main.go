package main

import (
	"fmt"
	"image/color"

	"go_programaCopiaSeguridad/copy"
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

// Tema corporativo personalizado con gradientes vibrantes
type corporateTheme struct{}

var (
	// Paleta de colores moderna y vibrante
	primaryYellow  = color.NRGBA{R: 0xFF, G: 0xD7, B: 0x00, A: 0xFF} // Amarillo más brillante
	primaryGreen   = color.NRGBA{R: 0x00, G: 0xE6, B: 0x76, A: 0xFF} // Verde neón
	accentPurple   = color.NRGBA{R: 0x9D, G: 0x4E, B: 0xDD, A: 0xFF} // Púrpura
	accentBlue     = color.NRGBA{R: 0x00, G: 0xB8, B: 0xFF, A: 0xFF} // Azul brillante
	backgroundDark = color.NRGBA{R: 0x0A, G: 0x0E, B: 0x1A, A: 0xFF} // Azul oscuro profundo
	surfaceColor   = color.NRGBA{R: 0x1A, G: 0x1F, B: 0x35, A: 0xFF} // Superficie elevada
	surfaceDark    = color.NRGBA{R: 0x12, G: 0x16, B: 0x24, A: 0xFF} // Superficie más oscura
	textLight      = color.NRGBA{R: 0xF8, G: 0xF9, B: 0xFA, A: 0xFF} // Blanco casi puro
	textMuted      = color.NRGBA{R: 0x94, G: 0xA3, B: 0xB8, A: 0xFF} // Gris azulado
	errorRed       = color.NRGBA{R: 0xFF, G: 0x4D, B: 0x4D, A: 0xFF} // Rojo brillante
	successGreen   = color.NRGBA{R: 0x00, G: 0xFF, B: 0x88, A: 0xFF} // Verde éxito
)

func (corporateTheme) Color(name fyne.ThemeColorName, variant fyne.ThemeVariant) color.Color {
	switch name {
	case theme.ColorNamePrimary:
		return primaryYellow
	case theme.ColorNameButton:
		return primaryGreen
	case theme.ColorNameFocus:
		return accentBlue
	case theme.ColorNameBackground:
		return backgroundDark
	case theme.ColorNameForeground:
		return textLight
	case theme.ColorNameInputBackground:
		return surfaceDark
	case theme.ColorNameDisabled:
		return textMuted
	default:
		return theme.DefaultTheme().Color(name, variant)
	}
}

func (corporateTheme) Font(style fyne.TextStyle) fyne.Resource {
	return theme.DefaultTheme().Font(style)
}

func (corporateTheme) Icon(name fyne.ThemeIconName) fyne.Resource {
	return theme.DefaultTheme().Icon(name)
}

func (corporateTheme) Size(name fyne.ThemeSizeName) float32 {
	return theme.DefaultTheme().Size(name)
}

// Crear tarjeta con borde de acento y sombra
func createCard(content fyne.CanvasObject, accentColor color.Color, glowIntensity uint8) fyne.CanvasObject {
	// Fondo principal
	bg := canvas.NewRectangle(surfaceColor)
	bg.CornerRadius = 12

	// Borde con glow
	glow := canvas.NewRectangle(color.NRGBA{
		R: accentColor.(color.NRGBA).R,
		G: accentColor.(color.NRGBA).G,
		B: accentColor.(color.NRGBA).B,
		A: glowIntensity,
	})
	glow.CornerRadius = 14

	// Borde sólido
	border := canvas.NewRectangle(accentColor)
	border.CornerRadius = 12

	contentPadded := container.NewPadded(
		container.NewPadded(
			container.NewPadded(content),
		),
	)

	return container.NewStack(
		container.NewPadded(glow), // Efecto glow externo
		border,
		container.NewPadded(bg),
		contentPadded,
	)
}

// Crear título de sección con estilo moderno
func createSectionTitle(text string, accentColor color.Color) fyne.CanvasObject {
	title := canvas.NewText(text, textLight)
	title.TextSize = 16
	title.TextStyle = fyne.TextStyle{Bold: true}

	// Línea de acento con gradiente
	accentLine := canvas.NewRectangle(accentColor)
	accentLine.SetMinSize(fyne.NewSize(4, 28))

	// Punto decorativo
	dot := canvas.NewCircle(accentColor)
	dot.Resize(fyne.NewSize(8, 8))

	return container.NewBorder(
		nil, nil,
		container.NewHBox(
			accentLine,
			container.NewCenter(dot),
		),
		nil,
		container.NewPadded(title),
	)
}

// Crear indicador de estado animado
func createStatusIndicator(initialColor color.Color) (*canvas.Circle, *canvas.Circle) {
	indicator := canvas.NewCircle(initialColor)
	indicator.Resize(fyne.NewSize(14, 14))

	glow := canvas.NewCircle(color.NRGBA{
		R: initialColor.(color.NRGBA).R,
		G: initialColor.(color.NRGBA).G,
		B: initialColor.(color.NRGBA).B,
		A: 80,
	})
	glow.Resize(fyne.NewSize(24, 24))

	return indicator, glow
}

// Actualizar color del indicador
func updateIndicatorColor(indicator, glow *canvas.Circle, col color.Color) {
	nrgba := col.(color.NRGBA)
	indicator.FillColor = col
	glow.FillColor = color.NRGBA{R: nrgba.R, G: nrgba.G, B: nrgba.B, A: 80}
	indicator.Refresh()
	glow.Refresh()
}

func main() {
	a := app.New()
	a.Settings().SetTheme(&corporateTheme{})

	w := a.NewWindow("Sistema de Respaldo USB Pro")
	w.Resize(fyne.NewSize(1200, 750))

	// Variables de estado
	statusBind := binding.NewString()
	statusBind.Set("Inicializando sistema...")

	destBind := binding.NewString()
	destBind.Set("/Users/samuel_prr/BackupsUSB")

	// Indicador de estado
	statusIndicator, statusGlow := createStatusIndicator(textMuted)

	// ========================================
	// HEADER CON GRADIENTE Y LOGO
	// ========================================
	headerBg := canvas.NewRectangle(surfaceDark)

	// Línea de acento degradada
	accentTop := canvas.NewRectangle(primaryYellow)
	accentTop.SetMinSize(fyne.NewSize(0, 4))

	// Título principal con ícono
	titleIcon := widget.NewIcon(theme.StorageIcon())

	appTitle := canvas.NewText("BACKUP SYSTEM PRO", primaryYellow)
	appTitle.TextSize = 24
	appTitle.TextStyle = fyne.TextStyle{Bold: true}

	appSubtitle := canvas.NewText("Sistema inteligente de respaldo automático", accentBlue)
	appSubtitle.TextSize = 13

	versionBadge := canvas.NewText("v2.0", textMuted)
	versionBadge.TextSize = 10

	titleContent := container.NewVBox(
		container.NewHBox(titleIcon, appTitle, layout.NewSpacer(), versionBadge),
		appSubtitle,
	)

	headerContent := container.NewPadded(
		container.NewPadded(titleContent),
	)

	header := container.NewStack(
		headerBg,
		container.NewBorder(accentTop, nil, nil, nil, headerContent),
	)

	// ========================================
	// PANEL IZQUIERDO - ESTADO Y CONTROL
	// ========================================

	// 1. TARJETA DE ESTADO PRINCIPAL
	statusStack := container.NewStack(
		container.NewCenter(statusGlow),
		container.NewCenter(statusIndicator),
	)

	statusLabel := widget.NewLabelWithData(statusBind)
	statusLabel.Wrapping = fyne.TextWrapWord
	statusLabel.TextStyle = fyne.TextStyle{Bold: true}

	statusContent := container.NewBorder(
		nil, nil,
		container.NewPadded(statusStack),
		nil,
		container.NewPadded(statusLabel),
	)

	statusCard := createCard(
		container.NewVBox(
			createSectionTitle("ESTADO DEL SISTEMA", primaryGreen),
			container.NewPadded(statusContent),
		),
		primaryGreen,
		60,
	)

	// 2. TARJETA DE CONFIGURACIÓN
	folderIcon := widget.NewIcon(theme.FolderOpenIcon())

	destLabel := widget.NewLabel("")
	destLabel.Bind(destBind)
	destLabel.Wrapping = fyne.TextWrapWord
	destLabel.TextStyle = fyne.TextStyle{Monospace: true}

	destDisplay := container.NewBorder(
		nil, nil,
		folderIcon,
		nil,
		container.NewPadded(destLabel),
	)

	destCard := canvas.NewRectangle(surfaceDark)
	destCard.CornerRadius = 8

	destContainer := container.NewStack(
		destCard,
		container.NewPadded(destDisplay),
	)

	selectDestButton := widget.NewButton("Cambiar Ubicación", func() {
		dialog.NewFolderOpen(func(uri fyne.ListableURI, err error) {
			if err != nil || uri == nil {
				return
			}
			destBind.Set(uri.Path())
		}, w).Show()
	})
	selectDestButton.Importance = widget.HighImportance

	configCard := createCard(
		container.NewVBox(
			createSectionTitle("CARPETA DE DESTINO", primaryYellow),
			container.NewPadded(
				container.NewVBox(
					destContainer,
					selectDestButton,
				),
			),
		),
		primaryGreen,
		50,
	)

	// 3. TARJETA DE PROGRESO MEJORADA
	globalProgress := widget.NewProgressBar()
	globalProgress.SetValue(0)

	// Porcentaje grande y llamativo
	progressLabel := canvas.NewText("0%", primaryYellow)
	progressLabel.TextSize = 48
	progressLabel.TextStyle = fyne.TextStyle{Bold: true}
	progressLabel.Alignment = fyne.TextAlignCenter

	currentFileLabel := widget.NewLabel("Esperando inicio de copia...")
	currentFileLabel.Alignment = fyne.TextAlignCenter
	currentFileLabel.TextStyle = fyne.TextStyle{Italic: true}

	// Estadísticas adicionales
	statsLabel := canvas.NewText("", textMuted)
	statsLabel.TextSize = 11
	statsLabel.Alignment = fyne.TextAlignCenter

	progressCard := createCard(
		container.NewVBox(
			createSectionTitle("PROGRESO DE RESPALDO", primaryYellow),
			container.NewPadded(
				container.NewVBox(
					progressLabel,
					globalProgress,
					container.NewPadded(currentFileLabel),
					statsLabel,
				),
			),
		),
		primaryYellow,
		70,
	)

	// Panel de acciones rápidas
	quickActionsCard := createCard(
		container.NewVBox(
			createSectionTitle("ACCIONES RÁPIDAS", primaryYellow),
			container.NewPadded(
				container.NewVBox(
					widget.NewButton("Ver Historial", func() {
						dialog.ShowInformation("Historial", "Función en desarrollo", w)
					}),
					widget.NewButton("Configuración Avanzada", func() {
						dialog.ShowInformation("Configuración", "Función en desarrollo", w)
					}),
				),
			),
		),
		primaryGreen,
		40,
	)

	leftPanel := container.NewVBox(
		statusCard,
		configCard,
		progressCard,
		quickActionsCard,
		layout.NewSpacer(),
	)

	// ========================================
	// PANEL DERECHO - REGISTRO MEJORADO
	// ========================================
	logBox := widget.NewMultiLineEntry()
	logBox.Wrapping = fyne.TextWrapWord
	logBox.Disable()

	addLog := func(msg string) {
		current := logBox.Text
		if current != "" {
			current += "\n"
		}
		timestamp := ""
		logBox.SetText(current + timestamp + msg)
	}

	logScroll := container.NewVScroll(logBox)
	logScroll.SetMinSize(fyne.NewSize(400, 0))

	clearLogButton := widget.NewButton("Limpiar Registro", func() {
		logBox.SetText("")
	})
	clearLogButton.Importance = widget.LowImportance

	logHeader := container.NewBorder(
		nil, nil,
		createSectionTitle("REGISTRO DE ACTIVIDAD", successGreen),
		clearLogButton,
	)

	logCard := createCard(
		container.NewBorder(
			logHeader,
			nil, nil, nil,
			container.NewPadded(logScroll),
		),
		successGreen,
		50,
	)

	// ========================================
	// LAYOUT PRINCIPAL CON MEJOR DISTRIBUCIÓN
	// ========================================
	split := container.NewHSplit(
		container.NewPadded(leftPanel),
		container.NewPadded(logCard),
	)
	split.Offset = 0.45

	mainContent := container.NewBorder(
		header,
		nil, nil, nil,
		split,
	)

	// Fondo con textura sutil
	background := canvas.NewRectangle(backgroundDark)
	finalContent := container.NewStack(background, mainContent)

	w.SetContent(finalContent)
	w.Show()

	// ========================================
	// MONITOREO USB
	// ========================================
	events := make(chan usb.USBEvent)
	go usb.WatchUSB(events)

	// ========================================
	// OBTENER REGLAS
	// ========================================
	go func() {
		addLog("Conectando con servidor de reglas...")
		updateIndicatorColor(statusIndicator, statusGlow, primaryYellow)

		r, err := rules.FetchRules()
		if err != nil {
			statusBind.Set("Error al obtener reglas del servidor")
			addLog("ERROR al obtener reglas: " + err.Error())
			updateIndicatorColor(statusIndicator, statusGlow, errorRed)
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
		addLog("Reglas sincronizadas correctamente")
		addLog(fmt.Sprintf("Extensiones permitidas: %v", ext))
		statusBind.Set("Sistema listo - Esperando dispositivo USB...")
		updateIndicatorColor(statusIndicator, statusGlow, successGreen)
	}()

	// ========================================
	// MANEJO DE EVENTOS USB
	// ========================================
	go func() {
		for ev := range events {
			if ev.Path == "" {
				statusBind.Set("Sistema listo - Esperando dispositivo USB...")
				updateIndicatorColor(statusIndicator, statusGlow, successGreen)
				addLog("Dispositivo USB desconectado")
				continue
			}

			usbPath := ev.Path
			statusBind.Set("Dispositivo USB detectado")
			updateIndicatorColor(statusIndicator, statusGlow, accentBlue)
			addLog("USB detectada en: " + usbPath)

			dialog.NewConfirm(
				"Confirmar Respaldo",
				fmt.Sprintf("¿Deseas iniciar la copia de seguridad?\n\nUSB detectada:\n%s", usbPath),
				func(ok bool) {
					if !ok {
						statusBind.Set("Sistema listo - Esperando dispositivo USB...")
						updateIndicatorColor(statusIndicator, statusGlow, successGreen)
						addLog("Copia cancelada por el usuario")
						return
					}

					dest, _ := destBind.Get()
					progress := make(chan copy.CopyProgress)
					globalProgress.SetValue(0)
					progressLabel.Text = "0%"
					progressLabel.Refresh()
					currentFileLabel.SetText("Analizando dispositivo...")
					statusBind.Set("Preparando copia...")
					updateIndicatorColor(statusIndicator, statusGlow, primaryYellow)
					addLog("Destino de copia: " + dest)

					totalFiles := copy.CountAllowedFiles(usbPath)
					if totalFiles == 0 {
						statusBind.Set("Sistema listo - Esperando dispositivo USB...")
						updateIndicatorColor(statusIndicator, statusGlow, successGreen)
						addLog("No hay archivos permitidos que copiar")
						currentFileLabel.SetText("Esperando inicio de copia...")
						dialog.ShowInformation(
							"Sin Archivos",
							"No se encontraron archivos con extensiones permitidas.",
							w,
						)
						return
					}

					addLog(fmt.Sprintf("Total de archivos a copiar: %d", totalFiles))
					statusBind.Set("Copiando archivos...")

					var finished float64 = 0

					go func() {
						for p := range progress {
							if p.Error != nil {
								addLog("ERROR en " + p.FileName + ": " + p.Error.Error())
								statusBind.Set("Error en copia")
								updateIndicatorColor(statusIndicator, statusGlow, errorRed)
								continue
							}

							if p.Done {
								finished++
								percentage := (finished / float64(totalFiles)) * 100
								globalProgress.SetValue(finished / float64(totalFiles))
								progressLabel.Text = fmt.Sprintf("%.0f%%", percentage)
								progressLabel.Refresh()
								statsLabel.Text = fmt.Sprintf("Archivo %d de %d", int(finished), totalFiles)
								statsLabel.Refresh()
								addLog(fmt.Sprintf("Completado [%.0f%%]: %s", percentage, p.FileName))

								if finished == float64(totalFiles) {
									statusBind.Set("Copia completada exitosamente")
									updateIndicatorColor(statusIndicator, statusGlow, successGreen)
									currentFileLabel.SetText("Proceso finalizado con éxito")
									addLog("Backup completado exitosamente")
									addLog(fmt.Sprintf("Total: %d archivos copiados", totalFiles))

									dialog.ShowInformation(
										"Copia Completada",
										fmt.Sprintf("Se han copiado %d archivos exitosamente.", totalFiles),
										w,
									)
								}
								continue
							}

							currentFileLabel.SetText(fmt.Sprintf(
								"Copiando: %s (%d MB / %d MB)",
								p.FileName,
								p.BytesCopied/1024/1024,
								p.TotalBytes/1024/1024,
							))

							statusBind.Set(fmt.Sprintf(
								"Copiando %s... %d/%d MB",
								p.FileName,
								p.BytesCopied/1024/1024,
								p.TotalBytes/1024/1024,
							))
						}
					}()

					go copy.CopyUSB(usbPath, dest, progress)
				},
				w,
			).Show()
		}
	}()

	a.Run()
}
