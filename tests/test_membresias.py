import pytest
from datetime import date
from backend.logica_negocio import (
    calcular_fecha_fin_membresia,
    determinar_estado_membresia,
    validar_precio_membresia
)

class TestMembresias:
    """Pruebas unitarias para el módulo de Gestión de Membresías."""

    def test_calcular_fecha_fin_membresia_mensual(self):
        """Verifica que el cálculo de vencimiento a 30 días sea exacto."""
        inicio = date(2026, 9, 1)
        fin = calcular_fecha_fin_membresia(inicio, 30)
        assert fin == date(2026, 10, 1)

    def test_calcular_fecha_fin_membresia_anual(self):
        """Verifica que el cálculo de vencimiento a 365 días sea exacto."""
        inicio = date(2026, 1, 1)
        fin = calcular_fecha_fin_membresia(inicio, 365)
        assert fin == date(2027, 1, 1)

    def test_calcular_fecha_fin_duracion_invalida(self):
        """Debe lanzar ValueError si los días son 0 o negativos."""
        with pytest.raises(ValueError):
            calcular_fecha_fin_membresia("2026-09-01", 0)

        with pytest.raises(ValueError):
            calcular_fecha_fin_membresia("2026-09-01", -15)

    def test_determinar_estado_activa(self):
        """Membresía vigente dentro del rango de fechas."""
        estado = determinar_estado_membresia(
            fecha_inicio="2026-09-01",
            fecha_fin="2026-09-30",
            fecha_actual="2026-09-15"
        )
        assert estado == "Activa"

    def test_determinar_estado_por_vencer(self):
        """Membresía que vence en 3 días o menos."""
        estado = determinar_estado_membresia(
            fecha_inicio="2026-09-01",
            fecha_fin="2026-09-30",
            fecha_actual="2026-09-28"
        )
        assert estado == "Por Vencer"

    def test_determinar_estado_vencida(self):
        """Membresía cuya fecha de fin ya pasó."""
        estado = determinar_estado_membresia(
            fecha_inicio="2026-08-01",
            fecha_fin="2026-08-31",
            fecha_actual="2026-09-01"
        )
        assert estado == "Vencida"

    def test_determinar_estado_futura(self):
        """Membresía que aún no ha iniciado."""
        estado = determinar_estado_membresia(
            fecha_inicio="2026-10-01",
            fecha_fin="2026-10-31",
            fecha_actual="2026-09-21"
        )
        assert estado == "Futura"

    def test_validar_precio_membresia_correcto(self):
        """Validar montos de precio positivos."""
        valido, precio = validar_precio_membresia("35.50")
        assert valido is True
        assert precio == 35.50

    def test_validar_precio_membresia_negativo_o_invalido(self):
        """Debe rechazar precios negativos o textos no numéricos."""
        valido_neg, _ = validar_precio_membresia("-10")
        assert valido_neg is False

        valido_txt, _ = validar_precio_membresia("gratis")
        assert valido_txt is False
