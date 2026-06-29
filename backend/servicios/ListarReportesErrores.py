from ConexionBD import ConectarBD

def ListarReportesErrores():
    """
    Obtiene todos los reportes de error registrados en el sistema,
    unidos con el nombre de usuario del reportero.
    Retorna: (success, lista_errores)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, []

        Cursor = Conexion.cursor()
        query = """
        SELECT re.IdReporteError, re.IdUsuario, u.NombreUsuario, re.Modulo, 
               re.Descripcion, re.Ruta, re.Nivel, re.Estado, re.FechaRegistro
        FROM ReporteError re
        LEFT JOIN Usuario u ON re.IdUsuario = u.IdUsuario
        ORDER BY re.FechaRegistro DESC
        """
        Cursor.execute(query)
        Columnas = [col[0] for col in Cursor.description]
        Resultados = []
        for Fila in Cursor.fetchall():
            res_dict = dict(zip(Columnas, Fila))
            if res_dict.get('FechaRegistro'):
                res_dict['FechaRegistro'] = res_dict['FechaRegistro'].strftime('%Y-%m-%d %H:%M:%S')
            Resultados.append(res_dict)

        return True, Resultados

    except Exception as Error:
        print(f"Error al listar reportes de error: {str(Error)}")
        return False, []
    finally:
        if Conexion:
            Conexion.close()
