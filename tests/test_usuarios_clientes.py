import pytest
from backend.logica_negocio import (
    validar_email,
    validar_cedula_nicaragua,
    validar_datos_cliente,
    validar_rol_usuario
)

class TestUsuariosClientes:
    """Pruebas unitarias para el módulo de Usuarios y Registro de Clientes."""

    def test_validar_email_formatos_validos(self):
        """Correos con formato estándar."""
        assert validar_email("cliente@gym.com") is True
        assert validar_email("entrenador.fitness@worldgym.com.ni") is True

    def test_validar_email_formatos_invalidos(self):
        """Correos mal estructurados."""
        assert validar_email("cliente-sin-arroba.com") is False
        assert validar_email("usuario@dominio") is False
        assert validar_email("") is False
        assert validar_email(None) is False

    def test_validar_cedula_nicaragua_valida(self):
        """Cédula nicaragüense con formato 001-XXXXXX-XXXXL."""
        assert validar_cedula_nicaragua("001-120598-1002W") is True
        assert validar_cedula_nicaragua("281-050400-0005A") is True

    def test_validar_cedula_nicaragua_invalida(self):
        """Cédulas incompletas o sin letra final."""
        assert validar_cedula_nicaragua("123456789") is False
        assert validar_cedula_nicaragua("001-120598-10021") is False  # termina en número, no letra
        assert validar_cedula_nicaragua("") is False

    def test_validar_datos_cliente_exitoso(self):
        """Cliente con datos obligatorios completos."""
        valido, _ = validar_datos_cliente(
            nombre="Carlos",
            apellido="Gómez",
            telefono="8888-9999",
            email="carlos@gmail.com"
        )
        assert valido is True

    def test_validar_datos_cliente_nombre_vacio(self):
        """Falla si el nombre o apellido están en blanco."""
        valido, mensaje = validar_datos_cliente(nombre="", apellido="Gómez")
        assert valido is False
        assert "obligatorio" in mensaje.lower()

    def test_validar_rol_usuario_permitido(self):
        """Roles estándar del sistema WORLD GYM."""
        assert validar_rol_usuario("Administrador")[0] is True
        assert validar_rol_usuario("Recepcionista")[0] is True
        assert validar_rol_usuario("Entrenador")[0] is True
        assert validar_rol_usuario("Cliente")[0] is True

    def test_validar_rol_usuario_invalido(self):
        """Rechaza roles desconocidos o con errores tipográficos."""
        valido, _ = validar_rol_usuario("SuperUsuario")
        assert valido is False
