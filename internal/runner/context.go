package runner

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// Bridge is an interface for calling external functions in any language
type Bridge interface {
	Call(functionName string, args []interface{}) (interface{}, error)
}

// Context holds variables and state during test execution
type Context struct {
	vars   map[string]interface{}
	bridge Bridge // Optional: for calling external functions
}

// NewContext creates a new execution context
func NewContext() *Context {
	return &Context{
		vars: make(map[string]interface{}),
	}
}

// NewContextWithBridge creates a new execution context with external function support
func NewContextWithBridge(bridge Bridge) *Context {
	return &Context{
		vars:   make(map[string]interface{}),
		bridge: bridge,
	}
}

// Set sets a variable in the context
func (c *Context) Set(name string, value interface{}) {
	c.vars[name] = value
}

// Get retrieves a variable from the context
func (c *Context) Get(name string) (interface{}, bool) {
	val, ok := c.vars[name]
	return val, ok
}

// Eval evaluates a simple expression
// For MVP, we support: variable access, literals, and basic arithmetic
func (c *Context) Eval(expr string) (interface{}, error) {
	expr = strings.TrimSpace(expr)

	// Try to parse as number
	if num, err := strconv.ParseFloat(expr, 64); err == nil {
		return num, nil
	}

	// Try to parse as boolean
	if expr == "true" {
		return true, nil
	}
	if expr == "false" {
		return false, nil
	}

	// Try to parse as string literal
	if strings.HasPrefix(expr, `"`) && strings.HasSuffix(expr, `"`) {
		return strings.Trim(expr, `"`), nil
	}

	// Check if it's a simple function call: funcName(arg1, arg2)
	if strings.Contains(expr, "(") && strings.HasSuffix(expr, ")") {
		return c.evalFunctionCall(expr)
	}

	// Check if it's a property access: obj.property
	if strings.Contains(expr, ".") {
		parts := strings.SplitN(expr, ".", 2)
		objName := strings.TrimSpace(parts[0])
		propertyPath := strings.TrimSpace(parts[1])

		// Get the object
		obj, ok := c.Get(objName)
		if !ok {
			return nil, fmt.Errorf("undefined variable: %s", objName)
		}

		// Access the property (handle nested properties like obj.a.b)
		return c.accessProperty(obj, propertyPath)
	}

	// Otherwise, treat as variable reference
	val, ok := c.Get(expr)
	if !ok {
		return nil, fmt.Errorf("undefined variable: %s", expr)
	}
	return val, nil
}

// evalFunctionCall evaluates a function call
func (c *Context) evalFunctionCall(expr string) (interface{}, error) {
	// Parse: funcName(arg1, arg2, ...)
	openParen := strings.Index(expr, "(")
	if openParen == -1 {
		return nil, fmt.Errorf("invalid function call: %s", expr)
	}

	funcName := strings.TrimSpace(expr[:openParen])
	argsStr := strings.TrimSpace(expr[openParen+1 : len(expr)-1])

	// Parse arguments
	var args []interface{}
	if argsStr != "" {
		argStrs := strings.Split(argsStr, ",")
		for _, argStr := range argStrs {
			argVal, err := c.Eval(strings.TrimSpace(argStr))
			if err != nil {
				return nil, err
			}
			args = append(args, argVal)
		}
	}

	// Call built-in functions
	return c.callFunction(funcName, args)
}

// callFunction calls a built-in function
func (c *Context) callFunction(name string, args []interface{}) (interface{}, error) {
	switch name {
	case "add":
		if len(args) != 2 {
			return nil, fmt.Errorf("add() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("add() arguments must be numbers")
		}
		return a + b, nil

	case "multiply":
		if len(args) != 2 {
			return nil, fmt.Errorf("multiply() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("multiply() arguments must be numbers")
		}
		return a * b, nil

	case "subtract":
		if len(args) != 2 {
			return nil, fmt.Errorf("subtract() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("subtract() arguments must be numbers")
		}
		return a - b, nil

	case "celsiusToFahrenheit":
		if len(args) != 1 {
			return nil, fmt.Errorf("celsiusToFahrenheit() requires 1 argument")
		}
		celsius, ok := toFloat(args[0])
		if !ok {
			return nil, fmt.Errorf("celsiusToFahrenheit() argument must be a number")
		}
		// Formula: F = (C × 9/5) + 32
		return (celsius * 9.0 / 5.0) + 32.0, nil

	case "divide":
		if len(args) != 2 {
			return nil, fmt.Errorf("divide() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("divide() arguments must be numbers")
		}
		if b == 0 {
			return nil, fmt.Errorf("division by zero")
		}
		return a / b, nil

	case "power":
		if len(args) != 2 {
			return nil, fmt.Errorf("power() requires 2 arguments")
		}
		base, ok1 := toFloat(args[0])
		exp, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("power() arguments must be numbers")
		}
		return math.Pow(base, exp), nil

	case "sqrt":
		if len(args) != 1 {
			return nil, fmt.Errorf("sqrt() requires 1 argument")
		}
		n, ok := toFloat(args[0])
		if !ok {
			return nil, fmt.Errorf("sqrt() argument must be a number")
		}
		if n < 0 {
			return nil, fmt.Errorf("sqrt() cannot be called with negative number")
		}
		return math.Sqrt(n), nil

	case "abs":
		if len(args) != 1 {
			return nil, fmt.Errorf("abs() requires 1 argument")
		}
		n, ok := toFloat(args[0])
		if !ok {
			return nil, fmt.Errorf("abs() argument must be a number")
		}
		return math.Abs(n), nil

	case "min":
		if len(args) != 2 {
			return nil, fmt.Errorf("min() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("min() arguments must be numbers")
		}
		return math.Min(a, b), nil

	case "max":
		if len(args) != 2 {
			return nil, fmt.Errorf("max() requires 2 arguments")
		}
		a, ok1 := toFloat(args[0])
		b, ok2 := toFloat(args[1])
		if !ok1 || !ok2 {
			return nil, fmt.Errorf("max() arguments must be numbers")
		}
		return math.Max(a, b), nil

	case "concat":
		if len(args) < 2 {
			return nil, fmt.Errorf("concat() requires at least 2 arguments")
		}
		result := fmt.Sprintf("%v", args[0])
		for i := 1; i < len(args); i++ {
			result += fmt.Sprintf("%v", args[i])
		}
		return result, nil

	case "toUpper":
		if len(args) != 1 {
			return nil, fmt.Errorf("toUpper() requires 1 argument")
		}
		str := fmt.Sprintf("%v", args[0])
		return strings.ToUpper(str), nil

	case "toLower":
		if len(args) != 1 {
			return nil, fmt.Errorf("toLower() requires 1 argument")
		}
		str := fmt.Sprintf("%v", args[0])
		return strings.ToLower(str), nil

	default:
		// Not a built-in function - try external bridge if available
		if c.bridge != nil {
			result, err := c.bridge.Call(name, args)
			if err != nil {
				return nil, fmt.Errorf("external function %s() failed: %w", name, err)
			}
			return result, nil
		}

		// No bridge configured or function not found
		return nil, fmt.Errorf("unknown function: %s (not a built-in, no external modules configured)", name)
	}
}

// ExpectationResult contains detailed information about an expectation check
type ExpectationResult struct {
	Passed   bool
	Actual   interface{}
	Expected interface{}
	Error    error
}

// CheckExpectation checks if an expectation passes and returns actual/expected values
func (c *Context) CheckExpectation(expectStr string) ExpectationResult {
	// Parse expectation: "result == 5" or "result > 10", etc.
	expectStr = strings.TrimSpace(expectStr)
	if !strings.HasPrefix(expectStr, "expect:") {
		return ExpectationResult{Error: fmt.Errorf("expectation must start with 'expect:'")}
	}

	expectStr = strings.TrimSpace(strings.TrimPrefix(expectStr, "expect:"))

	// Check for special assertion keywords first
	if strings.Contains(expectStr, " contains ") {
		parts := strings.Split(expectStr, " contains ")
		if len(parts) != 2 {
			return ExpectationResult{Error: fmt.Errorf("invalid contains expectation: %s", expectStr)}
		}
		left, _ := c.Eval(strings.TrimSpace(parts[0]))
		right, _ := c.Eval(strings.TrimSpace(parts[1]))
		leftStr := fmt.Sprintf("%v", left)
		rightStr := fmt.Sprintf("%v", right)
		passed := strings.Contains(leftStr, rightStr)
		return ExpectationResult{Passed: passed, Actual: leftStr, Expected: "contains " + rightStr}
	}

	if strings.Contains(expectStr, " startsWith ") {
		parts := strings.Split(expectStr, " startsWith ")
		if len(parts) != 2 {
			return ExpectationResult{Error: fmt.Errorf("invalid startsWith expectation: %s", expectStr)}
		}
		left, _ := c.Eval(strings.TrimSpace(parts[0]))
		right, _ := c.Eval(strings.TrimSpace(parts[1]))
		leftStr := fmt.Sprintf("%v", left)
		rightStr := fmt.Sprintf("%v", right)
		passed := strings.HasPrefix(leftStr, rightStr)
		return ExpectationResult{Passed: passed, Actual: leftStr, Expected: "startsWith " + rightStr}
	}

	if strings.Contains(expectStr, " endsWith ") {
		parts := strings.Split(expectStr, " endsWith ")
		if len(parts) != 2 {
			return ExpectationResult{Error: fmt.Errorf("invalid endsWith expectation: %s", expectStr)}
		}
		left, _ := c.Eval(strings.TrimSpace(parts[0]))
		right, _ := c.Eval(strings.TrimSpace(parts[1]))
		leftStr := fmt.Sprintf("%v", left)
		rightStr := fmt.Sprintf("%v", right)
		passed := strings.HasSuffix(leftStr, rightStr)
		return ExpectationResult{Passed: passed, Actual: leftStr, Expected: "endsWith " + rightStr}
	}

	// Parse comparison operators
	operators := []string{"==", "!=", ">=", "<=", ">", "<"}
	for _, op := range operators {
		if strings.Contains(expectStr, op) {
			parts := strings.Split(expectStr, op)
			if len(parts) != 2 {
				return ExpectationResult{Error: fmt.Errorf("invalid expectation: %s", expectStr)}
			}

			left, err := c.Eval(strings.TrimSpace(parts[0]))
			if err != nil {
				return ExpectationResult{Error: err}
			}

			right, err := c.Eval(strings.TrimSpace(parts[1]))
			if err != nil {
				return ExpectationResult{Error: err}
			}

			passed, compErr := compare(left, right, op)
			return ExpectationResult{Passed: passed, Actual: left, Expected: right, Error: compErr}
		}
	}

	return ExpectationResult{Error: fmt.Errorf("no comparison operator found in: %s", expectStr)}
}

// compare compares two values with an operator
func compare(left, right interface{}, op string) (bool, error) {
	// Convert to comparable types
	leftNum, leftIsNum := toFloat(left)
	rightNum, rightIsNum := toFloat(right)

	if leftIsNum && rightIsNum {
		switch op {
		case "==":
			return leftNum == rightNum, nil
		case "!=":
			return leftNum != rightNum, nil
		case ">":
			return leftNum > rightNum, nil
		case "<":
			return leftNum < rightNum, nil
		case ">=":
			return leftNum >= rightNum, nil
		case "<=":
			return leftNum <= rightNum, nil
		}
	}

	// String comparison
	leftStr := fmt.Sprintf("%v", left)
	rightStr := fmt.Sprintf("%v", right)

	switch op {
	case "==":
		return leftStr == rightStr, nil
	case "!=":
		return leftStr != rightStr, nil
	default:
		return false, fmt.Errorf("operator %s not supported for strings", op)
	}
}

// toFloat attempts to convert a value to float64
func toFloat(v interface{}) (float64, bool) {
	switch val := v.(type) {
	case float64:
		return val, true
	case int:
		return float64(val), true
	case int64:
		return float64(val), true
	default:
		return 0, false
	}
}

// accessProperty accesses a property from an object (supports nested properties)
func (c *Context) accessProperty(obj interface{}, propertyPath string) (interface{}, error) {
	// Handle nested properties: a.b.c
	parts := strings.SplitN(propertyPath, ".", 2)
	property := strings.TrimSpace(parts[0])

	// Try to access the property as a map key
	switch objMap := obj.(type) {
	case map[string]interface{}:
		val, ok := objMap[property]
		if !ok {
			return nil, fmt.Errorf("property not found: %s", property)
		}

		// If there are more parts, recurse
		if len(parts) > 1 {
			return c.accessProperty(val, parts[1])
		}
		return val, nil

	default:
		return nil, fmt.Errorf("cannot access property %s on non-object type %T", property, obj)
	}
}

// SetProperty sets a property on an object (supports nested properties)
func (c *Context) SetProperty(obj interface{}, propertyPath string, value interface{}) error {
	// Handle nested properties: a.b.c = value
	parts := strings.SplitN(propertyPath, ".", 2)
	property := strings.TrimSpace(parts[0])

	// Try to set the property as a map key
	switch objMap := obj.(type) {
	case map[string]interface{}:
		// If there are more parts, recurse
		if len(parts) > 1 {
			nestedObj, ok := objMap[property]
			if !ok {
				return fmt.Errorf("property not found: %s", property)
			}
			return c.SetProperty(nestedObj, parts[1], value)
		}

		// Set the property
		objMap[property] = value
		return nil

	default:
		return fmt.Errorf("cannot set property %s on non-object type %T", property, obj)
	}
}
