import pytest
from backend.logica_negocio import (
    validar_datos_recuperacion,
    validar_nueva_contrasena
)

class TestRecuperacionContrasena:
    """Pruebas unitarias para el módulo de Recuperación de Contraseña (HU-003)."""

    def test_validar_datos_recuperacion_correo_valido(self):
        """Acepta un correo electrónico como dato de búsqueda."""
        valido, res = validar_datos_recuperacion("usuario@worldgym.com")
        assert valido is True
        assert res == "usuario@worldgym.com"

    def test_validar_datos_recuperacion_nombre_usuario_valido(self):
        """Acepta un nombre de usuario como dato de búsqueda."""
        valido, res = validar_datos_recuperacion("admin_roberto")
        assert valido is True
        assert res == "admin_roberto"

    def test_validar_datos_recuperacion_vacio_o_nulo(self):
        """Rechaza entradas vacías o None."""
        assert validar_datos_recuperacion("")[0] is False
        assert validar_datos_recuperacion("   ")[0] is False
        assert validar_datos_recuperacion(None)[0] is False

    def test_validar_datos_recuperacion_demasiado_corto(self):
        """Rechaza entradas de menos de 3 caracteres."""
        valido, msg = validar_datos_recuperacion("ab")
        assert valido is False
        assert "corto" in msg.lower()

    def test_validar_nueva_contrasena_exitosa(self):
        """Acepta contraseñas válidas que coinciden."""
        valido, msg = validar_nueva_contrasena("GymWorld2026!", "GymWorld2026!")
        assert valido is True
        assert "válida" in msg.lower() or "confirmada" in msg.lower()

    def test_validar_nueva_contrasena_longitud_insuficiente(self):
        """Rechaza contraseñas con menos de 6 caracteres."""
        valido, msg = validar_nueva_contrasena("12345", "12345")
        assert valido is False
        assert "al menos 6 caracteres" in msg.lower()

    def test_validar_nueva_contrasena_discrepancia(self):
        """Rechaza si la confirmación no coincide."""
        valido, msg = validar_nueva_contrasena("ContrasenaSegura123", "OtraContrasenaDistinta")
        assert valido is False
        assert "no coinciden" in msg.lower()
