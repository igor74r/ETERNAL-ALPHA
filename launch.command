#!/bin/bash
cd "$(dirname "$0")/dist" || exit 1
python3 -m http.server 8000 >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT
sleep 1
open http://127.0.0.1:8000
wait "$SERVER_PID"
