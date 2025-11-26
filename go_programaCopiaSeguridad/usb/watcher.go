package usb

// Tipo de evento de USB
type USBEvent struct {
    Path string
    Type USBEventType
}

// Valores del tipo de evento
type USBEventType int

const (
    EventAdd USBEventType = iota
    EventRemove
)
