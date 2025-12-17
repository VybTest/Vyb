package runner

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/vybtest/vyb/internal/parser"
	"gopkg.in/yaml.v3"
)

// ANSI color codes for pretty output
const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorCyan   = "\033[36m"
	colorGray   = "\033[90m"
	colorBold   = "\033[1m"
)

// OutputFormat specifies how to display test results
type OutputFormat string

const (
	OutputPretty  OutputFormat = "pretty"
	OutputJSON    OutputFormat = "json"
	OutputSuggest OutputFormat = "suggest" // Rich JSON with code snippets and AI hints
)

// TestSummary contains overall test run statistics
type TestSummary struct {
	Total              int     `json:"total" yaml:"total"`
	Passed             int     `json:"passed" yaml:"passed"`
	Failed             int     `json:"failed" yaml:"failed"`
	Duration           float64 `json:"duration_seconds" yaml:"duration_seconds"`
	AverageConfidence  float64 `json:"average_confidence" yaml:"average_confidence"`
	MinConfidence      float64 `json:"min_confidence" yaml:"min_confidence"`
	MaxConfidence      float64 `json:"max_confidence" yaml:"max_confidence"`
}

// JSONTestResult represents a test result in JSON format
type JSONTestResult struct {
	Name       string  `json:"name" yaml:"name"`
	File       string  `json:"file" yaml:"file"`
	Status     string  `json:"status" yaml:"status"` // "pass" or "fail"
	Error      string  `json:"error,omitempty" yaml:"error,omitempty"`
	Duration   float64 `json:"duration_seconds" yaml:"duration_seconds"`
	Confidence float64 `json:"confidence" yaml:"confidence"`
}

// SuggestTestResult includes enhanced data for AI assistants
type SuggestTestResult struct {
	Name           string      `json:"name" yaml:"name"`
	File           string      `json:"file" yaml:"file"`
	Status         string      `json:"status" yaml:"status"`
	Error          string      `json:"error,omitempty" yaml:"error,omitempty"`
	Confidence     float64     `json:"confidence" yaml:"confidence"`
	TestCode       string      `json:"test_code" yaml:"test_code"`                          // The actual test YAML
	FailedStep     string      `json:"failed_step,omitempty" yaml:"failed_step,omitempty"`  // Which step failed (when, then)
	Actual         interface{} `json:"actual,omitempty" yaml:"actual,omitempty"`            // Actual value when assertion fails
	Expected       interface{} `json:"expected,omitempty" yaml:"expected,omitempty"`        // Expected value when assertion fails
	Hints          []string    `json:"hints,omitempty" yaml:"hints,omitempty"`              // Pattern-based suggestions
	ConfidenceNote string      `json:"confidence_note,omitempty" yaml:"confidence_note,omitempty"` // Interpretation of confidence level
}

// JSONOutput represents the complete JSON output
type JSONOutput struct {
	Summary TestSummary      `json:"summary"`
	Tests   []JSONTestResult `json:"tests"`
}

// SuggestOutput represents enhanced output for AI assistants (YAML format)
type SuggestOutput struct {
	Summary TestSummary         `json:"summary" yaml:"summary"`
	Tests   []SuggestTestResult `json:"tests" yaml:"tests"`
	Message string              `json:"message" yaml:"message"` // Guidance for AI assistant
}

// Reporter handles test result output
type Reporter struct {
	format         OutputFormat
	results        []JSONTestResult
	suggestResults []SuggestTestResult
	summary        TestSummary
	confidenceSum  float64 // For calculating average
}

// NewReporter creates a new reporter with the specified format
func NewReporter(format OutputFormat) *Reporter {
	return &Reporter{
		format:         format,
		results:        []JSONTestResult{},
		suggestResults: []SuggestTestResult{},
		confidenceSum:  0.0,
		summary: TestSummary{
			MinConfidence: 1.0, // Initialize to max, will be updated
			MaxConfidence: 0.0, // Initialize to min, will be updated
		},
	}
}

// ReportTestStart reports that a test file is starting
func (r *Reporter) ReportTestStart(filename string) {
	if r.format == OutputPretty {
		fmt.Printf("%sRunning %s:%s\n", colorCyan, filename, colorReset)
	}
}

// ReportTestResult reports a single test result
func (r *Reporter) ReportTestResult(filename string, result parser.TestResult) {
	r.ReportTestResultWithTest(filename, result, nil)
}

// ReportTestResultWithTest reports a test result with the original test object (for --suggest mode)
func (r *Reporter) ReportTestResultWithTest(filename string, result parser.TestResult, test *parser.Test) {
	status := "fail"
	if result.Passed {
		status = "pass"
	}

	jsonResult := JSONTestResult{
		Name:       result.Name,
		File:       filename,
		Status:     status,
		Error:      result.Error,
		Duration:   float64(result.Duration) / 1e9,
		Confidence: result.Confidence,
	}

	r.results = append(r.results, jsonResult)

	// Create enhanced result for suggest mode
	if r.format == OutputSuggest && test != nil {
		suggestResult := SuggestTestResult{
			Name:           result.Name,
			File:           filename,
			Status:         status,
			Error:          result.Error,
			Confidence:     result.Confidence,
			TestCode:       formatTestCode(test),
			Hints:          generateHints(test, result),
			ConfidenceNote: getConfidenceNote(result.Confidence),
		}

		if !result.Passed {
			suggestResult.FailedStep = getFailedStep(result.Error)
			suggestResult.Actual = result.Actual
			suggestResult.Expected = result.Expected
		}

		r.suggestResults = append(r.suggestResults, suggestResult)
	}

	// Update summary
	r.summary.Total++
	if result.Passed {
		r.summary.Passed++
	} else {
		r.summary.Failed++
	}
	r.summary.Duration += jsonResult.Duration

	// Track confidence metrics
	r.confidenceSum += result.Confidence
	if result.Confidence < r.summary.MinConfidence {
		r.summary.MinConfidence = result.Confidence
	}
	if result.Confidence > r.summary.MaxConfidence {
		r.summary.MaxConfidence = result.Confidence
	}

	// Pretty output (real-time)
	if r.format == OutputPretty {
		if result.Passed {
			confidenceColor := colorGreen
			if result.Confidence < 0.8 {
				confidenceColor = colorYellow // Warn about low confidence
			}
			fmt.Printf("  %s✅ %s%s %s(confident: %.2f)%s\n",
				colorGreen, result.Name, colorReset,
				confidenceColor, result.Confidence, colorReset)
		} else {
			fmt.Printf("  %s❌ %s%s\n", colorRed, result.Name, colorReset)
			if result.Error != "" {
				fmt.Printf("     %sError: %s%s\n", colorGray, result.Error, colorReset)
			}
		}
	}
}

// ReportFileEnd reports that a test file has finished
func (r *Reporter) ReportFileEnd() {
	if r.format == OutputPretty {
		fmt.Println()
	}
}

// Finalize outputs the final summary
func (r *Reporter) Finalize() error {
	// Calculate average confidence
	if r.summary.Total > 0 {
		r.summary.AverageConfidence = r.confidenceSum / float64(r.summary.Total)
	} else {
		// No tests run - set to 0
		r.summary.MinConfidence = 0.0
		r.summary.MaxConfidence = 0.0
	}

	if r.format == OutputJSON {
		output := JSONOutput{
			Summary: r.summary,
			Tests:   r.results,
		}

		encoder := json.NewEncoder(os.Stdout)
		encoder.SetIndent("", "  ")
		return encoder.Encode(output)
	}

	if r.format == OutputSuggest {
		message := "Vyb test results with AI-friendly context. "
		if r.summary.Failed > 0 {
			message += fmt.Sprintf("Found %d failing test(s). Review the hints for pattern-based suggestions. ", r.summary.Failed)
			message += "For each failed test, check the test_code, failed_step, actual, expected, and hints fields. "
			message += "The confidence_note provides guidance on whether the test or implementation is more likely to be wrong."
		} else {
			message += "All tests passed! "
		}

		output := SuggestOutput{
			Summary: r.summary,
			Tests:   r.suggestResults,
			Message: message,
		}

		// Output as YAML for consistency with test file format and token efficiency
		encoder := yaml.NewEncoder(os.Stdout)
		encoder.SetIndent(2)
		return encoder.Encode(output)
	}

	// Pretty format summary
	passColor := colorGreen
	if r.summary.Failed > 0 {
		passColor = colorRed
	}

	fmt.Printf("%sTests: %s%d passed%s, %s%d failed%s, %d total%s\n",
		colorBold,
		colorGreen, r.summary.Passed, colorReset+colorBold,
		passColor, r.summary.Failed, colorReset+colorBold,
		r.summary.Total, colorReset)

	// Confidence coverage
	if r.summary.Total > 0 {
		confidenceColor := colorGreen
		if r.summary.AverageConfidence < 0.8 {
			confidenceColor = colorYellow
		}

		fmt.Printf("%sConfidence: %savg %.2f%s, min %.2f, max %.2f%s\n",
			colorBold,
			confidenceColor, r.summary.AverageConfidence, colorReset+colorBold,
			r.summary.MinConfidence, r.summary.MaxConfidence, colorReset)
	}

	fmt.Printf("Time: %.3fs\n", r.summary.Duration)

	return nil
}

// Failed returns true if any tests failed
func (r *Reporter) Failed() bool {
	return r.summary.Failed > 0
}
