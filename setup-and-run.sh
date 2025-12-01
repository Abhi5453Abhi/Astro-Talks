#!/bin/bash

# Setup and Run Script for Astro-Talks
# This script will install dependencies and start the development server

set -e

echo "🚀 Setting up Astro-Talks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📥 Please install Node.js from: https://nodejs.org (choose LTS version)"
    echo "   Or install via Homebrew: brew install node"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Navigate to project directory
cd "$(dirname "$0")"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from env.example..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your actual credentials before running the app."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the development server
echo "🎉 Starting development server..."
echo "🌐 Open http://localhost:3000 in your browser"
npm run dev


