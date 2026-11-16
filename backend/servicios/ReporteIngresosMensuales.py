from ConexionBD import ConectarBD

# ==============================================================================
# [HU-028] Historia de Usuario: Generar reportes administrativos
# Módulo: Administración y reportes (7 SP) — Sprint 10 (Semana 10: Octubre 19-23)
# Responsable: Juan Carlos Reyes Riveras (Developer)
# Descripción: Genera los reportes ejecutivos y financieros de World Gym
#              (ingresos mensuales, ventas por producto, membresías activas,
#              rutinas activas y asistencias mensuales).
# ==============================================================================
def ReporteIngresosMensuales():
    """
    Retorna el reporte de ingresos mensuales (suma de pagos por mes).
    En éxito: (True, lista_de_registros)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpReporteIngresosMensuales")

        # Obtener nombres de las columnas
        Columnas = [desc[0] for desc in Cursor.description]

        # Convertir filas a lista de diccionarios
        Filas = Cursor.fetchall()
        Reporte = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Reporte

    except Exception as Error:
        return False, f"Error al generar reporte de ingresos mensuales: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()