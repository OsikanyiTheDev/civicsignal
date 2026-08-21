#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/lambda/src"
OUTPUT_DIR="${ROOT_DIR}/lambda/dist"
OUTPUT_FILE="${OUTPUT_DIR}/civicsignal-api.zip"

mkdir -p "${OUTPUT_DIR}"
rm -f "${OUTPUT_FILE}"

(
  cd "${SOURCE_DIR}"
  zip -qr "${OUTPUT_FILE}" .
)

echo "Packaged ${OUTPUT_FILE}"
