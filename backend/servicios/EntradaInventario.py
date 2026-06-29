from ConexionBD import ConectarBD

def EntradaInventario(IdProducto, Cantidad):
    """
    Registra una entrada de inventario (aumenta stock).
    Retorna: (success, mensaje)
    """
    if not IdProducto or IdProducto <= 0:
        return False, "ID de producto inválido."
    if not Cantidad or Cantidad <= 0:
        return False, "La cantidad debe ser mayor a 0."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpEntradaInventario ?, ?", (IdProducto, Cantidad))
        Conexion.commit()
        return True, "Entrada de inventario registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar entrada de inventario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()