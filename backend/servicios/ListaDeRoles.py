from ConexionBD import ConectarBD

def ListarRoles():
    """
    Retorna la lista de roles del sistema.
    En éxito: (True, lista_de_roles)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarRoles")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Roles = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Roles

    except Exception as Error:
        return False, f"Error al listar roles: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()