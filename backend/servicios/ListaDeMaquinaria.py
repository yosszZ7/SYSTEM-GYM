from ConexionBD import ConectarBD

def ListarMaquinaria():
    """
    Retorna la lista de máquinas/equipos del gimnasio.
    En éxito: (True, lista_de_maquinas)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpListarMaquinaria")

        columnas = [desc[0] for desc in Cursor.description]
        filas = Cursor.fetchall()
        maquinas = [dict(zip(columnas, fila)) for fila in filas]
        return True, maquinas
    except Exception as e:
        return False, f"Error al listar maquinaria: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()