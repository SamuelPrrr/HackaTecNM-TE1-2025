package metadata

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"time"
)

// VideoMetadata: Estructura principal
type VideoMetadata struct {
	FileName    string  `json:"file_name"`
	FileSize    int64   `json:"file_size"`
	Duration    float64 `json:"duration"` // en segundos
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	VideoCodec  string  `json:"video_codec"`
	AudioCodec  string  `json:"audio_codec"`
	FrameRate   string  `json:"frame_rate"`
	BitRate     int     `json:"bit_rate"`
	Channels    int     `json:"channels"`
	SampleRate  int     `json:"sample_rate"`
	CreatedTime string  `json:"created_time"`

	// Campos GPS
	HasGPS    bool    `json:"has_gps"`
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`

	// Campo para la miniatura en Base64
	HeaderImage string `json:"header_image,omitempty"`
}

// Estructuras internas para mapear el JSON crudo de FFprobe
type ffprobeOutput struct {
	Streams []ffprobeStream `json:"streams"`
	Format  ffprobeFormat   `json:"format"`
}

type ffprobeStream struct {
	CodecType    string `json:"codec_type"`
	CodecName    string `json:"codec_name"`
	Width        int    `json:"width,omitempty"`
	Height       int    `json:"height,omitempty"`
	AvgFrameRate string `json:"avg_frame_rate,omitempty"`
	Channels     int    `json:"channels,omitempty"`
	SampleRate   string `json:"sample_rate,omitempty"`
}

type ffprobeFormat struct {
	Filename string            `json:"filename"`
	Size     string            `json:"size"`
	Duration string            `json:"duration"`
	BitRate  string            `json:"bit_rate"`
	Tags     map[string]string `json:"tags"`
}

// =========================================================
// Funciones Públicas
// =========================================================

// LoadMetadataFromJSON: Lee un JSON del disco y lo convierte a estructura Go
func LoadMetadataFromJSON(path string) (*VideoMetadata, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var meta VideoMetadata
	err = json.Unmarshal(data, &meta)
	return &meta, nil
}

// AttachThumbnail: Busca el JPG comprimido, lo convierte a Base64 y lo adjunta
func AttachThumbnail(meta *VideoMetadata, folderPath string) error {
	// Calculamos la ruta del JPG (video.mp4 -> video.jpg)
	ext := filepath.Ext(meta.FileName)
	baseName := meta.FileName[:len(meta.FileName)-len(ext)]
	// CAMBIO: Ahora buscamos .jpg en lugar de .png
	jpgPath := filepath.Join(folderPath, baseName+".jpg")

	// Leer archivo
	bytes, err := os.ReadFile(jpgPath)
	if err != nil {
		return err
	}

	// Convertir a Base64 y agregar prefijo estándar web para JPG
	base64Str := base64.StdEncoding.EncodeToString(bytes)
	// CAMBIO: image/jpeg
	meta.HeaderImage = "data:image/jpeg;base64," + base64Str

	return nil
}

// ExtractMetadata utiliza ffprobe para extraer datos técnicos y GPS
func ExtractMetadata(filePath string) (*VideoMetadata, error) {
	cmd := exec.Command("ffprobe",
		"-v", "quiet",
		"-print_format", "json",
		"-show_format",
		"-show_streams",
		filePath,
	)

	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("error ejecutando ffprobe: %v", err)
	}

	var data ffprobeOutput
	if err := json.Unmarshal(output, &data); err != nil {
		return nil, fmt.Errorf("error parseando json de ffprobe: %v", err)
	}

	meta := &VideoMetadata{
		FileName: filepath.Base(filePath),
	}

	if size, err := strconv.ParseInt(data.Format.Size, 10, 64); err == nil {
		meta.FileSize = size
	}
	if dur, err := strconv.ParseFloat(data.Format.Duration, 64); err == nil {
		meta.Duration = dur
	}
	if br, err := strconv.Atoi(data.Format.BitRate); err == nil {
		meta.BitRate = br
	}

	geoString := ""
	if val, ok := data.Format.Tags["location"]; ok {
		geoString = val
	} else if val, ok := data.Format.Tags["com.apple.quicktime.location.ISO6709"]; ok {
		geoString = val
	} else if val, ok := data.Format.Tags["xyz"]; ok {
		geoString = val
	}

	if geoString != "" {
		lat, long, found := parseISO6709(geoString)
		if found {
			meta.HasGPS = true
			meta.Latitude = lat
			meta.Longitude = long
		}
	}

	if val, ok := data.Format.Tags["creation_time"]; ok {
		meta.CreatedTime = val
	} else {
		meta.CreatedTime = time.Now().Format(time.RFC3339)
	}

	for _, stream := range data.Streams {
		if stream.CodecType == "video" {
			meta.VideoCodec = stream.CodecName
			meta.Width = stream.Width
			meta.Height = stream.Height
			meta.FrameRate = stream.AvgFrameRate
		} else if stream.CodecType == "audio" {
			meta.AudioCodec = stream.CodecName
			meta.Channels = stream.Channels
			if sr, err := strconv.Atoi(stream.SampleRate); err == nil {
				meta.SampleRate = sr
			}
		}
	}

	return meta, nil
}

// GenerateThumbnail crea miniatura JPG, Redimensionada y Optimizada
func GenerateThumbnail(videoPath string, outputDir string) (string, error) {
	fileName := filepath.Base(videoPath)
	ext := filepath.Ext(fileName)
	nameWithoutExt := fileName[:len(fileName)-len(ext)]
	// CAMBIO: Extensión .jpg
	jpgPath := filepath.Join(outputDir, nameWithoutExt+".jpg")

	// CAMBIO DE ESTRATEGIA: JPG Optimizado para web/DB
	// -ss 00:00:01     : Buscar el segundo 1
	// -i ...           : Input
	// -vf scale=640:-1 : Redimensionar ancho a 640px (altura automática). ¡CLAVE PARA EL TAMAÑO!
	// -vframes 1       : Solo 1 cuadro
	// -q:v 5           : Calidad JPG (1=Mejor, 31=Peor). 5 es muy buena calidad pero mucho menos peso que un PNG.

	cmd := exec.Command("ffmpeg", "-y", "-ss", "00:00:01", "-i", videoPath,
		"-vf", "scale=640:-1",
		"-vframes", "1",
		"-q:v", "5",
		jpgPath)

	if err := cmd.Run(); err != nil {
		// Fallback: Si el video dura menos de 1s, usar el frame inicial, manteniendo optimización
		cmd = exec.Command("ffmpeg", "-y", "-i", videoPath,
			"-vf", "scale=640:-1",
			"-vframes", "1",
			"-q:v", "5",
			jpgPath)

		if err := cmd.Run(); err != nil {
			return "", err
		}
	}
	return jpgPath, nil
}

// SaveMetadataToJSON guarda la estructura a archivo
func SaveMetadataToJSON(meta *VideoMetadata, outputDir string) (string, error) {
	jsonBytes, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return "", err
	}
	ext := filepath.Ext(meta.FileName)
	base := meta.FileName[:len(meta.FileName)-len(ext)]
	jsonPath := filepath.Join(outputDir, base+"_metadata.json")
	err = os.WriteFile(jsonPath, jsonBytes, 0644)
	return jsonPath, err
}

func parseISO6709(geo string) (float64, float64, bool) {
	re := regexp.MustCompile(`([+-]\d+\.\d+)([+-]\d+\.\d+)`)
	matches := re.FindStringSubmatch(geo)
	if len(matches) >= 3 {
		lat, err1 := strconv.ParseFloat(matches[1], 64)
		long, err2 := strconv.ParseFloat(matches[2], 64)
		if err1 == nil && err2 == nil {
			return lat, long, true
		}
	}
	return 0, 0, false
}
