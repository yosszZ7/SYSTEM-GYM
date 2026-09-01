from ConexionBD import ConectarBD

def ActualizarProducto(IdProducto, NombreProducto, Marca, Categoria, Precio, Stock=None):
    if not IdProducto or IdProducto <= 0:
        return False, "ID de producto inválido."
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar."
        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpActualizarProducto ?, ?, ?, ?, ?",
                       (IdProducto, NombreProducto, Marca, Categoria, Precio))
        if Stock is not None and Stock >= 0:
            Cursor.execute("UPDATE Inventario SET Stock = ? WHERE IdProducto = ?", (Stock, IdProducto))
        Conexion.commit()
        return True, "Producto actualizado correctamente."
    except Exception as e:
        return False, f"Error: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()