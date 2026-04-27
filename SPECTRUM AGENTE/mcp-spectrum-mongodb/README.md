# Spectrum MongoDB MCP Server

Este es un servidor MCP personalizado para extraer datos de la base de datos MongoDB de Spectrum.

## Configuración

1. Asegúrate de que las dependencias estén instaladas:
   ```bash
   cd mcp-spectrum-mongodb
   npm install
   ```

2. El archivo `.env` ya contiene la cadena de conexión:
   ```
   MONGODB_URI=mongodb+srv://jorgecalderon_db_user:hvV2fwG1dGcWVuAT@cluster0.es7z0bi.mongodb.net/
   ```

## Cómo usar con Claude Desktop

Para usar este servidor en Claude Desktop, añade lo siguiente a tu archivo de configuración (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "spectrum-mongodb": {
      "command": "node",
      "args": [
        "/Users/jorgecalderon/Desktop/PROYECTOS/n8n-workflows/SPECTRUM AGENTE/mcp-spectrum-mongodb/index.js"
      ],
      "env": {
        "MONGODB_URI": "mongodb+srv://jorgecalderon_db_user:hvV2fwG1dGcWVuAT@cluster0.es7z0bi.mongodb.net/"
      }
    }
  }
}
```

## Herramientas Incluidas

- `list_databases`: Lista todas las bases de datos en el cluster.
- `list_collections`: Lista las colecciones de una base de datos específica.
- `find_documents`: Busca documentos en una colección (soporta filtros y límites).
- `aggregate`: Ejecuta pipelines de agregación complejos.
