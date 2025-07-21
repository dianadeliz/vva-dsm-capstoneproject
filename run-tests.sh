#!/bin/bash

# Voice Virtual Assistant - Test Runner Script
# This script provides an easy way to run different types of tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to install dependencies if needed
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
        print_warning "Some dependencies are missing. Installing..."
        npm run install-all
        print_success "Dependencies installed successfully"
    else
        print_success "Dependencies are already installed"
    fi
}

# Function to run server tests
run_server_tests() {
    print_status "Running server tests..."
    cd server
    
    if [ "$1" = "coverage" ]; then
        npm run test:coverage
    elif [ "$1" = "watch" ]; then
        npm run test:watch
    else
        npm test
    fi
    
    cd ..
    print_success "Server tests completed"
}

# Function to run client tests
run_client_tests() {
    print_status "Running client tests..."
    cd client
    
    if [ "$1" = "coverage" ]; then
        npm test -- --coverage --watchAll=false
    elif [ "$1" = "watch" ]; then
        npm test -- --watch
    else
        npm test -- --watchAll=false
    fi
    
    cd ..
    print_success "Client tests completed"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    if [ "$1" = "coverage" ]; then
        npm run test:coverage
    else
        npm test
    fi
    
    print_success "All tests completed"
}

# Function to show help
show_help() {
    echo "Voice Virtual Assistant - Test Runner"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all                    Run all tests (default)"
    echo "  server                 Run server tests only"
    echo "  client                 Run client tests only"
    echo "  coverage               Run all tests with coverage"
    echo "  server:coverage        Run server tests with coverage"
    echo "  client:coverage        Run client tests with coverage"
    echo "  watch                  Run all tests in watch mode"
    echo "  server:watch           Run server tests in watch mode"
    echo "  client:watch           Run client tests in watch mode"
    echo "  install                Install dependencies only"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Run all tests"
    echo "  $0 server              # Run server tests only"
    echo "  $0 coverage            # Run all tests with coverage"
    echo "  $0 server:watch        # Run server tests in watch mode"
}

# Main script logic
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check dependencies
    check_dependencies
    
    # Parse command line arguments
    case "${1:-all}" in
        "all")
            install_dependencies
            run_all_tests
            ;;
        "server")
            install_dependencies
            run_server_tests
            ;;
        "client")
            install_dependencies
            run_client_tests
            ;;
        "coverage")
            install_dependencies
            run_all_tests coverage
            ;;
        "server:coverage")
            install_dependencies
            run_server_tests coverage
            ;;
        "client:coverage")
            install_dependencies
            run_client_tests coverage
            ;;
        "watch")
            install_dependencies
            run_all_tests watch
            ;;
        "server:watch")
            install_dependencies
            run_server_tests watch
            ;;
        "client:watch")
            install_dependencies
            run_client_tests watch
            ;;
        "install")
            install_dependencies
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 