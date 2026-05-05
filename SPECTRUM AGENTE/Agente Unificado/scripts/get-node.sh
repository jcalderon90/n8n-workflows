#!/bin/bash
# Extrae un nodo completo de un workflow n8n por nombre exacto.
# Uso: ./scripts/get-node.sh <archivo.json> <nombre-nodo>
# Ejemplo: ./scripts/get-node.sh "AGENT PRINCIPAL.json" "Prepare Update"

FILE="$1"
NODE="$2"

if [[ -z "$FILE" || -z "$NODE" ]]; then
  echo "Uso: $0 <archivo.json> <nombre-nodo>" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq no está instalado. Ejecuta: brew install jq" >&2
  exit 1
fi

RESULT=$(jq --arg name "$NODE" '.nodes[] | select(.name == $name)' "$FILE")

if [[ -z "$RESULT" ]]; then
  echo "Nodo '$NODE' no encontrado en '$FILE'." >&2
  echo "Nodos disponibles:" >&2
  jq -r '.nodes[].name' "$FILE" | sort >&2
  exit 1
fi

echo "$RESULT"
