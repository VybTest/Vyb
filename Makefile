.PHONY: build run test clean install

build:
	go build -o vyb cmd/vyb/main.go

run: build
	./vyb run examples/

test:
	go test ./...

clean:
	rm -f vyb

install:
	go install ./cmd/vyb

deps:
	go mod download
	go mod tidy

# Run with examples
demo: build
	@echo "🌊 Running Vyb demo..."
	@echo ""
	./vyb run examples/
