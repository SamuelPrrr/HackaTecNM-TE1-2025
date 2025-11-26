package copy

import (
	"io"
	"os"
	"path/filepath"
	"strings"
)

type CopyProgress struct {
	FileName   string
	BytesCopied int64
	TotalBytes  int64
	Done        bool
	Error       error
}

var allowedExtensions = []string{".mp4", ".mkv", ".mov", ".avi", ".mp3", ".wav", ".aac"}

// IsAllowedFile verifica si un archivo tiene extensión permitida
func IsAllowedFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return isAllowed(ext)
}

// CountAllowedFiles cuenta cuántos archivos permitidos hay.
func CountAllowedFiles(root string) int64 {
	var count int64 = 0

	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}

		ext := strings.ToLower(filepath.Ext(info.Name()))
		if isAllowed(ext) {
			count++
		}
		return nil
	})

	return count
}

// CopyFile copia un archivo de origen a destino
func CopyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	os.MkdirAll(filepath.Dir(dst), 0755)
	destination, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}

// SetExtensions permite recibir reglas desde servidor maestro
func SetExtensions(exts []string) {
	allowedExtensions = exts
}

// CopyUSB inicia la copia completa de archivos
func CopyUSB(srcPath, destPath string, progress chan CopyProgress) {
	filepath.Walk(srcPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			progress <- CopyProgress{Error: err}
			return nil
		}

		if info.IsDir() {
			return nil
		}

		// Filtrar por extensión
		ext := strings.ToLower(filepath.Ext(info.Name()))
		if !isAllowed(ext) {
			return nil
		}

		// Crear destino
		destFile := filepath.Join(destPath, info.Name())

		go fastCopy(path, destFile, progress)
		return nil
	})
}

func isAllowed(ext string) bool {
	for _, e := range allowedExtensions {
		if ext == e {
			return true
		}
	}
	return false
}

// fastCopy copia muy rápido usando buffers grandes
func fastCopy(srcFile, destFile string, progress chan CopyProgress) {
	// Abrir archivos
	src, err := os.Open(srcFile)
	if err != nil {
		progress <- CopyProgress{FileName: srcFile, Error: err}
		return
	}
	defer src.Close()

	os.MkdirAll(filepath.Dir(destFile), 0755)
	dst, err := os.Create(destFile)
	if err != nil {
		progress <- CopyProgress{FileName: srcFile, Error: err}
		return
	}
	defer dst.Close()

	// Info total
	info, _ := src.Stat()
	total := info.Size()

	// Buffer grande (8MB)
	buffer := make([]byte, 8*1024*1024)

	var copied int64 = 0

	for {
		n, readErr := src.Read(buffer)
		if n > 0 {
			written, wErr := dst.Write(buffer[:n])
			if wErr != nil {
				progress <- CopyProgress{FileName: srcFile, Error: wErr}
				return
			}
			copied += int64(written)

			// Emitir progreso
			progress <- CopyProgress{
				FileName:    filepath.Base(srcFile),
				BytesCopied: copied,
				TotalBytes:  total,
				Done:        false,
			}
		}

		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			progress <- CopyProgress{FileName: srcFile, Error: readErr}
			return
		}
	}

	// Finalizado
	progress <- CopyProgress{
		FileName: filepath.Base(srcFile),
		Done:     true,
	}

	
}
