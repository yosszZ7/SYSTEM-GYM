from ConexionBD import ConectarBD

def RegistrarEmpleado(PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                      Telefono, Correo, FechaContratacion, IdCargo, Salario):
    """
    Registra un nuevo empleado.
    Retorna: (success, id_empleado) si éxito, (False, mensaje_error) si fallo.
    """
    if not PrimerNombre or not PrimerNombre.strip():
        return False, "El primer nombre es obligatorio."
    if not PrimerApellido or not PrimerApellido.strip():
        return False, "El primer apellido es obligatorio."
    if not Telefono or not Telefono.strip():
        return False, "El teléfono es obligatorio."
    if not Correo or not Correo.strip():
        return False, "El correo es obligatorio."
    if not IdCargo or IdCargo <= 0:
        return False, "El cargo es obligatorio."
    if Salario < 0:
        return False, "El salario no puede ser negativo."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpRegistrarEmpleado ?, ?, ?, ?, ?, ?, ?, ?, ?",
            (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
             Telefono, Correo, FechaContratacion, IdCargo, Salario)
        )
        fila = Cursor.fetchone()
        id_empleado = fila[0] if fila else None
        Conexion.commit()

        if id_empleado:
            return True, id_empleado
        else:
            return False, "No se pudo obtener el ID del empleado registrado."

    except Exception as Error:
        return False, f"Error al registrar empleado: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()