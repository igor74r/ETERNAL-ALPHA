#!/bin/bash
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install the current LTS version from https://nodejs.org/"
  read -r -p "Press Enter to close..."
  exit 1
fi

if [ ! -f "node_modules/vite/bin/vite.js" ]; then
  echo "Installing game dependencies..."
  npm install || { read -r -p "Dependency installation failed. Press Enter to close..."; exit 1; }
fi

(sleep 2; open http://127.0.0.1:5173) &
npm run dev -- --host 127.0.0.1
