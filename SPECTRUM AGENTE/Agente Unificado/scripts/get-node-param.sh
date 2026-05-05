#!/bin/bash
# Extrae un parámetro específico de un nodo n8n.
# Uso: ./scripts/get-node-param.sh <archivo.json> <nombre-nodo> <parametro>
# Ejemplos:
#   ./scripts/get-node-param.sh "AGENT PRINCIPAL.json" "PRINCIPAL" "systemMessage"
#   ./scripts/get-node-param.sh "AGENT PRINCIPAL.json" "Prepare Update" "assignments"
#   ./scripts/get-node-param.sh "AGENT PRINCIPAL.json" "Hay Cambios?" "jsCode"

FILE="$1"
NODE="$2"
PARAM="$3"

if [[ -z "$FILE" || -z "$NODE" || -z "$PARAM" ]]; then
  echo "Uso: $0 <archivo.json> <nombre-nodo> <parametro>" >&2
  echo "Parámetros comunes: systemMessage, text, jsCode, assignments, conditions" >&2
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "Error: jq no está instalado. Ejecuta: brew install jq" >&2
  exit 1
fi

# Primero busca en .parameters directamente
RESULT=$(jq --arg name "$NODE" --arg param "$PARAM" \
  '.nodes[] | select(.name == $name) | .parameters[$param]' "$FILE")

if [[ -z "$RESULT" || "$RESULT" == "null" ]]; then
  echo "Parámetro '$PARAM' no encontrado directamente." >&2
  echo "Parámetros disponibles en '$NODE':" >&2
  jq --arg name "$NODE" '.nodes[] | select(.name == $name) | .parameters | keys' "$FILE" >&2
  exit 1
fi

echo "$RESULT"
