from ConexionBD import ConectarBD

def AsignarRutinaCliente(IdCliente, FechaInicio, DuracionDias, FrecuenciaSemanal, NombreRutina=None):
    """
    Asigna una nueva rutina a un cliente. La rutina anterior se finaliza automáticamente.
    La fecha fin se calcula como FechaInicio + DuracionDias.
    Retorna: (success, mensaje_o_datos)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not FechaInicio:
        return False, "La fecha de inicio es obligatoria."
    if not DuracionDias or DuracionDias <= 0:
        return False, "La duración debe ser mayor a 0 días."
    if not FrecuenciaSemanal or FrecuenciaSemanal < 1 or FrecuenciaSemanal > 7:
        return False, "La frecuencia semanal debe estar entre 1 y 7 días."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpAsignarRutinaCliente ?, ?, ?, ?, ?",
            (IdCliente, FechaInicio, DuracionDias, FrecuenciaSemanal, NombreRutina)
        )
        # El SP retorna una fila con IdRutinaCliente y FechaFinEstimada
        Columnas = [desc[0] for desc in Cursor.description]
        Fila = Cursor.fetchone()
        if Fila:
            resultado = dict(zip(Columnas, Fila))
            return True, resultado
        else:
            return False, "No se pudo obtener el ID de la rutina creada."

    except Exception as Error:
        return False, f"Error al asignar rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()