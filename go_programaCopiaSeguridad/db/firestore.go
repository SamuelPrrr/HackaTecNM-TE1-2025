package db

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"go_programaCopiaSeguridad/metadata"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

var client *firestore.Client
var ctx context.Context

// Struct auxiliar solo para leer el ID del archivo
type serviceAccountJSON struct {
	ProjectID string `json:"project_id"`
}

// InitFirestore conecta SIN URL, solo usando el archivo
func InitFirestore(credPath string) error {
	ctx = context.Background()

	// 1. Leemos el archivo para sacar el ID del proyecto
	content, err := os.ReadFile(credPath)
	if err != nil {
		return fmt.Errorf("no se encontró archivo credenciales: %v", err)
	}

	var sa serviceAccountJSON
	if err := json.Unmarshal(content, &sa); err != nil {
		return fmt.Errorf("json inválido: %v", err)
	}

	if sa.ProjectID == "" {
		return fmt.Errorf("el archivo json no tiene 'project_id'")
	}

	fmt.Println("FYI: Conectando al proyecto ID:", sa.ProjectID)

	// 2. Conectamos usando solo el ID y el archivo. ¡Sin URL!
	client, err = firestore.NewClient(ctx, sa.ProjectID, option.WithCredentialsFile(credPath))
	if err != nil {
		return fmt.Errorf("error al conectar con Firestore: %v", err)
	}

	return nil
}

// UploadMetadata sube los datos a la colección "metadata"
func UploadMetadata(meta *metadata.VideoMetadata) error {
	if client == nil {
		return fmt.Errorf("cliente Firestore no inicializado")
	}

	// Limpiamos el nombre para que sea un ID de documento válido
	safeID := sanitizeKey(meta.FileName)

	// Colección: metadata -> Documento: nombre_archivo -> Campos: {json}
	// .Set crea o sobrescribe
	_, err := client.Collection("metadata").Doc(safeID).Set(ctx, meta)

	return err
}

func sanitizeKey(name string) string {
	// Firestore no permite barras en los IDs
	return strings.ReplaceAll(name, "/", "_")
}

func Close() {
	if client != nil {
		client.Close()
	}
}
