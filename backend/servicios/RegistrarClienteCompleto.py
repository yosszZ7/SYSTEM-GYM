try:
    from backend.servicios.RegistrarCliente import RegistrarCliente
    from backend.servicios.AsignarMembresia import AsignarMembresia
    from backend.servicios.CrearUsuario import CrearUsuario
except ImportError:
    from servicios.RegistrarCliente import RegistrarCliente
    from servicios.AsignarMembresia import AsignarMembresia
    from servicios.CrearUsuario import CrearUsuario

def RegistrarClienteCompleto(datos_cliente, datos_membresia, datos_usuario):
    """
    datos_cliente: dict con claves: PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                   Telefono, Correo, RequiereEntrenador (opcional, default 0), IdEntrenador (opcional)
    datos_membresia: dict con claves: IdMembresia, IdMetodoPago, Monto
    datos_usuario: dict con claves: NombreUsuario, Contrasena, IdRol
    Retorna: (success, id_cliente) o (False, mensaje_error)
    """
    # Registrar cliente
    success, cliente_resultado = RegistrarCliente(
        datos_cliente.get('PrimerNombre'),
        datos_cliente.get('SegundoNombre'),
        datos_cliente.get('PrimerApellido'),
        datos_cliente.get('SegundoApellido'),
        datos_cliente.get('Telefono'),
        datos_cliente.get('Correo'),
        datos_cliente.get('RequiereEntrenador', 0),
        datos_cliente.get('IdEntrenador')
    )
    if not success:
        return False, f"Error en registro de cliente: {cliente_resultado}"
    id_cliente = cliente_resultado  # ahora es el ID

    # Asignar membresía
    success, msg = AsignarMembresia(
        id_cliente,
        datos_membresia.get('IdMembresia'),
        datos_membresia.get('IdMetodoPago'),
        datos_membresia.get('Monto')
    )
    if not success:
        # Podríamos hacer rollback, pero las funciones atómicas ya tienen transacciones internas.
        # Para simplificar, asumimos que si falla la membresía, el cliente ya quedó registrado.
        # Idealmente debería haber una transacción global. Por ahora devolvemos error.
        return False, f"Error al asignar membresía: {msg}"

    # Crear usuario (cliente)
    success, usuario_resultado = CrearUsuario(
        datos_usuario.get('NombreUsuario'),
        datos_usuario.get('Contrasena'),
        datos_usuario.get('IdRol'),
        id_cliente,
        None
    )
    if not success:
        return False, f"Error al crear usuario: {usuario_resultado}"
    # usuario_resultado sería el IdUsuario, no lo necesitamos retornar

    return True, id_cliente