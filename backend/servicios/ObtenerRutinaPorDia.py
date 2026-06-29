from ConexionBD import ConectarBD

def ObtenerRutinaPorDia(IdCliente, IdDiaSemana):
    """
    Obtiene la rutina completa (enfoques + ejercicios) para un día específico de la semana.
    En éxito: (True, dict_con_datos) donde el dict tiene 'cabecera' y 'ejercicios'.
    En error: (False, mensaje_error)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not IdDiaSemana or IdDiaSemana < 1 or IdDiaSemana > 7:
        return False, "Día de semana inválido (1=Lunes ... 7=Domingo)."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        # El SP retorna dos conjuntos de resultados: cabecera y luego ejercicios
        Cursor.execute("EXEC SpObtenerRutinaPorDia ?, ?", (IdCliente, IdDiaSemana))

        # Leer primer resultado (cabecera)
        Columnas1 = [desc[0] for desc in Cursor.description]
        FilaCabecera = Cursor.fetchone()
        cabecera = dict(zip(Columnas1, FilaCabecera)) if FilaCabecera else None

        # Pasar al siguiente resultado (ejercicios)
        if Cursor.nextset():
            Columnas2 = [desc[0] for desc in Cursor.description]
            FilasEjercicios = Cursor.fetchall()
            ejercicios = [dict(zip(Columnas2, fila)) for fila in FilasEjercicios] if FilasEjercicios else []
        else:
            ejercicios = []

        return True, {"cabecera": cabecera, "ejercicios": ejercicios}

    except Exception as Error:
        return False, f"Error al obtener rutina por día: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()