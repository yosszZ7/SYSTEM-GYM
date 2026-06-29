from ConexionBD import ConectarBD

def DefinirDiaRutina(IdRutinaCliente, IdDiaSemana, IdEnfoqueMuscular1, IdEnfoqueMuscular2=None, NotaGeneral=None):
    """
    Define los enfoques musculares para un día específico de la rutina.
    Retorna: (success, mensaje)
    """
    if not IdRutinaCliente or IdRutinaCliente <= 0:
        return False, "ID de rutina inválido."
    if not IdDiaSemana or IdDiaSemana < 1 or IdDiaSemana > 7:
        return False, "Día de semana inválido (1=Lunes ... 7=Domingo)."
    if not IdEnfoqueMuscular1 or IdEnfoqueMuscular1 <= 0:
        return False, "Debe especificar el primer enfoque muscular."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpDefinirDiaRutina ?, ?, ?, ?, ?",
            (IdRutinaCliente, IdDiaSemana, IdEnfoqueMuscular1, IdEnfoqueMuscular2, NotaGeneral)
        )
        Conexion.commit()
        return True, "Día de rutina definido correctamente."

    except Exception as Error:
        return False, f"Error al definir día de rutina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()