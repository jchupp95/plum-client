#!/bin/sh
set -eu

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

API_URL="$(escape_js "${VITE_API_URL:-http://127.0.0.1:8000}")"

cat > /usr/share/nginx/html/config.js <<EOF
window.PLUM_CONFIG = {
  VITE_API_URL: "$API_URL"
};
EOF

exec nginx -g 'daemon off;'
