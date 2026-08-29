from ConexionBD import ConectarBD, TraducirErrorBD

def RegistrarProducto(NombreProducto, Marca, Categoria, Precio, Stock=0):
    """
    Registra un nuevo producto y crea su registro de inventario (stock 0 o el especificado).
    Retorna: (success, mensaje)
    """
    if not NombreProducto or not NombreProducto.strip():
        return False, "El nombre del producto es obligatorio."
    if not Marca or not Marca.strip():
        return False, "La marca es obligatoria."
    if not Categoria or not Categoria.strip():
        return False, "La categoría es obligatoria."
    if not Precio or Precio <= 0:
        return False, "El precio debe ser mayor a 0."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarProducto ?, ?, ?, ?",
            (NombreProducto, Marca, Categoria, Precio)
        )
        if Stock > 0:
            Cursor.execute("""
                UPDATE Inventario 
                SET Stock = ? 
                WHERE IdProducto = (SELECT MAX(IdProducto) FROM Producto)
            """, (Stock,))
        Conexion.commit()
        return True, "Producto registrado correctamente."

    except Exception as Error:
        return False, TraducirErrorBD(Error, "Error al registrar producto")
    finally:
        if Conexion:
            Conexion.close()
