import pytest
from datetime import date
from backend.logica_negocio import (
    validar_frecuencia_rutina,
    validar_ejercicio_rutina,
    calcular_asistencias_mes
)

class TestRutinasAsistencias:
    """Pruebas unitarias para el módulo de Rutinas y Asistencias de Clientes."""

    def test_validar_frecuencia_rutina_valida(self):
        """Frecuencias semanales de 1 a 7 días."""
        assert validar_frecuencia_rutina(1)[0] is True
        assert validar_frecuencia_rutina(3)[0] is True
        assert validar_frecuencia_rutina(5)[0] is True
        assert validar_frecuencia_rutina(7)[0] is True

    def test_validar_frecuencia_rutina_fuera_de_rango(self):
        """Rechaza 0 días o más de 7 días."""
        assert validar_frecuencia_rutina(0)[0] is False
        assert validar_frecuencia_rutina(8)[0] is False
        assert validar_frecuencia_rutina(-2)[0] is False

    def test_validar_ejercicio_rutina_correcto(self):
        """Series mayores a 0 y campo de repeticiones presente."""
        valido, _ = validar_ejercicio_rutina(series=4, repeticiones="12-15")
        assert valido is True

    def test_validar_ejercicio_rutina_series_cero_o_reps_vacias(self):
        """Rechaza series <= 0 o repeticiones vacías."""
        valido_series, _ = validar_ejercicio_rutina(series=0, repeticiones="10")
        assert valido_series is False

        valido_reps, _ = validar_ejercicio_rutina(series=4, repeticiones="")
        assert valido_reps is False

    def test_calcular_asistencias_mes(self):
        """Cuenta con precisión los check-ins de un mes determinado."""
        asistencias = [
            "2026-09-02",
            "2026-09-04",
            "2026-09-07",
            "2026-09-11",
            "2026-08-15",  # Mes anterior (no debe contarse)
            "2026-09-18",
            "2026-09-21"
        ]
        total_septiembre = calcular_asistencias_mes(asistencias, mes=9, anio=2026)
        assert total_septiembre == 6

        total_agosto = calcular_asistencias_mes(asistencias, mes=8, anio=2026)
        assert total_agosto == 1
