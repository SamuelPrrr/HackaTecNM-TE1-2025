package copy

import (
	"path/filepath"
)

func StartCopyWorker(usbPath string, dest string, updateStatus func(string)) {
    updateStatus("Escaneando USB...")

    files, err := ScanDir(usbPath)
    if err != nil {
        updateStatus("Error leyendo USB")
        return
    }

    for _, f := range files {
        dst := filepath.Join(dest, filepath.Base(f))

        updateStatus("Copiando " + filepath.Base(f))

        err := CopyFile(f, dst)
        if err != nil {
            updateStatus("Error copiando " + filepath.Base(f))
        }
    }

    updateStatus("Copia completada")
}
