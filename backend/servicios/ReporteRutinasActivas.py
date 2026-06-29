from ConexionBD import ConectarBD

def ReporteRutinasActivas():
    """
    Retorna reporte de clientes con rutina activa (sin vencer) y cantidad de ejercicios asignados.
    En éxito: (True, lista_reportes)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpReporteRutinasActivas")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Reporte = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Reporte

    except Exception as Error:
        return False, f"Error al generar reporte de rutinas activas: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()