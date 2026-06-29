from ConexionBD import ConectarBD

def ListarMantenimientos():
    """
    Retorna la lista de mantenimientos de maquinaria.
    En éxito: (True, lista_de_mantenimientos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        try:
            Cursor.execute("EXEC SpListarMantenimientos")
            filas = Cursor.fetchall()
            columnas = [desc[0] for desc in Cursor.description]
            mantenimientos = [dict(zip(columnas, fila)) for fila in filas]
            return True, mantenimientos
        except Exception:
            Cursor.execute("""
                SELECT m.IdMantenimiento, m.IdMaquina, maq.NombreMaquinaria as NombreMaquina, 
                       m.Descripcion, m.FechaMantenimiento
                FROM Mantenimiento m
                JOIN Maquinaria maq ON m.IdMaquina = maq.IdMaquina
            """)
            filas = Cursor.fetchall()
            columnas = [desc[0] for desc in Cursor.description]
            mantenimientos = [dict(zip(columnas, fila)) for fila in filas]
            return True, mantenimientos
    except Exception as e:
        return False, f"Error al listar mantenimientos: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()
