package parser

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Parse parses a .vyb test file and returns the test definitions
func Parse(filename string) (*TestFile, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	return ParseBytes(filename, data)
}

// ParseBytes parses test data from bytes
func ParseBytes(filename string, data []byte) (*TestFile, error) {
	// Try new format first: test name as key
	var testsMap map[string]TestConfig
	if err := yaml.Unmarshal(data, &testsMap); err == nil && len(testsMap) > 0 {
		// Check if this looks like the new format (no "test" key, has test-like keys)
		if _, hasOldFormat := testsMap["test"]; !hasOldFormat {
			return parseNewFormat(filename, testsMap)
		}
	}

	// Fall back to old format: single test with "test:" key
	return parseOldFormat(filename, data)
}

// TestConfig represents a test configuration (without the name, which is the key)
type TestConfig struct {
	Confidence float64                `yaml:"confidence"`
	Given      map[string]interface{} `yaml:"given"`
	When       []string               `yaml:"when"`
	Then       []string               `yaml:"then"`
}

// parseNewFormat parses the new format: test name as key
func parseNewFormat(filename string, testsMap map[string]TestConfig) (*TestFile, error) {
	var tests []Test

	for name, config := range testsMap {
		// Skip keys that don't look like tests (e.g., metadata)
		if len(config.When) == 0 && len(config.Then) == 0 {
			continue
		}

		test := Test{
			Name:       name,
			Confidence: config.Confidence,
			Given:      config.Given,
			When:       config.When,
			Then:       config.Then,
		}

		// Default confidence
		if test.Confidence == 0 {
			test.Confidence = 1.0
		}

		// Validate
		if test.Name == "" {
			return nil, fmt.Errorf("test must have a name")
		}
		if len(test.When) == 0 {
			return nil, fmt.Errorf("test '%s' must have 'when' statements", test.Name)
		}
		if len(test.Then) == 0 {
			return nil, fmt.Errorf("test '%s' must have 'then' assertions", test.Name)
		}

		tests = append(tests, test)
	}

	if len(tests) == 0 {
		return nil, fmt.Errorf("no valid tests found in file")
	}

	return &TestFile{
		Filename: filename,
		Tests:    tests,
	}, nil
}

// parseOldFormat parses the old format: single test with "test:" key
func parseOldFormat(filename string, data []byte) (*TestFile, error) {
	var testData struct {
		Test Test `yaml:"test"`
	}

	if err := yaml.Unmarshal(data, &testData); err != nil {
		return nil, fmt.Errorf("failed to parse YAML: %w", err)
	}

	// Validate test
	if testData.Test.Name == "" {
		return nil, fmt.Errorf("test must have a name")
	}

	// Default confidence if not specified
	if testData.Test.Confidence == 0 {
		testData.Test.Confidence = 1.0
	}

	return &TestFile{
		Filename: filename,
		Tests:    []Test{testData.Test},
	}, nil
}
