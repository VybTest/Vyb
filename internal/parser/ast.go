package parser

// TestFile represents a parsed .vyb file containing tests
type TestFile struct {
	Filename string
	Tests    []Test
}

// Test represents a single test case
type Test struct {
	Name       string                 `yaml:"name"`
	Confidence float64                `yaml:"confidence"`
	Given      map[string]interface{} `yaml:"given"`
	When       []string               `yaml:"when"`
	Then       []string               `yaml:"then"`
	LLMVerify  *LLMVerification       `yaml:"llm_verify,omitempty"`
}

// LLMVerification represents natural language verification
type LLMVerification struct {
	Prompt              string                 `yaml:"prompt"`
	Context             map[string]interface{} `yaml:"context"`
	ConfidenceThreshold float64                `yaml:"confidence_threshold"`
}

// TestResult represents the result of running a test
type TestResult struct {
	Name       string
	Passed     bool
	Error      string
	Duration   int64 // nanoseconds
	Confidence float64
	Actual     interface{} // Actual value when expectation fails
	Expected   interface{} // Expected value when expectation fails
}
