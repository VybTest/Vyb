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

// LuaBridge handles executing external Lua functions
type LuaBridge struct {
	config     *parser.Config
	bridgeCode string
}

// NewLuaBridge creates a new Lua bridge with the given config
func NewLuaBridge(config *parser.Config) (*LuaBridge, error) {
	if config == nil {
		return nil, fmt.Errorf("config cannot be nil")
	}

	bridgeCode, err := generateLuaBridgeScript(config.Modules)
	if err != nil {
		return nil, err
	}

	return &LuaBridge{
		config:     config,
		bridgeCode: bridgeCode,
	}, nil
}

// Call executes an external Lua function
func (lb *LuaBridge) Call(functionName string, args []interface{}) (interface{}, error) {
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
	bridgeFile := filepath.Join(tmpDir, "vyb_bridge.lua")
	if err := os.WriteFile(bridgeFile, []byte(lb.bridgeCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write bridge script: %w", err)
	}
	defer os.Remove(bridgeFile)

	// Execute Lua with the bridge script
	cmd := exec.Command("lua", bridgeFile, string(requestJSON))
	output, err := cmd.CombinedOutput()

	// Save the first error for better debugging
	firstErr := err
	firstOutput := output

	if err != nil {
		// Try lua54, lua5.4, lua5.3, lua5.2, luajit if 'lua' not found
		for _, luaCmd := range []string{"lua54", "lua5.4", "lua5.3", "lua5.2", "luajit"} {
			cmd = exec.Command(luaCmd, bridgeFile, string(requestJSON))
			output, err = cmd.CombinedOutput()
			if err == nil {
				break
			}
		}
		if err != nil {
			// Show the first error (from 'lua') since that's the preferred command
			return nil, fmt.Errorf("lua execution failed (tried: lua, lua54, lua5.4, lua5.3, lua5.2, luajit):\nFirst error: %w\nOutput: %s", firstErr, string(firstOutput))
		}
	}

	// Parse response
	var response struct {
		Result interface{} `json:"result"`
		Error  string      `json:"error"`
	}

	if err := json.Unmarshal(output, &response); err != nil {
		return nil, fmt.Errorf("failed to parse lua response: %w\nOutput: %s", err, string(output))
	}

	if response.Error != "" {
		return nil, fmt.Errorf("external function error: %s", response.Error)
	}

	return response.Result, nil
}

// generateLuaBridgeScript creates the Lua bridge script that requires modules and calls functions
func generateLuaBridgeScript(modules []string) (string, error) {
	var requires []string
	var functionMerges []string

	for i, module := range modules {
		// For Lua, we need to set package.path to include the directory
		dir := filepath.Dir(module)
		luaPath := strings.ReplaceAll(dir, "\\", "/")

		// Get just the base filename without extension as the module name
		basename := filepath.Base(module)
		moduleName := strings.TrimSuffix(basename, ".lua")

		requires = append(requires, fmt.Sprintf("package.path = package.path .. ';%s/?.lua'", luaPath))
		requires = append(requires, fmt.Sprintf("local module%d = require('%s')", i, moduleName))
		functionMerges = append(functionMerges, fmt.Sprintf(`
-- Merge functions from module%d
for name, value in pairs(module%d) do
    if type(value) == "function" then
        functions[name] = value
    end
end
`, i, i))
	}

	script := `-- Vyb Lua Bridge - Auto-generated
-- This script requires your modules and executes function calls from Vyb tests

-- Try to load json module, fallback to simple implementation if not available
local status, json = pcall(require, 'json')
if not status then
    json = nil
end

-- JSON encode/decode functions (fallback if json module not available)
if not json then
    json = {}

    function json.encode(obj)
        if type(obj) == "table" then
            local result = "{"
            local first = true
            for k, v in pairs(obj) do
                if not first then result = result .. "," end
                first = false
                if type(k) == "string" then
                    result = result .. '"' .. k .. '":'
                else
                    result = result .. '"' .. tostring(k) .. '":'
                end
                result = result .. json.encode(v)
            end
            return result .. "}"
        elseif type(obj) == "string" then
            return '"' .. obj:gsub('"', '\\"') .. '"'
        elseif type(obj) == "number" or type(obj) == "boolean" then
            return tostring(obj)
        elseif obj == nil then
            return "null"
        end
        return '""'
    end

    function json.decode(str)
        -- Simple JSON parser that handles objects and arrays
        local function decode_value(s, pos)
            -- Skip whitespace
            pos = s:match("^%s*()", pos)

            local first = s:sub(pos, pos)

            if first == '"' then
                -- String
                local endpos = s:find('"', pos + 1)
                return s:sub(pos + 1, endpos - 1), endpos + 1
            elseif first == '{' then
                -- Object
                local obj = {}
                pos = pos + 1
                while true do
                    pos = s:match("^%s*()", pos)
                    if s:sub(pos, pos) == '}' then
                        return obj, pos + 1
                    end
                    -- Parse key
                    local key, newpos = decode_value(s, pos)
                    pos = s:match("^%s*:()", newpos)
                    -- Parse value
                    local value
                    value, pos = decode_value(s, pos)
                    obj[key] = value
                    pos = s:match("^%s*()", pos)
                    if s:sub(pos, pos) == ',' then
                        pos = pos + 1
                    end
                end
            elseif first == '[' then
                -- Array
                local arr = {}
                pos = pos + 1
                while true do
                    pos = s:match("^%s*()", pos)
                    if s:sub(pos, pos) == ']' then
                        return arr, pos + 1
                    end
                    local value
                    value, pos = decode_value(s, pos)
                    table.insert(arr, value)
                    pos = s:match("^%s*()", pos)
                    if s:sub(pos, pos) == ',' then
                        pos = pos + 1
                    end
                end
            elseif first == 't' and s:sub(pos, pos + 3) == 'true' then
                return true, pos + 4
            elseif first == 'f' and s:sub(pos, pos + 4) == 'false' then
                return false, pos + 5
            elseif first == 'n' and s:sub(pos, pos + 3) == 'null' then
                return nil, pos + 4
            else
                -- Number
                local numstr = s:match("^-?%d+%.?%d*", pos)
                return tonumber(numstr), pos + #numstr
            end
        end

        local result = decode_value(str, 1)
        return result
    end
end

-- Require user modules
` + strings.Join(requires, "\n") + `

-- Merge all exports into a single function registry
local functions = {}
` + strings.Join(functionMerges, "\n") + `

-- Read request from command line argument
local request_str = arg[1]
local success, request = pcall(json.decode, request_str)

if not success then
    print(json.encode({error = "Failed to parse request: " .. tostring(request)}))
    os.exit(1)
end

-- Find and call the function
local fn = functions[request["function"]]

if not fn then
    local available = {}
    for name in pairs(functions) do
        table.insert(available, name)
    end
    local error_msg = string.format("Function not found: %s. Available: %s",
                                    request["function"],
                                    table.concat(available, ", "))
    print(json.encode({error = error_msg}))
    os.exit(1)
end

if type(fn) ~= "function" then
    print(json.encode({error = "Not a function: " .. request["function"]}))
    os.exit(1)
end

-- Call the function with args
local status, result = pcall(function()
    return fn(table.unpack(request["args"] or {}))
end)

if not status then
    -- Function threw an error
    print(json.encode({error = tostring(result)}))
    os.exit(1)
end

-- Return result as JSON
print(json.encode({result = result}))
`

	return script, nil
}
