from ConexionBD import ConectarBD

def ReporteMembresiasActivas():
    """
    Retorna el reporte de membresías activas (clientes por tipo de membresía).
    En éxito: (True, lista_de_registros)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpReporteMembresiasActivas")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Reporte = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Reporte

    except Exception as Error:
        return False, f"Error al generar reporte de membresías activas: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()