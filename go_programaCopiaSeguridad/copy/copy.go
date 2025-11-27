package copy

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"go_programaCopiaSeguridad/metadata"
)

type CopyProgress struct {
	FileName      string
	BytesCopied   int64
	TotalBytes    int64
	Done          bool
	Error         error
	MetadataReady bool
}

// =================================================================================
// CONFIGURACIÓN DE EXTENSIONES
// =================================================================================

var allowedExtensions = []string{
	// Video
	".mp4", ".mkv", ".mov", ".avi", ".flv", ".wmv", ".m4v", ".mpg", ".mpeg", ".3gp", ".webm",
	// Imágenes
	".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff",
	// Audio
	".mp3", ".wav", ".aac",
}

var videoExtensions = []string{".mp4", ".mkv", ".mov", ".avi", ".flv", ".wmv", ".m4v", ".mpg", ".mpeg", ".3gp", ".webm"}

func IsAllowedFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	for _, e := range allowedExtensions {
		if ext == e {
			return true
		}
	}
	return false
}

func IsVideoFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	for _, videoExt := range videoExtensions {
		if ext == videoExt {
			return true
		}
	}
	return false
}

func CountAllowedFiles(root string) int64 {
	var count int64 = 0
	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if IsAllowedFile(info.Name()) {
			count++
		}
		return nil
	})
	return count
}

func SetExtensions(exts []string) {
	allowedExtensions = exts
}

// =================================================================================
// FUNCIONES DE COPIA
// =================================================================================

// CopyFile: Función auxiliar básica
func CopyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	destination, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}

func CopyUSB(srcPath, destPath string, progress chan CopyProgress) {
	defer close(progress)
	filepath.Walk(srcPath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if !IsAllowedFile(info.Name()) {
			return nil
		}

		relPath, _ := filepath.Rel(srcPath, path)
		destFile := filepath.Join(destPath, relPath)
		performCopy(path, destFile, progress)
		return nil
	})
}

// CopyUSBWithMetadata: Copia y procesa metadatos
func CopyUSBWithMetadata(srcPath, destPath string, progress chan CopyProgress) {
	defer close(progress)

	metadataDir := filepath.Join(destPath, "_metadata")
	os.MkdirAll(metadataDir, 0755)

	allMetadata := make(map[string]*metadata.VideoMetadata)
	var metaMutex sync.Mutex
	var wg sync.WaitGroup

	// SEMÁFORO: 4 procesos concurrentes
	concurrencyLimit := 4
	sem := make(chan struct{}, concurrencyLimit)

	filepath.Walk(srcPath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if !IsAllowedFile(info.Name()) {
			return nil
		}

		relPath, _ := filepath.Rel(srcPath, path)
		destFile := filepath.Join(destPath, relPath)
		isVideo := IsVideoFile(path)

		wg.Add(1)
		go func(srcP, destP string, isVid bool, relativePath string) {
			defer wg.Done()

			sem <- struct{}{}
			defer func() { <-sem }()

			// 1. Copia física
			performCopy(srcP, destP, progress)

			// 2. Extracción Metadata (Solo Video)
			if isVid {
				// Usamos el archivo DESTINO para metadata (más seguro si USB falla)
				meta, err := metadata.ExtractMetadata(destP)
				if err == nil {
					meta.FileName = filepath.Base(destP)
					// Generar PNG y guardar JSON
					_, errThumb := metadata.GenerateThumbnail(destP, metadataDir)
					_, errJSON := metadata.SaveMetadataToJSON(meta, metadataDir)

					if errThumb == nil && errJSON == nil {
						metaMutex.Lock()
						allMetadata[relativePath] = meta
						metaMutex.Unlock()

						progress <- CopyProgress{
							FileName:      filepath.Base(destP),
							MetadataReady: true,
						}
					}
				}
			}
		}(path, destFile, isVideo, relPath)
		return nil
	})

	wg.Wait()

	if len(allMetadata) > 0 {
		idxPath := filepath.Join(metadataDir, "metadata_index.json")
		if data, err := json.MarshalIndent(allMetadata, "", "  "); err == nil {
			os.WriteFile(idxPath, data, 0644)
		}
	}
}

// performCopy: Corrección CRÍTICA del Panic aquí
func performCopy(srcFile, destFile string, progress chan CopyProgress) {
	src, err := os.Open(srcFile)
	if err != nil {
		progress <- CopyProgress{FileName: filepath.Base(srcFile), Error: err}
		return
	}
	defer src.Close()

	// Crear carpeta si no existe
	if err := os.MkdirAll(filepath.Dir(destFile), 0755); err != nil {
		progress <- CopyProgress{FileName: filepath.Base(srcFile), Error: err}
		return
	}

	dst, err := os.Create(destFile)
	if err != nil {
		progress <- CopyProgress{FileName: filepath.Base(srcFile), Error: err}
		return
	}
	defer dst.Close()

	// FIX: Verificar Stats antes de usarlos para evitar Panic (nil pointer)
	info, errStat := src.Stat()
	var total int64
	if errStat != nil {
		// Si falla Stat, intentamos copiar sin saber el progreso exacto
		total = 0
	} else {
		total = info.Size()
	}

	// Buffer de 4MB
	buffer := make([]byte, 4*1024*1024)
	var copied int64 = 0

	for {
		n, readErr := src.Read(buffer)
		if n > 0 {
			written, wErr := dst.Write(buffer[:n])
			if wErr != nil {
				progress <- CopyProgress{FileName: filepath.Base(srcFile), Error: wErr}
				return
			}
			copied += int64(written)

			// Solo reportar si tenemos un total válido para evitar dividir por 0
			if total > 0 {
				progress <- CopyProgress{
					FileName:    filepath.Base(srcFile),
					BytesCopied: copied,
					TotalBytes:  total,
					Done:        false,
				}
			}
		}

		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			progress <- CopyProgress{FileName: filepath.Base(srcFile), Error: readErr}
			return
		}
	}

	progress <- CopyProgress{FileName: filepath.Base(srcFile), Done: true}
}
