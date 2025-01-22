package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

// Request payload structure
type DashboardRequest struct {
	DashboardID  string                   `json:"dashboard_id"`
	DatasourceID string                   `json:"datasource_id"`
	Variables    map[string][]interface{} `json:"variables"`
}

// Config file structure
type Config struct {
	BaseUrl      string `json:"base_url"`
	Org          string `json:"org"`
	RefreshToken string `json:"refresh_token"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/embed-token", handleDashboard)
	// cors.Default() setup the middleware with default options being
	// all origins accepted with simple methods (GET, POST). See
	// documentation below for more options.
	handler := cors.Default().Handler(mux)
	log.Printf("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read and unmarshal request body
	var dashReq DashboardRequest
	if err := json.NewDecoder(r.Body).Decode(&dashReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Read config file
	config, err := readConfig()
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Error reading config: %v", err)
		return
	}

	// Make API call directly with refresh token
	resp, err := makeAPICall(config, dashReq)
	if err != nil {
		http.Error(w, "Error making API call", http.StatusInternalServerError)
		log.Printf("Error making API call: %v", err)
		return
	}

	// Copy API response to client response
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
	defer resp.Body.Close()
}

func readConfig() (*Config, error) {
	file, err := os.ReadFile("config.json")
	if err != nil {
		return nil, fmt.Errorf("error reading config file: %w", err)
	}

	var config Config
	if err := json.Unmarshal(file, &config); err != nil {
		return nil, fmt.Errorf("error unmarshalling config: %w", err)
	}

	return &config, nil
}

func makeAPICall(config *Config, dashReq DashboardRequest) (*http.Response, error) {
	if config.BaseUrl == "" {
		// The default value for the base URL is https://app.last9.io
		config.BaseUrl = "https://app.last9.io"
	}
	if config.Org == "" {
		return nil, fmt.Errorf("org is required")
	}
	if config.RefreshToken == "" {
		return nil, fmt.Errorf("refresh_token is required")
	}

	// Endpoint for getting dashboard embed token
	apiURL := fmt.Sprintf("%s/api/v4/oauth/organizations/%s/dashboard/embed_token", config.BaseUrl, config.Org)

	jsonPayload, err := json.Marshal(dashReq)
	if err != nil {
		return nil, fmt.Errorf("error marshalling dashboard request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+config.RefreshToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
}
