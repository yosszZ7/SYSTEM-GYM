from ConexionBD import ConectarBD

def AgregarEjercicioRutinaDia(IdRutinaCliente, IdDiaSemana, Orden, IdEjercicio, Series, Repeticiones,
                              PesoRecomendado=None, DescansoSegundos=None, Nota=None):
    """
    Agrega un ejercicio a un día específico de la rutina.
    Retorna: (success, mensaje)
    """
    if not IdRutinaCliente or IdRutinaCliente <= 0:
        return False, "ID de rutina inválido."
    if not IdDiaSemana or IdDiaSemana < 1 or IdDiaSemana > 7:
        return False, "Día de semana inválido."
    if not Orden or Orden <= 0:
        return False, "El orden debe ser mayor a 0."
    if not IdEjercicio or IdEjercicio <= 0:
        return False, "ID de ejercicio inválido."
    if not Series or Series <= 0:
        return False, "Las series deben ser mayores a 0."
    if not Repeticiones or not Repeticiones.strip():
        return False, "Las repeticiones son obligatorias."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpAgregarEjercicioRutinaDia ?, ?, ?, ?, ?, ?, ?, ?, ?",
            (IdRutinaCliente, IdDiaSemana, Orden, IdEjercicio, Series, Repeticiones,
             PesoRecomendado, DescansoSegundos, Nota)
        )
        Conexion.commit()
        return True, "Ejercicio agregado a la rutina correctamente."

    except Exception as Error:
        return False, f"Error al agregar ejercicio a la rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()