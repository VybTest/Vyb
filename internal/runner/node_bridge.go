package runner

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/vybtest/vyb/internal/parser"
)

// NodeBridge handles executing external JavaScript/TypeScript functions via Node.js
type NodeBridge struct {
	config     *parser.Config
	bridgeCode string
}

// NewNodeBridge creates a new Node.js bridge with the given config
func NewNodeBridge(config *parser.Config) (*NodeBridge, error) {
	if config == nil {
		return nil, fmt.Errorf("config cannot be nil")
	}

	bridgeCode, err := generateBridgeScript(config.Modules)
	if err != nil {
		return nil, err
	}

	return &NodeBridge{
		config:     config,
		bridgeCode: bridgeCode,
	}, nil
}

// Call executes an external function via Node.js
func (nb *NodeBridge) Call(functionName string, args []interface{}) (interface{}, error) {
	// Create request payload
	request := map[string]interface{}{
		"function": functionName,
		"args":     args,
	}

	requestJSON, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Write bridge script to temp file
	tmpDir := os.TempDir()
	bridgeFile := filepath.Join(tmpDir, "vyb_bridge.js")
	if err := os.WriteFile(bridgeFile, []byte(nb.bridgeCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write bridge script: %w", err)
	}
	defer os.Remove(bridgeFile)

	// Execute Node.js with the bridge script
	cmd := exec.Command("node", bridgeFile, string(requestJSON))
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("node execution failed: %w\nOutput: %s", err, string(output))
	}

	// Parse response
	var response struct {
		Result interface{} `json:"result"`
		Error  string      `json:"error"`
	}

	if err := json.Unmarshal(output, &response); err != nil {
		return nil, fmt.Errorf("failed to parse node response: %w\nOutput: %s", err, string(output))
	}

	if response.Error != "" {
		return nil, fmt.Errorf("external function error: %s", response.Error)
	}

	return response.Result, nil
}

// generateBridgeScript creates the Node.js bridge script that imports modules and calls functions
func generateBridgeScript(modules []string) (string, error) {
	var imports []string
	for i, module := range modules {
		// Convert Windows paths to forward slashes for Node.js
		modulePath := strings.ReplaceAll(module, "\\", "/")
		imports = append(imports, fmt.Sprintf("const module%d = require('%s');", i, modulePath))
	}

	script := `#!/usr/bin/env node
// Vyb Node.js Bridge - Auto-generated
// This script imports your modules and executes function calls from Vyb tests

` + strings.Join(imports, "\n") + `

// Merge all exports into a single function registry
const functions = {};
` + func() string {
		var merges []string
		for i := range modules {
			merges = append(merges, fmt.Sprintf("Object.assign(functions, module%d);", i))
		}
		return strings.Join(merges, "\n")
	}() + `

// Read request from command line argument
const request = JSON.parse(process.argv[2]);

try {
  // Find and call the function
  const fn = functions[request.function];

  if (!fn) {
    throw new Error('Function not found: ' + request.function + '. Available: ' + Object.keys(functions).join(', '));
  }

  if (typeof fn !== 'function') {
    throw new Error('Not a function: ' + request.function);
  }

  // Call the function with args
  const result = fn(...request.args);

  // Return result as JSON
  console.log(JSON.stringify({ result: result }));

} catch (error) {
  // Return error as JSON
  console.log(JSON.stringify({ error: error.message }));
  process.exit(1);
}
`

	return script, nil
}
