import pytest
from backend.logica_negocio import (
    validar_monto_pago,
    calcular_cambio,
    aplicar_descuento
)

class TestPagos:
    """Pruebas unitarias para el módulo de Facturación y Pagos."""

    def test_validar_monto_pago_valido(self):
        """Monto numérico positivo redondeado a dos decimales."""
        valido, monto = validar_monto_pago(1200.50)
        assert valido is True
        assert monto == 1200.50

    def test_validar_monto_pago_cero_o_negativo(self):
        """Montos de 0 o negativos deben ser rechazados."""
        valido_cero, _ = validar_monto_pago(0)
        assert valido_cero is False

        valido_neg, _ = validar_monto_pago(-50.0)
        assert valido_neg is False

    def test_calcular_cambio_exacto(self):
        """Cuando el cliente paga con el monto exacto, el cambio es 0.0."""
        success, cambio, _ = calcular_cambio(monto_recibido=500.0, total_a_pagar=500.0)
        assert success is True
        assert cambio == 0.0

    def test_calcular_cambio_con_vuelto(self):
        """Calcula el cambio correctamente cuando el cliente paga con billete mayor."""
        success, cambio, _ = calcular_cambio(monto_recibido=1000.0, total_a_pagar=650.0)
        assert success is True
        assert cambio == 350.0

    def test_calcular_cambio_insuficiente(self):
        """Falla si el monto recibido no cubre el total de la cuenta."""
        success, cambio, mensaje = calcular_cambio(monto_recibido=300.0, total_a_pagar=500.0)
        assert success is False
        assert cambio == 0.0
        assert "insuficiente" in mensaje.lower()

    def test_aplicar_descuento_valido(self):
        """Aplica descuento del 20% sobre C$1000 (debe dar C$800)."""
        success, total_final, _ = aplicar_descuento(monto_base=1000.0, porcentaje_descuento=20)
        assert success is True
        assert total_final == 800.0

    def test_aplicar_descuento_fuera_de_rango(self):
        """Rechaza porcentajes negativos o mayores a 100%."""
        success_neg, _, _ = aplicar_descuento(500.0, -5)
        assert success_neg is False

        success_alto, _, _ = aplicar_descuento(500.0, 120)
        assert success_alto is False
