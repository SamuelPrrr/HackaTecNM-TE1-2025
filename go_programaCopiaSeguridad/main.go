package main

//import "fmt" //paquete inicial para formatear textos y salida estándar de archivos

import (
	"fmt"
	"go_programaCopiaSeguridad/usb"
	"log"

	"fyne.io/fyne/v2/app" //Implementaciones para interfaces
	"fyne.io/fyne/v2/widget"
)

func main(){
	myApp := app.New()
	w := myApp.NewWindow("H")

	w.SetContent(widget.NewLabel("¡Fyne esta funcionando"))

	w.ShowAndRun()

	events := make(chan usb.USBEvent)

    go usb.WatchUSB(events)

    log.Println("Esperando conexión USB...")

    for ev := range events {
        fmt.Println("USB detectada en ruta:", ev.Path)
    }
}
