package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/vybtest/vyb/internal/runner"
)

var version = "0.1.0-alpha"

func main() {
	rootCmd := &cobra.Command{
		Use:     "vyb",
		Short:   "Vyb - Testing that vibes with AI",
		Version: version,
	}

	runCmd := &cobra.Command{
		Use:   "run [pattern]",
		Short: "Run tests",
		Long:  "Run all tests matching the pattern (default: **/*.test.vyb)",
		Run: func(cmd *cobra.Command, args []string) {
			pattern := "**/*.test.vyb"
			if len(args) > 0 {
				pattern = args[0]
			}

			watch, _ := cmd.Flags().GetBool("watch")
			jsonOutput, _ := cmd.Flags().GetBool("json")
			prettyOutput, _ := cmd.Flags().GetBool("pretty")

			// Default is YAML output (AI-native)
			format := runner.OutputSuggest
			if prettyOutput {
				format = runner.OutputPretty
			}
			if jsonOutput {
				format = runner.OutputJSON
			}

			if err := runner.Run(pattern, watch, format); err != nil {
				if prettyOutput {
					fmt.Fprintf(os.Stderr, "Error: %v\n", err)
				}
				os.Exit(1)
			}
		},
	}
	runCmd.Flags().BoolP("watch", "w", false, "Watch for changes and re-run tests")
	runCmd.Flags().Bool("json", false, "Output results in JSON format")
	runCmd.Flags().BoolP("pretty", "p", false, "Human-readable output with colors and emojis")

	initCmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize Vyb in current directory",
		Run: func(cmd *cobra.Command, args []string) {
			if err := initializeProject(); err != nil {
				fmt.Fprintf(os.Stderr, "Error: %v\n", err)
				os.Exit(1)
			}
			fmt.Println("✅ Vyb initialized!")
			fmt.Println("\nNext steps:")
			fmt.Println("  1. Create a test file: example.test.vyb")
			fmt.Println("  2. Run tests: vyb run")
		},
	}

	rootCmd.AddCommand(runCmd, initCmd)

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func initializeProject() error {
	// Create vyb.config.json
	config := `{
  "llm": {
    "provider": "openai",
    "apiKey": "$OPENAI_API_KEY"
  },
  "testMatch": ["**/*.test.vyb"],
  "coverage": {
    "threshold": 0.8
  }
}
`
	if err := os.WriteFile("vyb.config.json", []byte(config), 0644); err != nil {
		return err
	}

	// Create example test
	example := `# Example Vyb Test
# Run with: vyb run

test:
  name: "adds two numbers"
  confidence: 0.95
  given:
    a: 2
    b: 3
  when:
    - result = add(a, b)
  then:
    - expect: result == 5
`

	if err := os.WriteFile("example.test.vyb", []byte(example), 0644); err != nil {
		return err
	}

	return nil
}
