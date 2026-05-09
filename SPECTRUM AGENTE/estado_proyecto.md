# 🏢 SPECTRUM VIVIENDA: Agente Unificado — Estado del Proyecto
> Última actualización: 2026-05-06 (Definición de estrategia UTM Tracking para implementación mañana)

## 🎯 Objetivo General
Arquitectura de agente conversacional modular para SPECTRUM VIVIENDA. Un orquestador central (*Sof-IA*) delega tareas a sub-workflows especializados (Tools), con persistencia centralizada en MongoDB y sincronización diferida al CRM Dynamics 365 vía SOAP.

---

## 🛠️ Stack Tecnológico

| Componente | Detalle |
|---|---|
| **Orquestación** | n8n — workflows modulares vinculados via `Execute Workflow` |
| **Modelos IA** | `gpt-5.4-mini` (Orquestador), `gpt-5-mini` (KB Search), `gpt-4o` (Media) |
| **Base de Datos** | MongoDB Atlas — colecciones `users`, `appointments`, `chat_histories`, `quality_logs` |
| **Vector Search** | MongoDB Atlas Vector Index (`spectrum_vector_index`) — Filtrado por campo `proyecto` |
| **Buffer/Cache** | Redis — Message Debouncing (agrupa mensajes rápidos) |
| **CRM** | Dynamics 365 via SOAP (Standardized Mappings) |
| **Canales** | ManyChat (WhatsApp, Instagram, Messenger) |

---

## 📦 Módulos (Workflows)

### 1. 🧠 Orquestador Central — `AGENT PRINCIPAL.json`
**Estado: ✅ Activo en n8n** | ID: `iXaptKTUXaXrP7aF` | 59 nodos | Última mod: 2026-05-06

- ✅ **Completado**: Estandarización de tono a **tuteo/tadeo** (*puedes, prefieres*). Se añadió instrucción explícita en el *System Message* para prohibir el voseo (*podés*).
- ✅ **Completado**: Corrección de ambigüedad Zona 15 y lógica de notificación única.

### 2. 👤 Captador de Leads — `Lead Collector.json`
**Estado: ✅ Activo en n8n** | ID: `SHPFhvoal7k1Rqf9` | 15 nodos | Última mod: 2026-05-06

- ✅ **Completado**: Cambio de tono de *voseo* a *tuteo* en todos los mensajes y escenarios.
- ✅ **Completado**: Reconocimiento de modismos guatemaltecos como confirmación.

### 3. 📚 Experto en Proyectos — `KB SEARCH.json`
**Estado: ✅ Activo en n8n** | ID: `D3LKuNi6CmMIdvzg` | 8 nodos | Última mod: 2026-05-06

- ✅ **Completado**: Estandarización de variantes de CTA a tuteo (*¿Cuál prefieres?*).
- ✅ **Completado**: Uso de `gpt-5-mini` para respuestas rápidas.

---

## 📂 Knowledge Base (KBs)
Se han actualizado los archivos JSON en `/KBs`:

- [x] **PPOL** (Polanco): Actualizado a **Sótano 2**, costo de reserva **Q15,000** (quetzales únicamente), eliminado término **"Black Box"** (ahora "Centro de Experiencia") y removida sección de **IUSI**.
- [x] **PPO**, **PMAR**, **PSB**: Se eliminó la entrada del **IUSI** de todos los archivos para evitar "info-dumping" técnico.

---

## 🚀 Punto Actual del Proyecto

El sistema ha sido refinado para cumplir con los estándares de comunicación de Spectrum (tuteo) y la información comercial actualizada de Polanco.

### ✅ Completado recientemente (2026-05-06)
- **Estandarización de Tono:** Eliminación total del voseo (*sos, podés, preferís*) en todos los prompts del sistema y reemplazo por tuteo (*eres, puedes, prefieres*).
- **Actualización Polanco:** Sincronización de KB con la nueva realidad comercial (Sótano 2, Q15k reserva, fin de "Black Box").
- **Limpieza de IUSI:** Eliminación de explicaciones de impuestos en todos los KBs para simplificar respuestas.

### 🔜 Pendiente antes de producción (RE-VECTORIZACIÓN CRÍTICA)

| # | Tarea | Bloqueante | Estado |
|---|---|---|---|
| 1 | **Re-vectorizar Polanco** — Borrar PPOL en MongoDB y cargar `KB PL.json` nuevo | Sí — o el bot seguirá diciendo Sótano 3 | ⏳ Pendiente |
| 2 | **Limpiar IUSI en MongoDB** — Borrar entradas con tag "iusi" en todos los proyectos | No — pero evita respuestas innecesarias | ⏳ Pendiente |
| 3 | **Fix Gmail Notifications/RSVP** — quitar overrides de destinatario Jorge | Sí | ⏸️ Pausado |
| 4 | **URLs reales SEND MEDIA** — placeholders de PMAR y PPO | Sí | ⏸️ Pausado |
| 5 | **Implementar UTM Tracking (Regex en n8n)** — Añadir Nodo Code en `AGENT PRINCIPAL.json` tras el Webhook para parsear keywords del `last_input_text` (Ver `estrategia_captacion_whatsapp.md`) | Sí | ⏳ Pendiente |
| 6 | **Pruebas E2E Finales** — validar el nuevo tono "tuteo" en vivo | Sí | ⏳ Pendiente |

---
> **Nota de Seguridad:** Se respeta la prohibición de modificar la configuración del nodo SOAP API fuera de la interfaz de n8n por parte del usuario.
 API fuera de la interfaz de n8n por parte del usuario.
