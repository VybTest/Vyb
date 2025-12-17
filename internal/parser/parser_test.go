package parser

import (
	"testing"
)

func TestParseSimpleTest(t *testing.T) {
	yaml := `
test:
  name: "example test"
  confidence: 0.95
  given:
    x: 5
  when:
    - "result = add(x, 3)"
  then:
    - "expect: result == 8"
`

	testFile, err := ParseBytes("test.vyb", []byte(yaml))

	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	if len(testFile.Tests) != 1 {
		t.Errorf("Expected 1 test, got %d", len(testFile.Tests))
	}

	test := testFile.Tests[0]

	if test.Name != "example test" {
		t.Errorf("Expected name 'example test', got '%s'", test.Name)
	}

	if test.Confidence != 0.95 {
		t.Errorf("Expected confidence 0.95, got %f", test.Confidence)
	}

	if len(test.When) != 1 {
		t.Errorf("Expected 1 when statement, got %d", len(test.When))
	}

	if len(test.Then) != 1 {
		t.Errorf("Expected 1 then statement, got %d", len(test.Then))
	}
}

func TestParseMissingName(t *testing.T) {
	yaml := `
test:
  given:
    x: 5
  when:
    - "result = add(x, 3)"
  then:
    - "expect: result == 8"
`

	_, err := ParseBytes("test.vyb", []byte(yaml))

	if err == nil {
		t.Error("Expected error for missing name, got nil")
	}
}

func TestParseDefaultConfidence(t *testing.T) {
	yaml := `
test:
  name: "test without confidence"
  when:
    - "x = add(1, 2)"
  then:
    - "expect: x == 3"
`

	testFile, err := ParseBytes("test.vyb", []byte(yaml))

	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	test := testFile.Tests[0]

	if test.Confidence != 1.0 {
		t.Errorf("Expected default confidence 1.0, got %f", test.Confidence)
	}
}

func TestParseGivenBlock(t *testing.T) {
	yaml := `
test:
  name: "test with given"
  given:
    a: 5
    b: 10
    name: "John"
  when:
    - "sum = add(a, b)"
  then:
    - "expect: sum == 15"
`

	testFile, err := ParseBytes("test.vyb", []byte(yaml))

	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	test := testFile.Tests[0]

	if test.Given == nil {
		t.Fatal("Expected given block, got nil")
	}

	if len(test.Given) != 3 {
		t.Errorf("Expected 3 given variables, got %d", len(test.Given))
	}

	if test.Given["a"] != 5 {
		t.Errorf("Expected given.a = 5, got %v", test.Given["a"])
	}

	if test.Given["name"] != "John" {
		t.Errorf("Expected given.name = 'John', got %v", test.Given["name"])
	}
}

func TestParseMultipleWhenStatements(t *testing.T) {
	yaml := `
test:
  name: "multi-step test"
  given:
    a: 3
    b: 4
  when:
    - "step1 = multiply(a, a)"
    - "step2 = multiply(b, b)"
    - "result = add(step1, step2)"
  then:
    - "expect: result == 25"
`

	testFile, err := ParseBytes("test.vyb", []byte(yaml))

	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	test := testFile.Tests[0]

	if len(test.When) != 3 {
		t.Errorf("Expected 3 when statements, got %d", len(test.When))
	}

	expected := []string{
		"step1 = multiply(a, a)",
		"step2 = multiply(b, b)",
		"result = add(step1, step2)",
	}

	for i, stmt := range expected {
		if test.When[i] != stmt {
			t.Errorf("When[%d]: expected '%s', got '%s'", i, stmt, test.When[i])
		}
	}
}

func TestParseMultipleThenStatements(t *testing.T) {
	yaml := `
test:
  name: "multiple assertions"
  given:
    x: 10
  when:
    - "y = multiply(x, 2)"
  then:
    - "expect: y == 20"
    - "expect: y > x"
    - "expect: y < 100"
`

	testFile, err := ParseBytes("test.vyb", []byte(yaml))

	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	test := testFile.Tests[0]

	if len(test.Then) != 3 {
		t.Errorf("Expected 3 then statements, got %d", len(test.Then))
	}
}

func TestParseInvalidYAML(t *testing.T) {
	yaml := `
this is not valid yaml:
  - broken
    indentation
`

	_, err := ParseBytes("test.vyb", []byte(yaml))

	if err == nil {
		t.Error("Expected error for invalid YAML, got nil")
	}
}

func TestParseEmptyFile(t *testing.T) {
	yaml := ``

	_, err := ParseBytes("test.vyb", []byte(yaml))

	if err == nil {
		t.Error("Expected error for empty file, got nil")
	}
}
