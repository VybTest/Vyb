package runner

import (
	"fmt"
	"os"
	"time"
)

// Watch watches for file changes and re-runs tests
func Watch(pattern string, format OutputFormat) error {
	fmt.Println("👀 Watch mode enabled - press Ctrl+C to stop")
	fmt.Printf("Watching: %s\n\n", pattern)

	// Track file modification times
	fileModTimes := make(map[string]time.Time)

	// Run tests initially
	runOnce(pattern, format)

	// Poll for changes every 500ms
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		changed := false
		files, err := findTestFiles(pattern)
		if err != nil {
			continue
		}

		// Check if any files changed
		for _, file := range files {
			info, err := os.Stat(file)
			if err != nil {
				continue
			}

			modTime := info.ModTime()
			oldModTime, exists := fileModTimes[file]

			if !exists {
				// New file detected
				fileModTimes[file] = modTime
				changed = true
			} else if modTime.After(oldModTime) {
				// File was modified
				fileModTimes[file] = modTime
				changed = true
			}
		}

		if changed {
			// Clear screen (cross-platform)
			clearScreen()

			// Show what changed
			if format == OutputPretty {
				fmt.Printf("🔄 Files changed, re-running tests...\n\n")
			}

			// Re-run tests
			runOnce(pattern, format)

			if format == OutputPretty {
				fmt.Printf("\n👀 Watching for changes...\n")
			}
		}
	}

	return nil
}

// clearScreen clears the terminal screen (cross-platform)
func clearScreen() {
	// ANSI escape code to clear screen and move cursor to top
	fmt.Print("\033[H\033[2J")
}
