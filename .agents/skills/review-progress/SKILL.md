---
name: review-progress
description: Revisa y valida la implementación del cálculo de progreso en Python contrastándola contra los requisitos oficiales. Ejecuta comprobaciones automáticas y genera un informe estructurado de hallazgos sin modificar el código.
---

# Revisión de Progreso (Review Progress)

Esta habilidad guía al agente para auditar de forma rigurosa la función o archivo de cálculo de progreso (por ejemplo `progress.py`), evaluando su conformidad con las reglas de negocio, ejecutando pruebas automáticas y elaborando un informe estandarizado de hallazgos sin modificar el código fuente del usuario.

---

## Recursos y Referencias de la Habilidad

Para ejecutar esta revisión, debes consultar y utilizar los siguientes recursos enlazados:

- **Requisitos y Reglas Oficiales:** [requirements.md](./references/requirements.md) (o [reference/requirements.md](./reference/requirements.md))
- **Plantilla de Informe de Salida:** [report.md](./assets/report.md)
- **Script de Pruebas Automatizadas:** [test_progress.py](./scripts/test_progress.py)

---

## Flujo de Trabajo para el Agente

Cuando se active esta habilidad para revisar un archivo o función de progreso, ejecuta secuencialmente los siguientes pasos:

### 1. Cargar las Reglas de Negocio
Lee detenidamente [requirements.md](./references/requirements.md) y tómalo como la única fuente de verdad:
- Lista vacía $\rightarrow$ progreso `0`.
- Cada reto es un diccionario con `"título"` (texto) y `"completado"` (booleano).
- Porcentaje: `(completados / total) * 100`.
- Redondeo con `round` nativo de Python (al entero más cercano; en caso de empate exacto, al entero par).
- Inmutabilidad estricta: la función no debe mutar la lista ni los diccionarios de entrada.
- Fuera de alcance: no penalizar la ausencia de validaciones de tipos ajenos.

### 2. Inspección Estática del Código
Localiza el archivo objetivo (por defecto `progress.py` en la raíz del proyecto o la ruta especificada por el usuario). Inspecciona:
- El nombre y signatura de la función.
- El manejo del caso de borde con lista vacía.
- La fórmula matemática y la función de redondeo empleada.
- Posibles efectos secundarios o mutaciones sobre la lista recibida.

### 3. Ejecución de Comprobaciones Dinámicas
Ejecuta el script de prueba provisto en la habilidad mediante la herramienta de comandos:

```pwsh
python .agents/skills/review-progress/scripts/test_progress.py [ruta/al/archivo]
```

- Analiza la salida del comando.
- Registra qué casos fueron aprobados y cuáles fallaron con su respectivo detalle de error.
- **Importante:** Distingue con total claridad los resultados probados mediante el comando de las deducciones obtenidas por análisis estático.

### 4. Elaboración del Informe de Revisión
Construye la respuesta final siguiendo estrictamente la estructura y directrices de la plantilla [report.md](./assets/report.md):

```markdown
# Revisión del progreso

## Resumen
[Estado general en dos frases claras y directas]

## Hallazgos
[Por cada problema detectado: ubicación exacta en el archivo/línea, comportamiento observado, comportamiento esperado según requirements.md y evidencia empírica. Si la implementación cumple todas las reglas, indicarlo expresamente.]

## Comprobaciones
[Comando exacto ejecutado, lista de casos aprobados/fallidos y limitaciones de la prueba. Recuerda distinguir resultados ejecutados de deducciones.]

## Siguiente paso
[Cambio mínimo y concreto propuesto para solucionar el o los problemas encontrados. NO apliques cambios sobre el código.]
```

---

## Restricciones y Guardrails

1. **NO modificar código:** Bajo ninguna circunstancia debes editar, corregir o refactorizar el código durante la revisión. Tu labor es únicamente auditar, ejecutar comprobaciones e informar.
2. **Apego estricto a las especificaciones:** No introduzcas requisitos adicionales que no estén definidos en [requirements.md](./references/requirements.md).
3. **Fidelidad de formato:** La salida debe respetar al pie de la letra los encabezados definidos en [report.md](./assets/report.md).

