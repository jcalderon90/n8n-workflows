# Resumen detallado — Uso del endpoint SOAP de Spectrum en producción

## ⚠️ Observación crítica antes del resumen

En todas las referencias que encontré de tus proyectos, la URL que está en uso es:

```
https://crm.spectrum.com.gt:8066/Spectrum_WS_GeneracionLead_Dev/service.asmx
```

El sufijo **`_Dev`** en la ruta indica que es el **entorno de desarrollo**, no producción. Si estás enviando leads reales a esa URL, o (a) el entorno "Dev" está actuando como productivo de facto, o (b) hay una URL productiva separada (sin `_Dev`) que todavía no aparece documentada en tus workflows. Conviene confirmar con Spectrum cuál es el path productivo antes de asumirlo.

---

## 1. Endpoint y protocolo

- **Host:** `crm.spectrum.com.gt` · puerto `8066` · HTTPS
- **Path:** `/Spectrum_WS_GeneracionLead_Dev/service.asmx`
- **Método HTTP:** `POST`
- **Operación SOAP:** `CreacionClientePotencialBot` (una sola operación expuesta)
- **Headers obligatorios:**
  - `Content-Type: text/xml; charset=utf-8`
  - `SOAPAction: http://tempuri.org/CreacionClientePotencialBot`
- **Namespace:** `http://tempuri.org/` (típico de servicios ASMX/.NET sin renombrar — indica que el backend es un Web Service ASP.NET)
- **CRM de fondo:** Dynamics 365 (los lookups `100000000`, `100000001`, `100000004` son los IDs de option-set de Dynamics)

## 2. Contrato de la petición (envelope real en producción)

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreacionClientePotencialBot xmlns="http://tempuri.org/">
      <_OrigenCliente>100000001</_OrigenCliente>
      <_Proyecto>PPO</_Proyecto>
      <_Comentarios>Lead generado desde chatbot</_Comentarios>
      <_UTMSource>100000004</_UTMSource>
      <_UTMCampaing>Cliente atendido desde Chatbot</_UTMCampaing>
      <_Nombre>fernando</_Nombre>
      <_Apellido>ortiz</_Apellido>
      <_TelefonoMovil>50254113908</_TelefonoMovil>
      <_CorreEletronico>fernando.ortiz@garooinc.com</_CorreEletronico>
      <_MetodocontactoPref>5</_MetodocontactoPref>
      <_ResumenConversacion>{{ resumen generado por LLM }}</_ResumenConversacion>
      <_DudasCliente>{{ dudas generadas por LLM }}</_DudasCliente>
    </CreacionClientePotencialBot>
  </soap:Body>
</soap:Envelope>
```

### Typos del contrato (no corregirlos, Spectrum los espera así)

- `_CorreEletronico` — falta la "c": debería ser `_CorreoElectronico`
- `_UTMCampaing` — debería ser `_UTMCampaign`

Ambos están hardcodeados del lado servidor. Si los corriges, el lead no se crea.

## 3. Valores fijos vs. dinámicos (según se ve en MongoDB `users.CRM_Data`)

**Fijos por proyecto / canal:**
- `_OrigenCliente: "100000001"` — "Chatbot" en el option-set
- `_UTMSource: "100000004"` — canal WhatsApp/Chatbot
- `_UTMCampaing: "Cliente atendido desde Chatbot"`
- `_Comentarios: "Lead generado desde chatbot"`
- `_MetodocontactoPref: "5"` — preferencia de contacto por WhatsApp

**Dinámicos por proyecto:**
- `_Proyecto`: `PPO` (Parque Portales) — los otros códigos (Parque Verde, Parque Mariscal) viven en su propio workflow con su propio credential OpenAI (`"Spectrum - Parque Verde"` es uno de ellos)

**Dinámicos por conversación:**
- Datos de contacto (`_Nombre`, `_Apellido`, `_TelefonoMovil`, `_CorreEletronico`) — extraídos del chat por el LLM
- `_ResumenConversacion` y `_DudasCliente` — generados por el nodo LLM al cierre de la conversación

## 4. Patrón de integración en n8n (flujo productivo observado)

- **Disparo:** Schedule Trigger cada 15 min
- **Filtro MongoDB** en colección `users`:
  ```json
  {
    "$expr": { "$lt": ["$last_interaction", { "$toDate": "{{cutoff}}" }] },
    "conversation_analysis": false,
    "CRM_Data": { "$exists": true }
  }
  ```
  Idea: procesa solo usuarios que ya tienen `CRM_Data` precalculado, no se han analizado todavía, y llevan 15 min sin interactuar (se asume conversación cerrada)
- **Join de historiales:** nodo `Set` llamado `Messages` que concatena `Find Chat Histories Lead` + `Find Chat Histories`
- **LLM:** `@n8n/n8n-nodes-langchain.lmChatOpenAi` con `gpt-4.1-mini`, structured output con atributos `Resumen` y `Dudas`
- **HTTP Request SOAP:** método `POST`, body Raw/XML, inyecta los dos campos del LLM + todos los valores de `CRM_Data` al template XML
- **Cierre:** update en MongoDB para marcar `conversation_analysis: true` (evita reprocesar)

## 5. Piezas del ecosistema Spectrum que tocan este endpoint

- **Sof-IA (Parque Portales)** — bot WhatsApp en Zona 17, primer proyecto que hizo el patrón
- **Spectrum - Parque Verde / Vista Verde** — credential OpenAI dedicado, replicando el mismo patrón
- **Parque Mariscal (Zona 11)** — mismo patrón, su knowledge base vive en paralelo
- Cada uno escribe un documento en MongoDB con `CRM_Data._Proyecto` distinto

## 6. Lo que **no** está pasando al endpoint aunque el contrato lo acepta

En los documentos reales faltan varios campos del contrato completo:
- `_CorreoSecundario`
- `_NumeroHabitaciones`
- `_EstadoCivil`
- `_FechaCita` / `_TipoCita` (los leads actuales son sin cita agendada; las citas vienen por otro flujo — el reporte "Citas Agendadas" los captura aparte con `appointment_mode` vacío)

Esto es un hueco: **si un lead del chatbot ya agenda cita, esa información no está llegando al CRM por este endpoint** en tu flujo actual.

---

## Puntos que te sugiero verificar (no asumir)

- Confirmar con Spectrum la URL de producción real (sin `_Dev`)
- Revisar si existe un endpoint aparte para *actualizar* el lead con la cita, o si debería reusarse el mismo `CreacionClientePotencialBot` con `_FechaCita` poblado
- Centralizar `_OrigenCliente`, `_UTMSource`, `_UTMCampaing`, `_MetodocontactoPref` en variables de entorno de n8n para no repetirlos en cada workflow por proyecto
- Auditar el campo `appointment_mode` vacío — el flujo de agendamiento no está capturándolo, lo que rompe la trazabilidad presencial/virtual en el CRM

¿Quieres que profundice en alguno de estos puntos, o que arme un workflow unificado que cubra también el caso "lead con cita"?