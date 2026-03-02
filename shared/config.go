package shared

import "os"

type ModelConfig struct {
	BaseURL string `json:"base_url"`
	ApiKey  string `json:"api_key"`
	Model   string `json:"model"`

	ContextWindow int `json:"context_window"`
}

func NewModelConfig() ModelConfig {
	return ModelConfig{
		BaseURL:       getEnvDefault("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		ApiKey:        getEnvDefault("OPENAI_API_KEY", ""),
		Model:         getEnvDefault("OPENAI_MODEL", "gpt-5.2"),
		ContextWindow: 200000,
	}
}

func getEnvDefault(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}
