try:
    from backend.servicios.Login import LoginUsuario
    from backend.servicios.ObtenerMembresiaActivaCliente import ObtenerMembresiaActivaCliente
    from backend.servicios.ObtenerRutinaActivaCliente import ObtenerRutinaActivaCliente
except ImportError:
    from servicios.Login import LoginUsuario
    from servicios.ObtenerMembresiaActivaCliente import ObtenerMembresiaActivaCliente
    from servicios.ObtenerRutinaActivaCliente import ObtenerRutinaActivaCliente

def LoginCompleto(NombreUsuario, Contrasena):
    success, usuario = LoginUsuario(NombreUsuario, Contrasena)
    if not success:
        return False, usuario

    # usuario es un dict con IdUsuario, NombreUsuario, NombreRol, Nivel, IdCliente, IdEmpleado
    if usuario.get('IdCliente'):
        cliente_id = usuario['IdCliente']
        # Obtener membresía activa
        success2, membresia = ObtenerMembresiaActivaCliente(cliente_id)
        if success2:
            usuario['MembresiaActiva'] = membresia
        else:
            usuario['MembresiaActiva'] = None
        # Obtener rutina activa
        success3, rutina = ObtenerRutinaActivaCliente(cliente_id)
        if success3 and rutina:
            usuario['RutinaActiva'] = rutina
        else:
            usuario['RutinaActiva'] = None
    elif usuario.get('IdEmpleado'):
        # Podríamos agregar información del empleado (cargo, etc.) si se necesita
        pass

    return True, usuario