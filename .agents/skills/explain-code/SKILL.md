---
name: explain-code
description: Explica código existente para aclarar, recordar o afianzar conceptos de programación, incluyendo ejemplos prácticos, aclaración obligatoria de abreviaturas y una pregunta de autoevaluación. Habilidad puramente explicativa que no modifica ni refactoriza código.
---

# Explicación y Afianzamiento de Código

Habilidad puramente explicativa orientada a programadores que ya cuentan con conocimientos técnicos pero desean aclarar, recordar o afianzar conceptos clave, desglosando la lógica, detallando abreviaturas y reforzando el entendimiento sin alterar jamás el código.

---

## Cuándo usar

- Cuando el usuario solicita comprender, desglosar, repasar o recordar cómo funciona una función, archivo, componente o bloque de código.
- Cuando el usuario busca consolidar o reforzar conceptos específicos de programación o arquitectura presentes en el proyecto.

## Cuándo NO usar (Límites estrictos)

- **PROHIBIDO modificar código:** Esta habilidad es 100% de solo lectura. No debes editar archivos, no debes refactorizar ni sugerir reescrituras de código salvo que el usuario lo solicite expresamente en un mensaje posterior.
- **PROHIBIDO implementar nuevas funciones:** Si el usuario pide crear nuevas funcionalidades, no apliques esta habilidad.
- **PROHIBIDO resolver bugs en este modo:** Si el usuario reporta un error o excepción, dirígelo hacia un flujo de depuración en lugar de usar esta habilidad explicativa.

---

## Pautas del Flujo Explicativo

Cuando se invoque esta habilidad, estructura la respuesta siguiendo estos pasos:

### 1. Resumen Conceptual Directo
- Explica qué hace el código y cuál es su responsabilidad principal de forma clara y directa (adecuada para alguien con conocimientos técnicos que busca repasar o afianzar la idea central).
- Si la lógica involucra un patrón de diseño o concepto arquitectónico (ej. inmutabilidad, debounce, guard clauses, middlewares), nómbralo y define brevemente su propósito.

### 2. Aclaración de Abreviaturas y Términos Técnicos
- **Regla obligatoria:** Si en el código o en la explicación se utilizan variables abreviadas, acrónimos o términos condensados (ej. `ctx`, `cb`, `req`, `res`, `SSR`, `DOM`, `props`, `API`, `payload`, `fn`), define explícitamente a qué término o palabra completa hacen referencia y su función en ese contexto.

### 3. Desglose Lógico Paso a Paso
- Explica el flujo de datos: qué entra, cómo se transforma y qué retorna.
- Detalla el **porqué** de decisiones concretas (por ejemplo, por qué se valida antes, por qué se usa cierta estructura de datos o método).
- Resalta los puntos clave o detalles sutiles que suelen olvidarse o generar dudas conceptuales.

### 4. Ejemplo Práctico de Ejecución
- Proporciona un caso concreto con datos de entrada representativos y el resultado de salida esperado, mostrando brevemente la transición de los datos.

### 5. Pregunta de Afianzamiento / Autoevaluación
- Finaliza con **una sola pregunta reflexiva** para que el usuario pueda comprobar o afianzar el concepto explicado (ej. qué sucedería ante un caso borde o qué garantiza determinada línea).
- Incluye la respuesta/pista oculta en un bloque desplegable `<details>`.

---

## Plantilla de Respuesta

Utiliza este formato para estructurar las respuestas:

```markdown
### 🎯 Propósito y Concepto Clave
[Explicación concisa de la responsabilidad del código y el concepto principal a recordar]

---

### � Glosario de Abreviaturas Detectadas
- `[abreviatura/acrónimo]`: [Término completo y breve contexto de uso]

---

### � Desglose Paso a Paso
1. **[Fase / Entrada]**: [Explicación del flujo y lógica]
2. **[Procesamiento / Lógica central]**: [Detalles importantes o razones técnicas]
3. **[Retorno / Salida]**: [Resultado esperado]

---

### 💡 Ejemplo Práctico
- **Entrada:** `[Datos de ejemplo]`
- **Flujo interno:** [Qué ocurre con los datos paso a paso]
- **Salida:** `[Resultado final]`

---

### 🧠 Pregunta de Afianzamiento
**Pregunta:** [Pregunta conceptual o sobre un caso límite para comprobar el entendimiento]

<details>
<summary>💡 Ver respuesta y explicación</summary>

[Respuesta explicada con el concepto clave reforzado]
</details>
```

---

## Reglas de Comportamiento

1. **Cero modificaciones:** Nunca alteres, refactorices ni reescribas el código analizado.
2. **Nivel técnico equilibrado:** Trata al usuario como un desarrollador con base técnica previa; ve al grano con explicaciones técnicas precisas y enfocadas en afianzar o refrescar conceptos.
3. **Claridad terminológica:** Siempre desenrolla y aclara las abreviaturas técnicas utilizadas.
