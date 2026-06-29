from ConexionBD import ConectarBD

def RegistrarVenta(IdCliente, IdProducto, Cantidad):
    """
    Registra una venta, descuenta stock y registra movimiento de inventario.
    Retorna: (success, mensaje)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
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
        Cursor.execute(
            "EXEC SpRegistrarVenta ?, ?, ?",
            (IdCliente, IdProducto, Cantidad)
        )
        Conexion.commit()
        return True, "Venta registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar venta: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()