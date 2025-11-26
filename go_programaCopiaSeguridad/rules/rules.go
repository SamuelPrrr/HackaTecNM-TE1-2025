package rules

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type SortingRules struct {
	Order       string   `json:"order"`
	GroupBy     string   `json:"group_by"`
	Extensions  []string `json:"extensions"`
	UpdatedAt   string   `json:"updated_at"`
	CopyMode    string   `json:"copy_mode"`
}

// FetchRules descarga las reglas desde el servidor maestro
func FetchRules() (*SortingRules, error) {

	url := "http://3.16.128.82:5000/sorting-rules"
	log.Printf("[RULES] Conectando al servidor: %s", url)

	client := http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		log.Printf("[RULES] ERROR: No se pudo conectar al servidor: %v", err)
		return nil, fmt.Errorf("error al conectar con servidor: %w", err)
	}
	defer resp.Body.Close()

	log.Printf("[RULES] Respuesta del servidor: %d", resp.StatusCode)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("servidor respondió: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta: %w", err)
	}

	var r SortingRules
	err = json.Unmarshal(body, &r)
	if err != nil {
		log.Printf("[RULES] ERROR: No se pudo parsear JSON: %v", err)
		return nil, fmt.Errorf("error parseando JSON: %w", err)
	}

	log.Printf("[RULES] ✓ Reglas obtenidas exitosamente")
	log.Printf("[RULES]   - Order: %s", r.Order)
	log.Printf("[RULES]   - GroupBy: %s", r.GroupBy)
	log.Printf("[RULES]   - CopyMode: %s", r.CopyMode)
	log.Printf("[RULES]   - Extensions: %v", r.Extensions)
	log.Printf("[RULES]   - Updated: %s", r.UpdatedAt)

	return &r, nil
}
