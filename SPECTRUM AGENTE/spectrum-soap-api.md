# Spectrum CRM — API SOAP Reference
**Operación:** `CreacionClientePotencialBot` · **Entorno:** Producción  
**Versión:** 1.0 · **Fecha:** Abril 2026 · **Protocolo:** SOAP 1.1

---

## 01. Endpoint de Producción

```
POST https://crm.spectrum.com.gt:8055/Spectrum_WS_GeneracionLead/Service.asmx
```

---

## 02. Headers HTTP Requeridos

| Header | Valor |
|---|---|
| `Content-Type` | `text/xml; charset=utf-8` |
| `SOAPAction` | `http://tempuri.org/CreacionClientePotencialBot` |

---

## 03. Campos del Request

> Los campos opcionales se omiten del XML cuando no tienen valor. Solo `_Comentarios` puede ir vacío.

| Campo XML | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_OrigenCliente` | Int | ✅ Sí | Siempre: `100000001` |
| `_Proyecto` | String | ✅ Sí | Código del proyecto → ver §4.1 |
| `_Nombre` | String | ✅ Sí | Primer nombre del lead |
| `_Apellido` | String | ✅ Sí | Primer apellido (usar `"N/A"` si no disponible) |
| `_TelefonoMovil` | String | ✅ Sí | Con código de país: `+502XXXXXXXX` |
| `_CorreEletronico` | String | ✅ Sí | Email principal ⚠️ typo en nombre del campo |
| `_CorreoSecundario` | String | No | Email secundario — omitir si no hay |
| `_UTMSource` | Int | ✅ Sí | Canal de ingreso → ver §4.2 |
| `_UTMCampaing` | String | No | Nombre de campaña ⚠️ typo en nombre del campo |
| `_MetodocontactoPref` | Int | ✅ Sí | Método de contacto preferido → ver §4.3 |
| `_Comentarios` | String | No | Texto libre — puede ir vacío `<_Comentarios/>` |
| `_NumeroHabitaciones` | Int | No | Habitaciones de interés → ver §4.4 |
| `_EstadoCivil` | Int | No | Estado civil → ver §4.5 |
| `_MotivoInteres` | Int | No | Motivo de interés → ver §4.6 |
| `_FechaCita` | String | No | ISO 8601: `2026-05-10T15:00:00.000Z` — solo si hay cita |
| `_TipoCita` | Int | No | Tipo de cita → ver §4.7 |
| `_ResumenConversacion` | String | No | Resumen generado por el agente AI |
| `_DudasCliente` | String | No | Dudas capturadas durante la conversación |

---

## 04. Catálogos de Valores

### 4.1 Proyectos (`_Proyecto`)

| Proyecto | Código |
|---|---|
| Parque Vista Verde | `PVV` |
| Parque Mariscal | `PMAR` |
| Parque Portales | `PPO` |

### 4.2 Canal de ingreso (`_UTMSource`)

| Canal | Valor |
|---|---|
| Facebook | `100000005` |
| WhatsApp | `100000004` |
| Instagram | `100000012` |

### 4.3 Método de contacto preferido (`_MetodocontactoPref`)

| Método | Valor |
|---|---|
| Correo electrónico | `2` |
| Llamada telefónica | `3` |
| WhatsApp | `4` |
| Cualquier forma | `5` |

### 4.4 Número de habitaciones (`_NumeroHabitaciones`)

| Habitaciones | Valor |
|---|---|
| 1 habitación | `100000000` |
| 2 habitaciones | `100000001` |
| 3 habitaciones | `100000002` |

### 4.5 Estado civil (`_EstadoCivil`)

| Estado | Valor |
|---|---|
| Soltero | `100000000` |
| Casado | `100000001` |
| Divorciado | `100000002` |
| Unido | `100000003` |

### 4.6 Motivo de interés (`_MotivoInteres`)

| Motivo | Valor |
|---|---|
| Quiero más información | `100000000` |
| Para inversión | `100000001` |
| Estoy listo para comprar | `100000002` |
| Para habitar | `100000003` |

### 4.7 Tipo de cita (`_TipoCita`)

| Tipo | Valor |
|---|---|
| Cita presencial | `100000000` |
| Llamada / Virtual | `100000001` |

---

## 05. Ejemplo de Request Completo

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreacionClientePotencialBot xmlns="http://tempuri.org/">
      <_OrigenCliente>100000001</_OrigenCliente>
      <_Proyecto>PVV</_Proyecto>
      <_UTMCampaing>Cliente atendido desde Chatbot</_UTMCampaing>
      <_UTMSource>100000004</_UTMSource>
      <_Nombre>Juan</_Nombre>
      <_Apellido>Pérez</_Apellido>
      <_TelefonoMovil>+50212345678</_TelefonoMovil>
      <_CorreEletronico>juan@example.com</_CorreEletronico>
      <_MetodocontactoPref>4</_MetodocontactoPref>
      <_Comentarios/>
      <_NumeroHabitaciones>100000001</_NumeroHabitaciones>
      <_EstadoCivil>100000000</_EstadoCivil>
      <_MotivoInteres>100000001</_MotivoInteres>
      <_FechaCita>2026-05-10T15:00:00.000Z</_FechaCita>
      <_TipoCita>100000000</_TipoCita>
      <_ResumenConversacion>Lead interesado en 2 hab para inversión.</_ResumenConversacion>
    </CreacionClientePotencialBot>
  </soap:Body>
</soap:Envelope>
```

---

## 06. Respuesta del Servicio

```xml
<CreacionClientePotencialBotResponse xmlns="http://tempuri.org/">
  <CreacionClientePotencialBotResult>Registro Actualizado</CreacionClientePotencialBotResult>
</CreacionClientePotencialBotResponse>
```

| Resultado | Significado |
|---|---|
| `Registro Actualizado` | ✅ Lead creado o actualizado exitosamente |
| Otro valor / error HTTP | ❌ Revisar payload — campos faltantes o valores inválidos |

---

## 07. Bugs Conocidos y Notas

> ⚠️ **TYPO — campo email:** el tag XML es `<_CorreEletronico>` (le falta "o" en Correo y "c" en Electrónico). Usar exactamente ese nombre.

> ⚠️ **TYPO — UTM Campaign:** el tag XML es `<_UTMCampaing>` (falta la "i" en Campaign). Usar exactamente ese nombre.

> ℹ️ **Campos opcionales:** omitir del XML cuando no tienen valor. Solo `_Comentarios` puede enviarse vacío como `<_Comentarios/>`.

> ℹ️ **Fecha de cita:** formato ISO 8601 con timezone UTC. Ejemplo: `2026-05-10T15:00:00.000Z`

> 🐛 **BUG en nodo n8n BODY:** el mapping de `_EstadoCivil` usa valores `100000001–100000005`. Los valores correctos según el CRM son `100000000–100000003`. Corregir antes de usar en producción.