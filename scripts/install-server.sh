#!/bin/bash
# CircuitMind AI Server - Installation Script
# Sets up the server as a systemd service for auto-start

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_DIR/server"
SERVICE_FILE="$SERVER_DIR/circuitmind.service"

echo "=== CircuitMind AI Server Installer ==="
echo "Server directory: $SERVER_DIR"

# Check prerequisites
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is not installed"
  exit 1
fi

# Install server dependencies
echo "Installing server dependencies..."
cd "$SERVER_DIR"
npm install

# Copy systemd service file
echo "Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/circuitmind.service

# Update paths in service file
sudo sed -i "s|WorkingDirectory=.*|WorkingDirectory=$SERVER_DIR|" /etc/systemd/system/circuitmind.service
sudo sed -i "s|User=.*|User=$USER|" /etc/systemd/system/circuitmind.service

# Reload and enable
sudo systemctl daemon-reload
sudo systemctl enable circuitmind.service
sudo systemctl start circuitmind.service

echo ""
echo "=== Installation Complete ==="
echo "Server status: $(sudo systemctl is-active circuitmind.service)"
echo "View logs: journalctl -u circuitmind -f"
echo "Server URL: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "To stop:    sudo systemctl stop circuitmind"
echo "To restart: sudo systemctl restart circuitmind"
echo "To disable: sudo systemctl disable circuitmind"
