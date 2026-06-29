from ConexionBD import ConectarBD

def ListarAsistenciasEmpleados():
    """
    Retorna el historial de asistencias de empleados.
    En éxito: (True, lista_de_asistencias)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        try:
            Cursor.execute("EXEC SpListarAsistenciasEmpleados")
            filas = Cursor.fetchall()
            columnas = [desc[0] for desc in Cursor.description]
            asistencias = [dict(zip(columnas, fila)) for fila in filas]
            return True, asistencias
        except Exception:
            # Fallback SQL directo si el SP no existe
            Cursor.execute("""
                SELECT ae.IdAsistenciaEmpleado, ae.IdEmpleado, 
                       e.PrimerNombre + ' ' + e.PrimerApellido as NombreEmpleado, 
                       ae.Fecha, ae.HoraEntrada, ae.HoraSalida
                FROM AsistenciaEmpleado ae
                JOIN Empleados e ON ae.IdEmpleado = e.IdEmpleado
            """)
            filas = Cursor.fetchall()
            columnas = [desc[0] for desc in Cursor.description]
            asistencias = [dict(zip(columnas, fila)) for fila in filas]
            return True, asistencias
    except Exception as e:
        return False, f"Error al listar asistencias de empleados: {str(e)}"
    finally:
        if Conexion:
            Conexion.close()
