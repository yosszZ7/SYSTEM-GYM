import pytest
from backend.servicios.limpiar_error import limpiar_error_sql

class TestLimpiarError:
    """Pruebas unitarias para el sanitizador de errores SQL del sistema."""

    def test_limpiar_error_sql_llave_foranea(self):
        """Traduce violación de Foreign Key a mensaje amigable."""
        raw_error = "('23000', '[23000] [Microsoft][ODBC Driver 17 for SQL Server][SQL Server]The DELETE statement conflicted with the REFERENCE constraint \"FK_Cliente_Membresia\"...')"
        mensaje = limpiar_error_sql(raw_error)
        assert "no se puede eliminar este registro" in mensaje.lower()

    def test_limpiar_error_sql_llave_duplicada(self):
        """Traduce violación de UNIQUE constraint a mensaje de duplicidad."""
        raw_error = "('23000', '[23000] [Microsoft][ODBC Driver 17 for SQL Server][SQL Server]Violation of UNIQUE KEY constraint \"UQ_Cliente_Cedula\". Cannot insert duplicate key in object...')"
        mensaje = limpiar_error_sql(raw_error)
        assert "ya existe un registro con estos mismos datos" in mensaje.lower()

    def test_limpiar_error_sql_extraccion_raiserror(self):
        """Extrae el mensaje personalizado de negocio lanzado desde el SP."""
        raw_error = "('42000', '[42000] [Microsoft][ODBC Driver 17 for SQL Server][SQL Server]La rutina no existe o no está vigente. (50000) (SQLExecDirectW)')"
        mensaje = limpiar_error_sql(raw_error)
        assert mensaje == "La rutina no existe o no está vigente."

    def test_limpiar_error_sql_none_o_vacio(self):
        """Maneja valores None o vacíos sin lanzar excepciones."""
        assert limpiar_error_sql(None) == "Ha ocurrido un error inesperado."
        assert limpiar_error_sql("") == "Ha ocurrido un error inesperado."
