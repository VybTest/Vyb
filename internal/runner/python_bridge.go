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

// PythonBridge handles executing external Python functions
type PythonBridge struct {
	config     *parser.Config
	bridgeCode string
}

// NewPythonBridge creates a new Python bridge with the given config
func NewPythonBridge(config *parser.Config) (*PythonBridge, error) {
	if config == nil {
		return nil, fmt.Errorf("config cannot be nil")
	}

	bridgeCode, err := generatePythonBridgeScript(config.Modules)
	if err != nil {
		return nil, err
	}

	return &PythonBridge{
		config:     config,
		bridgeCode: bridgeCode,
	}, nil
}

// Call executes an external Python function
func (pb *PythonBridge) Call(functionName string, args []interface{}) (interface{}, error) {
	// Ensure args is never nil (use empty array instead)
	if args == nil {
		args = []interface{}{}
	}

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
	bridgeFile := filepath.Join(tmpDir, "vyb_bridge.py")
	if err := os.WriteFile(bridgeFile, []byte(pb.bridgeCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write bridge script: %w", err)
	}
	defer os.Remove(bridgeFile)

	// Execute Python with the bridge script
	cmd := exec.Command("python3", bridgeFile, string(requestJSON))
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Try 'python' if 'python3' not found
		cmd = exec.Command("python", bridgeFile, string(requestJSON))
		output, err = cmd.CombinedOutput()
		if err != nil {
			return nil, fmt.Errorf("python execution failed: %w\nOutput: %s", err, string(output))
		}
	}

	// Parse response
	var response struct {
		Result interface{} `json:"result"`
		Error  string      `json:"error"`
	}

	if err := json.Unmarshal(output, &response); err != nil {
		return nil, fmt.Errorf("failed to parse python response: %w\nOutput: %s", err, string(output))
	}

	if response.Error != "" {
		return nil, fmt.Errorf("external function error: %s", response.Error)
	}

	return response.Result, nil
}

// generatePythonBridgeScript creates the Python bridge script that imports modules and calls functions
func generatePythonBridgeScript(modules []string) (string, error) {
	var sysPaths []string
	var imports []string
	var functionMerges []string

	for i, module := range modules {
		// Get directory and module name from absolute path
		dir := filepath.Dir(module)
		baseName := filepath.Base(module)
		moduleName := strings.TrimSuffix(baseName, ".py")

		// Add directory to sys.path (normalized to forward slashes for Python)
		pythonPath := strings.ReplaceAll(dir, "\\", "/")
		sysPaths = append(sysPaths, fmt.Sprintf("sys.path.insert(0, %q)", pythonPath))

		// Import just the module name
		imports = append(imports, fmt.Sprintf("import %s as module%d", moduleName, i))
		functionMerges = append(functionMerges, fmt.Sprintf("functions.update({name: getattr(module%d, name) for name in dir(module%d) if callable(getattr(module%d, name)) and not name.startswith('_')})", i, i, i))
	}

	script := `#!/usr/bin/env python3
# Vyb Python Bridge - Auto-generated
# This script imports your modules and executes function calls from Vyb tests

import json
import sys

# Add module directories to Python path
` + strings.Join(sysPaths, "\n") + `

# Import modules
` + strings.Join(imports, "\n") + `

# Merge all exports into a single function registry
functions = {}
` + strings.Join(functionMerges, "\n") + `

# Read request from command line argument
request = json.loads(sys.argv[1])

try:
    # Find and call the function
    fn = functions.get(request['function'])

    if fn is None:
        available = ', '.join(functions.keys())
        raise Exception(f"Function not found: {request['function']}. Available: {available}")

    if not callable(fn):
        raise Exception(f"Not a function: {request['function']}")

    # Call the function with args
    result = fn(*request['args'])

    # Return result as JSON
    print(json.dumps({'result': result}))

except Exception as error:
    # Return error as JSON
    print(json.dumps({'error': str(error)}))
    sys.exit(1)
`

	return script, nil
}
