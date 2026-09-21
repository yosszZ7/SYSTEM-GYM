import pytest
from backend.logica_negocio import (
    calcular_nuevo_stock_entrada,
    calcular_nuevo_stock_salida,
    verificar_alerta_stock_minimo
)

class TestInventario:
    """Pruebas unitarias para el módulo de Gestión de Inventario."""

    def test_calcular_nuevo_stock_entrada_exitoso(self):
        """Suma de existencias por compra de productos."""
        success, nuevo_stock, _ = calcular_nuevo_stock_entrada(stock_actual=10, cantidad_entrada=15)
        assert success is True
        assert nuevo_stock == 25

    def test_calcular_nuevo_stock_entrada_cantidad_invalida(self):
        """Rechaza entradas de 0 o cantidades negativas."""
        success_cero, _, _ = calcular_nuevo_stock_entrada(10, 0)
        assert success_cero is False

        success_neg, _, _ = calcular_nuevo_stock_entrada(10, -5)
        assert success_neg is False

    def test_calcular_nuevo_stock_salida_exitoso(self):
        """Resta de existencias por venta o consumo."""
        success, nuevo_stock, _ = calcular_nuevo_stock_salida(stock_actual=20, cantidad_salida=5)
        assert success is True
        assert nuevo_stock == 15

    def test_calcular_nuevo_stock_salida_insuficiente_evita_negativo(self):
        """Regla de no sobreventa: impide que el inventario quede en números negativos."""
        success, stock_remanente, mensaje = calcular_nuevo_stock_salida(stock_actual=3, cantidad_salida=10)
        assert success is False
        assert stock_remanente == 3
        assert "insuficiente" in mensaje.lower()

    def test_verificar_alerta_stock_minimo(self):
        """Dispara alerta cuando el stock llega a 5 unidades o menos."""
        assert verificar_alerta_stock_minimo(stock_actual=5, stock_minimo=5) is True
        assert verificar_alerta_stock_minimo(stock_actual=2, stock_minimo=5) is True
        assert verificar_alerta_stock_minimo(stock_actual=12, stock_minimo=5) is False
