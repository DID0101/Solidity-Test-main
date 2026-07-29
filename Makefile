.PHONY: help install compile lint test check clean

help:
	@echo "Available commands:"
	@echo "  make install      Install Node.js dependencies"
	@echo "  make compile      Compile contracts"
	@echo "  make lint         Run Solhint"
	@echo "  make test         Run Hardhat tests"
	@echo "  make check        Run all quality checks"
	@echo "  make clean        Remove build artifacts"

install:
	npm install

compile:
	npm run compile

lint:
	npm run lint

test:
	npm test

check: lint test

clean:
	rm -rf cache artifacts node_modules
