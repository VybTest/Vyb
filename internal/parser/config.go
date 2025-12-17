package parser

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// Config represents vyb.config.yaml
type Config struct {
	Runtime string   `yaml:"runtime"` // "node", "python", "go", "lua", etc.
	Modules []string `yaml:"modules"` // Paths to modules
}

// LoadConfig reads vyb.config.yaml from the current directory or specified path
func LoadConfig(dir string) (*Config, error) {
	configPath := filepath.Join(dir, "vyb.config.yaml")

	// Check if config exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// No config file - external functions not available
		return nil, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// Validate config
	if config.Runtime == "" {
		config.Runtime = "node" // Default to Node.js
	}

	// Validate runtime
	supportedRuntimes := []string{"node", "python", "go", "lua"}
	validRuntime := false
	for _, rt := range supportedRuntimes {
		if config.Runtime == rt {
			validRuntime = true
			break
		}
	}
	if !validRuntime {
		return nil, fmt.Errorf("unsupported runtime: %s (supported: node, python, go, lua)", config.Runtime)
	}

	// Resolve module paths to absolute paths
	for i, module := range config.Modules {
		absPath, err := filepath.Abs(filepath.Join(dir, module))
		if err != nil {
			return nil, fmt.Errorf("failed to resolve module path %s: %w", module, err)
		}
		config.Modules[i] = absPath
	}

	return &config, nil
}
