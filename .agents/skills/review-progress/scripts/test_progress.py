"""
Script de prueba para la habilidad 'review-progress'.
Valida una implementación de cálculo de progreso según las reglas de reference/requirements.md.

Uso:
    python .agents/skills/review-progress/scripts/test_progress.py [ruta_al_archivo_python]
    (Por defecto busca 'progress.py' en la raíz del proyecto)
"""

import sys
import copy
from pathlib import Path
import importlib.util


def load_progress_function(target_path: Path):
    if not target_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo '{target_path}'.")

    spec = importlib.util.spec_from_file_location("progress_module", target_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"No se pudo cargar el módulo desde '{target_path}'.")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Nombres comunes esperados para la función de progreso
    candidates = [
        "calcular_progreso",
        "obtener_progreso",
        "review_progress",
        "get_progress",
    ]
    for name in candidates:
        if hasattr(module, name) and callable(getattr(module, name)):
            return getattr(module, name), name

    # Si hay una sola función definida en el módulo, usarla
    funcs = [
        getattr(module, a)
        for a in dir(module)
        if callable(getattr(module, a)) and not a.startswith("__")
    ]
    if len(funcs) == 1:
        return funcs[0], funcs[0].__name__

    raise AttributeError(
        f"No se encontró una función de cálculo de progreso en '{target_path}'. "
        f"Se esperaba una función como: {', '.join(candidates)}"
    )


def run_tests(func, func_name: str) -> bool:
    print(f"=== Comprobando implementación: '{func_name}' ===")
    results = []

    # Regla 1: Si no hay retos, el progreso es 0
    try:
        res = func([])
        passed = res == 0
        results.append(
            ("Regla 1: Lista vacía devuelve 0", passed, f"Esperado 0, obtenido {res}")
        )
    except Exception as e:
        results.append(("Regla 1: Lista vacía devuelve 0", False, f"Excepción: {e}"))

    # Regla 2 y 3: Cálculo de porcentaje (completados / total * 100)
    try:
        retos_completos = [
            {"título": "Reto 1", "completado": True},
            {"título": "Reto 2", "completado": True},
        ]
        res = func(retos_completos)
        passed = res == 100
        results.append(
            (
                "Regla 2: Todos completados devuelve 100",
                passed,
                f"Esperado 100, obtenido {res}",
            )
        )
    except Exception as e:
        results.append(
            ("Regla 2: Todos completados devuelve 100", False, f"Excepción: {e}")
        )

    try:
        retos_cero = [
            {"título": "Reto 1", "completado": False},
            {"título": "Reto 2", "completado": False},
        ]
        res = func(retos_cero)
        passed = res == 0
        results.append(
            (
                "Regla 3: Ninguno completado devuelve 0",
                passed,
                f"Esperado 0, obtenido {res}",
            )
        )
    except Exception as e:
        results.append(
            ("Regla 3: Ninguno completado devuelve 0", False, f"Excepción: {e}")
        )

    # Regla 4: Redondeo bancario de Python (al entero más cercano; empate al entero par)
    # 1 de 8 = 12.5% -> round(12.5) == 12 (par)
    try:
        retos_empate_12 = [
            {"título": f"R{i}", "completado": i == 1} for i in range(1, 9)
        ]
        res = func(retos_empate_12)
        passed = res == 12
        results.append(
            (
                "Regla 4a: Redondeo empate al par (1/8 = 12.5% -> 12)",
                passed,
                f"Esperado 12, obtenido {res}",
            )
        )
    except Exception as e:
        results.append(
            (
                "Regla 4a: Redondeo empate al par (1/8 = 12.5% -> 12)",
                False,
                f"Excepción: {e}",
            )
        )

    # 3 de 8 = 37.5% -> round(37.5) == 38 (par)
    try:
        retos_empate_38 = [
            {"título": f"R{i}", "completado": i <= 3} for i in range(1, 9)
        ]
        res = func(retos_empate_38)
        passed = res == 38
        results.append(
            (
                "Regla 4b: Redondeo empate al par (3/8 = 37.5% -> 38)",
                passed,
                f"Esperado 38, obtenido {res}",
            )
        )
    except Exception as e:
        results.append(
            (
                "Regla 4b: Redondeo empate al par (3/8 = 37.5% -> 38)",
                False,
                f"Excepción: {e}",
            )
        )

    # Regla 5: Inmutabilidad (no debe modificar la lista ni sus diccionarios)
    try:
        original = [
            {"título": "Aprender Skills", "completado": True},
            {"título": "Crear Scripts", "completado": False},
        ]
        clon = copy.deepcopy(original)
        func(original)
        passed = original == clon
        results.append(
            (
                "Regla 5: Inmutabilidad (lista y diccionarios intactos)",
                passed,
                "La entrada fue modificada" if not passed else "Entrada intacta",
            )
        )
    except Exception as e:
        results.append(
            (
                "Regla 5: Inmutabilidad (lista y diccionarios intactos)",
                False,
                f"Excepción: {e}",
            )
        )

    # Resumen de resultados
    passed_count = 0
    print("\n--- Detalle de Casos ---")
    for name, passed, detail in results:
        status = "APROBADO" if passed else "FALLIDO"
        marker = "[OK]" if passed else "[X] "
        if passed:
            passed_count += 1
            print(f"{marker} [{status}] {name}")
        else:
            print(f"{marker} [{status}] {name} -> {detail}")

    total = len(results)
    print(f"\nResultado final: {passed_count}/{total} pruebas aprobadas.\n")
    return passed_count == total


def main():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    target_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("progress.py")
    try:
        func, name = load_progress_function(target_path)
        success = run_tests(func, name)
        sys.exit(0 if success else 1)
    except Exception as err:
        print(f"[ERROR] {err}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
