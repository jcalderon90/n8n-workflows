#!/usr/bin/env python3
import re

# Leer archivo
with open('AGENT PRINCIPAL.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Cambio 1: Quitar 'zona 15' del mapeo de PVV
old = '"Vista Verde", "Verde", "zona 15", "PVV", "Parque Vista Verde - Zona 15"'
new = '"Vista Verde", "Verde", "PVV", "Parque Vista Verde - Zona 15"'

if old in content:
    content = content.replace(old, new)
    print('✅ 1. Eliminado "zona 15" del mapeo PVV')
else:
    print('⚠️ 1. No se encontró el texto exacto (puede que ya esté cambiado o tenga formato diferente)')

# Cambio 2: Agregar sección de ambigüedad
if '## REGLAS DE AMBIGÜEDAD POR ZONA ##' not in content:
    reglas = '''## REGLAS DE AMBIGÜEDAD POR ZONA ##
- Cuando el usuario mencione SOLO una zona (ej: "zona 15", "la de zona 15") y existan múltiples proyectos en esa zona:
  1. NO asumas ningún proyecto
  2. Usa `accion.tipo: "aclarar"`
  3. Pregunta: "En la zona 15 tenemos dos proyectos: Parque Vista Verde y Sotobosque Parque Boutique. ¿Cuál te interesa?"
  4. `estado_proyecto.proyecto` debe quedar en `null` hasta que el usuario aclare
- Zonas con ambigüedad conocida:
  - Zona 15: PVV (Vista Verde) y PSB (Sotobosque)

'''
    content = content.replace('## FORMATO DE SALIDA', reglas + '## FORMATO DE SALIDA')
    print('✅ 2. Agregada sección REGLAS DE AMBIGÜEDAD POR ZONA')
else:
    print('ℹ️ 2. La sección de ambigüedad ya existe')

# Guardar
with open('AGENT PRINCIPAL.json', 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Archivo actualizado: AGENT PRINCIPAL.json')
