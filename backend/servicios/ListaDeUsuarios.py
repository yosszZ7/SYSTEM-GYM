from ConexionBD import ConectarBD

def ListarUsuarios():
    """
    Retorna la lista de usuarios del sistema con su rol.
    En éxito: (True, lista_de_usuarios)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarUsuarios")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Usuarios = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Usuarios

    except Exception as Error:
        return False, f"Error al listar usuarios: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()