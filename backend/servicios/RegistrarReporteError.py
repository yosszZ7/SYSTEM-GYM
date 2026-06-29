from ConexionBD import ConectarBD

def RegistrarReporteError(IdUsuario, Modulo, Descripcion, Ruta, Nivel):
    """
    Registra un reporte de error en el sistema.
    Retorna: (success, mensaje, IdReporteError)
    """
    if not Modulo or not Descripcion or not Nivel:
        return False, "Los campos Módulo, Descripción y Nivel son obligatorios.", None

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos.", None

        Cursor = Conexion.cursor()
        query = """
        INSERT INTO ReporteError (IdUsuario, Modulo, Descripcion, Ruta, Nivel, Estado, FechaRegistro)
        OUTPUT INSERTED.IdReporteError
        VALUES (?, ?, ?, ?, ?, 'Pendiente', GETDATE())
        """
        Cursor.execute(query, (IdUsuario, Modulo, Descripcion, Ruta, Nivel))
        id_reporte = Cursor.fetchone()[0]
        Conexion.commit()

        return True, "Reporte de error registrado correctamente.", id_reporte

    except Exception as Error:
        return False, f"Error al registrar reporte de error: {str(Error)}", None
    finally:
        if Conexion:
            Conexion.close()
