from ConexionBD import ConectarBD

def RegistrarCompra(IdProveedor, IdProducto, Cantidad, PrecioCompra, Estado, Observacion=None):
    """
    Registra una compra, actualiza stock y movimiento.
    Retorna: (success, mensaje)
    """
    if not IdProveedor or IdProveedor <= 0:
        return False, "Proveedor inválido."
    if not IdProducto or IdProducto <= 0:
        return False, "Producto inválido."
    if Cantidad <= 0:
        return False, "La cantidad debe ser mayor a 0."
    if PrecioCompra < 0:
        return False, "El precio no puede ser negativo."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarCompra ?, ?, ?, ?, ?, ?",
            (IdProveedor, IdProducto, Cantidad, PrecioCompra, Estado, Observacion)
        )
        Conexion.commit()
        return True, "Compra registrada correctamente."

    except Exception as Error:
        return False, f"Error al registrar compra: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()