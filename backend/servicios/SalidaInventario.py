from ConexionBD import ConectarBD

def SalidaProducto(IdProducto, Cantidad):
    """
    Registra una salida de inventario (por venta, merma, etc.) y actualiza el stock.
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
        Cursor.execute(
            "EXEC SpSalidaInventario ?, ?",
            (IdProducto, Cantidad)
        )
        Conexion.commit()
        return True, "Salida de inventario registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar salida de inventario: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()