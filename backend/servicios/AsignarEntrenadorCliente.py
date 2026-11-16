from ConexionBD import ConectarBD

# ==============================================================================
# [HU-025] Historia de Usuario: Asignar entrenador al cliente
# Módulo: Entrenamiento (3 SP) — Sprint 8 (Semana 8: Octubre 5-9)
# Responsable: Juan Carlos Reyes Riveras (Developer)
# Descripción: Vincula un entrenador activo a un socio del gimnasio y actualiza
#              el indicador RequiereEntrenador mediante SpAsignarEntrenadorCliente.
# ==============================================================================
def AsignarEntrenadorCliente(IdCliente, IdEntrenador):
    """
    Asigna un entrenador a un cliente (actualiza los campos RequiereEntrenador y IdEntrenador).
    Retorna: (success, mensaje)
    """
    if not IdCliente or IdCliente <= 0:
        return False, "ID de cliente inválido."
    if not IdEntrenador or IdEntrenador <= 0:
        return False, "ID de entrenador inválido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpAsignarEntrenadorCliente ?, ?", (IdCliente, IdEntrenador))
        Conexion.commit()
        return True, "Entrenador asignado correctamente."

    except Exception as Error:
        return False, f"Error al asignar entrenador: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()