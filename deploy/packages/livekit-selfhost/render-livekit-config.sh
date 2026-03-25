#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-$BASE_DIR/.env}"
TEMPLATE_FILE="${2:-$BASE_DIR/livekit.yaml.template}"
OUTPUT_FILE="${3:-$BASE_DIR/generated/livekit.yaml}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "Template file not found: $TEMPLATE_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

while IFS='=' read -r key value; do
  [[ -z "${key}" || "${key}" =~ ^# ]] && continue
  key="$(echo "$key" | xargs)"
  value="$(echo "$value" | xargs)"
  safe_value="${value//\//\\/}"
  sed -i "s/{{${key}}}/${safe_value}/g" "$OUTPUT_FILE"
done < "$ENV_FILE"

if grep -q '{{[A-Z0-9_][A-Z0-9_]*}}' "$OUTPUT_FILE"; then
  echo "Missing values remain in $OUTPUT_FILE" >&2
  exit 1
fi

echo "Rendered $OUTPUT_FILE"
