# Configuración de Base de Datos por MCP (Model Context Protocol)

Esta carpeta contiene la configuración necesaria para que agentes de Inteligencia Artificial (como Claude, Gemini, Cursor u otros compatibles con el protocolo MCP) puedan conectarse de manera segura a la base de datos de MongoDB del proyecto **Spectrum Agente Unificado**.

## Estructura

- `mongodb-mcp.json`: Archivo JSON estándar con la estructura de un servidor MCP.
- `claude_desktop_config.json`: Ejemplo de configuración lista para usarse en Claude Desktop.

## Base de Datos

El proyecto se conecta a la base de datos `Centralizado` en MongoDB Atlas.

**Modo Lectura:** El servidor MCP está configurado intencionalmente con `"MDB_MCP_READONLY": "true"`. Esto garantiza que los agentes de IA o desarrolladores que analicen la base de datos solo puedan ver esquemas, estructuras y realizar consultas (queries) sin riesgo de modificar o eliminar datos accidentalmente.

## Cómo Utilizarlo

### En Claude Desktop
1. Localiza el archivo de configuración de tu aplicación de Claude Desktop. Generalmente está en:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Copia el contenido del archivo `claude_desktop_config.json` provisto en esta carpeta y añádelo a tu configuración.
3. Reinicia Claude Desktop. Podrás ver las herramientas y recursos de la base de datos integrados.

### En Cursor u otros IDEs compatibles con MCP
1. Ve a la sección de configuración de MCP de tu editor (ej. en Cursor, Features > MCP).
2. Añade un nuevo servidor de tipo `command`.
3. Especifica el comando `npx` y los argumentos provistos en `mongodb-mcp.json`.
4. Asegúrate de incluir las variables de entorno para que se conecte correctamente.

### Dependencias
Para que el servidor local de MCP se inicie correctamente, necesitas tener instalado **Node.js** y **npx** en tu sistema. Al ejecutarse por primera vez, `npx` descargará e iniciará el paquete oficial de MongoDB MCP Server.

## Herramientas MCP disponibles
Una vez conectado, el Agente podrá:
- Listar las colecciones de la base de datos `Centralizado`.
- Consultar los esquemas o la estructura de los documentos.
- Ejecutar consultas `find` o `aggregate` para analizar el estado de los leads y las interacciones del agente guardadas.
