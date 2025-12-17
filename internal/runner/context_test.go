package runner

import (
	"testing"
)

func TestContextSetAndGet(t *testing.T) {
	ctx := NewContext()

	ctx.Set("x", 5)
	ctx.Set("name", "John")

	val, ok := ctx.Get("x")
	if !ok {
		t.Error("Expected to find 'x' in context")
	}
	if val != 5 {
		t.Errorf("Expected x=5, got %v", val)
	}

	val, ok = ctx.Get("name")
	if !ok {
		t.Error("Expected to find 'name' in context")
	}
	if val != "John" {
		t.Errorf("Expected name='John', got %v", val)
	}

	_, ok = ctx.Get("undefined")
	if ok {
		t.Error("Expected 'undefined' to not exist in context")
	}
}

func TestEvalLiteral(t *testing.T) {
	ctx := NewContext()

	// Number literal
	val, err := ctx.Eval("42")
	if err != nil {
		t.Fatalf("Eval failed: %v", err)
	}
	if val != 42.0 {
		t.Errorf("Expected 42.0, got %v", val)
	}

	// String literal
	val, err = ctx.Eval(`"hello"`)
	if err != nil {
		t.Fatalf("Eval failed: %v", err)
	}
	if val != "hello" {
		t.Errorf("Expected 'hello', got %v", val)
	}

	// Boolean literal
	val, err = ctx.Eval("true")
	if err != nil {
		t.Fatalf("Eval failed: %v", err)
	}
	if val != true {
		t.Errorf("Expected true, got %v", val)
	}
}

func TestEvalVariable(t *testing.T) {
	ctx := NewContext()
	ctx.Set("x", 100)

	val, err := ctx.Eval("x")
	if err != nil {
		t.Fatalf("Eval failed: %v", err)
	}
	if val != 100 {
		t.Errorf("Expected 100, got %v", val)
	}
}

func TestAddFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("add", []interface{}{5, 3})
	if err != nil {
		t.Fatalf("add() failed: %v", err)
	}

	if result != 8.0 {
		t.Errorf("Expected 8, got %v", result)
	}
}

func TestSubtractFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("subtract", []interface{}{10, 4})
	if err != nil {
		t.Fatalf("subtract() failed: %v", err)
	}

	if result != 6.0 {
		t.Errorf("Expected 6, got %v", result)
	}
}

func TestMultiplyFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("multiply", []interface{}{7, 6})
	if err != nil {
		t.Fatalf("multiply() failed: %v", err)
	}

	if result != 42.0 {
		t.Errorf("Expected 42, got %v", result)
	}
}

func TestDivideFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("divide", []interface{}{20, 4})
	if err != nil {
		t.Fatalf("divide() failed: %v", err)
	}

	if result != 5.0 {
		t.Errorf("Expected 5, got %v", result)
	}
}

func TestDivideByZero(t *testing.T) {
	ctx := NewContext()

	_, err := ctx.callFunction("divide", []interface{}{10, 0})
	if err == nil {
		t.Error("Expected error for division by zero, got nil")
	}
}

func TestPowerFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("power", []interface{}{2, 3})
	if err != nil {
		t.Fatalf("power() failed: %v", err)
	}

	if result != 8.0 {
		t.Errorf("Expected 8, got %v", result)
	}
}

func TestSqrtFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("sqrt", []interface{}{16})
	if err != nil {
		t.Fatalf("sqrt() failed: %v", err)
	}

	if result != 4.0 {
		t.Errorf("Expected 4, got %v", result)
	}
}

func TestSqrtNegative(t *testing.T) {
	ctx := NewContext()

	_, err := ctx.callFunction("sqrt", []interface{}{-1})
	if err == nil {
		t.Error("Expected error for sqrt of negative number, got nil")
	}
}

func TestAbsFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("abs", []interface{}{-10})
	if err != nil {
		t.Fatalf("abs() failed: %v", err)
	}

	if result != 10.0 {
		t.Errorf("Expected 10, got %v", result)
	}
}

func TestMinFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("min", []interface{}{5, 10})
	if err != nil {
		t.Fatalf("min() failed: %v", err)
	}

	if result != 5.0 {
		t.Errorf("Expected 5, got %v", result)
	}
}

func TestMaxFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("max", []interface{}{5, 10})
	if err != nil {
		t.Fatalf("max() failed: %v", err)
	}

	if result != 10.0 {
		t.Errorf("Expected 10, got %v", result)
	}
}

func TestConcatFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("concat", []interface{}{"Hello", " ", "World"})
	if err != nil {
		t.Fatalf("concat() failed: %v", err)
	}

	if result != "Hello World" {
		t.Errorf("Expected 'Hello World', got %v", result)
	}
}

func TestToUpperFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("toUpper", []interface{}{"hello"})
	if err != nil {
		t.Fatalf("toUpper() failed: %v", err)
	}

	if result != "HELLO" {
		t.Errorf("Expected 'HELLO', got %v", result)
	}
}

func TestToLowerFunction(t *testing.T) {
	ctx := NewContext()

	result, err := ctx.callFunction("toLower", []interface{}{"WORLD"})
	if err != nil {
		t.Fatalf("toLower() failed: %v", err)
	}

	if result != "world" {
		t.Errorf("Expected 'world', got %v", result)
	}
}

func TestCheckExpectationEqual(t *testing.T) {
	ctx := NewContext()
	ctx.Set("result", 5)

	passed, err := ctx.CheckExpectation("expect: result == 5")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: result == 10")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestCheckExpectationNotEqual(t *testing.T) {
	ctx := NewContext()
	ctx.Set("result", 5)

	passed, err := ctx.CheckExpectation("expect: result != 10")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}
}

func TestCheckExpectationGreaterThan(t *testing.T) {
	ctx := NewContext()
	ctx.Set("result", 10)

	passed, err := ctx.CheckExpectation("expect: result > 5")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: result > 15")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestCheckExpectationLessThan(t *testing.T) {
	ctx := NewContext()
	ctx.Set("result", 10)

	passed, err := ctx.CheckExpectation("expect: result < 15")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: result < 5")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestCheckExpectationContains(t *testing.T) {
	ctx := NewContext()
	ctx.Set("text", "Hello World")

	passed, err := ctx.CheckExpectation("expect: text contains \"World\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: text contains \"Goodbye\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestCheckExpectationStartsWith(t *testing.T) {
	ctx := NewContext()
	ctx.Set("url", "https://example.com")

	passed, err := ctx.CheckExpectation("expect: url startsWith \"https://\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: url startsWith \"http://\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestCheckExpectationEndsWith(t *testing.T) {
	ctx := NewContext()
	ctx.Set("filename", "document.txt")

	passed, err := ctx.CheckExpectation("expect: filename endsWith \".txt\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if !passed {
		t.Error("Expected expectation to pass")
	}

	passed, err = ctx.CheckExpectation("expect: filename endsWith \".pdf\"")
	if err != nil {
		t.Fatalf("CheckExpectation failed: %v", err)
	}
	if passed {
		t.Error("Expected expectation to fail")
	}
}

func TestToFloat(t *testing.T) {
	tests := []struct {
		input    interface{}
		expected float64
		ok       bool
	}{
		{5, 5.0, true},
		{int64(10), 10.0, true},
		{3.14, 3.14, true},
		{"string", 0, false},
		{true, 0, false},
	}

	for _, tt := range tests {
		result, ok := toFloat(tt.input)
		if ok != tt.ok {
			t.Errorf("toFloat(%v): expected ok=%v, got %v", tt.input, tt.ok, ok)
		}
		if ok && result != tt.expected {
			t.Errorf("toFloat(%v): expected %v, got %v", tt.input, tt.expected, result)
		}
	}
}
