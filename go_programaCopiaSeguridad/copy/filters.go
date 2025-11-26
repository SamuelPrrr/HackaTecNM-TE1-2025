package copy

import (
	"os"
	"path/filepath"
)

// ScanDir devuelve los archivos permitidos dentro de un directorio
func ScanDir(root string) ([]string, error) {
    var files []string

    err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if info.IsDir() {
            return nil
        }

        if IsAllowedFile(path) {
            files = append(files, path)
        }

        return nil
    })

    return files, err
}
