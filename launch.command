#!/bin/bash
cd "$(dirname "$0")/dist" || exit 1
open http://127.0.0.1:8000
python3 -m http.server 8000
