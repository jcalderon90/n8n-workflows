# Skill: Spectrum Agente Unificado
Este skill contiene las reglas de negocio, mapeos técnicos y arquitectura del ecosistema de agentes de SPECTRUM VIVIENDA.

## 1. Arquitectura del Sistema
El sistema es una arquitectura multi-agente orquestada por n8n:
- **Orquestador (`Principal.json`):** Clasifica intenciones y delega a tools. Mantiene el flag `conversation_analysis` para control de sincronización.
- **Tools Specialized:** `lead_collector`, `kb_search`, `rsvp`, `send_media`.
- **Persistencia:** MongoDB Atlas (colecciones: `users`, `appointments`, `chat_histories*`).
- **Sincronización:** `Sync_CRM.json` ( SOAP Dynamics 365).

## 2. Reglas del CRM (SOAP API)
### Endpoint y Headers
- **URL:** `https://crm.spectrum.com.gt:8055/Spectrum_WS_GeneracionLead/Service.asmx`
- **SOAPAction:** `http://tempuri.org/CreacionClientePotencialBot`
- **Content-Type:** `text/xml; charset=utf-8`

### Campos Críticos (Typos Obligatorios)
- Correo principal: `<_CorreEletronico>`
- Campaña UTM: `<_UTMCampaing>`

### Lógica de Etiquetas Opcionales
- **Regla:** Solo se deben enviar etiquetas que tengan valor. Si el dato es nulo o vacío, la etiqueta debe omitirse completamente del XML (excepto `_Comentarios`).
- **Implementación:** Usar expresiones ternarias en n8n: `{{ $json.valor ? '<_Etiqueta>' + $json.valor + '</_Etiqueta>' : '' }}`.

## 3. Mapeo de Catálogos

### Proyectos (`_Proyecto`)
| Código Interno | Código CRM | Proyecto |
|---|---|---|
| `pvv` | `PVV` | Parque Vista Verde |
| `pm` | `PMAR` | Parque Mariscal |
| `pp` | `PPO` | Parque Portales |

### Estado Civil (`_EstadoCivil`)
- **Soltero:** `100000000`
- **Casado:** `100000001`
- **Divorciado:** `100000002`
- **Unido / Unión Libre:** `100000003`

### Número de Habitaciones (`_NumeroHabitaciones`)
- **1:** `100000000`
- **2:** `100000001`
- **3:** `100000002`

### Intención de Compra (`_MotivoInteres`)
- **Inversión (I):** `100000001`
- **Vivir (V):** `100000003`
- **Información General:** `100000000`

### Canales (`_UTMSource`)
- **WhatsApp:** `100000004`
- **Facebook:** `100000005`
- **Instagram:** `100000012`

## 4. Lógica de Sincronización Diferida (`Sync_CRM`)
1. **Trigger:** Schedule cada 10-15 minutos.
2. **Filtro Inactividad:** Busca leads con `last_interaction` < 15 minutos atrás y `conversation_analysis != true`.
3. **Enriquecimiento:** Usa un Information Extractor para generar `Resumen` y `Dudas` de la conversación antes de enviar al CRM.
4. **Control de Duplicidad:** Marca `conversation_analysis = true` tras el éxito del sync. El orquestador principal debe resetear este flag a `false` con cada nuevo mensaje del usuario.

## 5. Auditoría de Calidad
- **Colección:** `quality_logs`.
- **Proceso:** Corre tras el sync del CRM. Evalúa tono, uso de tools y avance en el funnel.
