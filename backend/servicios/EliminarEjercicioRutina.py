from ConexionBD import ConectarBD

def EliminarEjercicioRutina(IdRutinaCliente, IdDiaSemana, IdEjercicio):
    """
    Elimina un ejercicio de un día específico de la rutina.
    Retorna: (success, mensaje)
    """
    if not IdRutinaCliente or IdRutinaCliente <= 0:
        return False, "ID de rutina inválido."
    if not IdDiaSemana or IdDiaSemana < 1 or IdDiaSemana > 7:
        return False, "Día de semana inválido."
    if not IdEjercicio or IdEjercicio <= 0:
        return False, "ID de ejercicio inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpEliminarEjercicioRutina ?, ?, ?",
            (IdRutinaCliente, IdDiaSemana, IdEjercicio)
        )
        Conexion.commit()
        return True, "Ejercicio eliminado de la rutina correctamente."

    except Exception as Error:
        return False, f"Error al eliminar ejercicio de la rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()