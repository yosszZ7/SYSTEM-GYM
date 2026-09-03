try:
    from backend.servicios.RegistrarAsistenciaCliente import RegistrarAsistenciaCliente
    from backend.servicios.ObtenerRutinaHoy import ObtenerRutinaHoy
except ImportError:
    from servicios.RegistrarAsistenciaCliente import RegistrarAsistenciaCliente
    from servicios.ObtenerRutinaHoy import ObtenerRutinaHoy

def RegistrarAsistenciaConRutina(IdCliente):
    """
    Registra la asistencia del cliente y retorna la rutina del día de hoy.
    Retorna: (success, dict_con_rutina) o (False, mensaje_error)
    """
    # Registrar asistencia
    success, msg = RegistrarAsistenciaCliente(IdCliente)
    if not success:
        return False, msg

    # Obtener rutina de hoy
    success, rutina = ObtenerRutinaHoy(IdCliente)
    if not success:
        # Si falla obtener rutina, igual la asistencia quedó registrada, pero retornamos error parcial
        return False, f"Asistencia registrada, pero error al obtener rutina: {rutina}"
    return True, rutina