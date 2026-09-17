#!/bin/sh
set -eu

output_file="${RUNTIME_ENV_FILE:-/usr/share/nginx/html/env-config.js}"
tmp_file="$(mktemp)"

{
  printf 'window.__ENV__ = {\n'
  first=true
  env | sort | while IFS='=' read -r key value; do
    case "$key" in
      REACT_APP_*)
        escaped_value=$(printf '%s' "$value" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
        if [ "$first" = true ]; then
          first=false
        else
          printf ',\n'
        fi
        printf '  "%s": "%s"' "$key" "$escaped_value"
        ;;
    esac
  done
  printf '\n};\n'
} > "$tmp_file"

mv "$tmp_file" "$output_file"

exec "$@"