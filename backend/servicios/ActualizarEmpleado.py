from ConexionBD import ConectarBD, TraducirErrorBD

def ActualizarEmpleado(IdEmpleado, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                       Telefono, Correo, FechaContratacion, IdCargo, Salario):
    """
    Actualiza los datos de un empleado.
    Retorna: (success, mensaje)
    """
    if not IdEmpleado or IdEmpleado <= 0:
        return False, "ID de empleado inválido."
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
        try:
            # Intentar ejecutar el procedimiento almacenado
            Cursor.execute(
                "EXEC SpActualizarEmpleado ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
                (IdEmpleado, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                 Telefono, Correo, FechaContratacion, IdCargo, Salario)
            )
            Conexion.commit()
            return True, "Empleado actualizado correctamente."
        except Exception:
            # Fallback a SQL directo si el SP no existe
            Cursor.execute("""
                UPDATE Empleados 
                SET PrimerNombre = ?, SegundoNombre = ?, PrimerApellido = ?, SegundoApellido = ?, 
                    Telefono = ?, Correo = ?, FechaContratacion = ?, IdCargo = ?, Salario = ?
                WHERE IdEmpleado = ?
            """, (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                  Telefono, Correo, FechaContratacion, IdCargo, Salario, IdEmpleado))
            Conexion.commit()
            return True, "Empleado actualizado correctamente (directo)."

    except Exception as Error:
        return False, TraducirErrorBD(Error, "Error al actualizar empleado")
    finally:
        if Conexion:
            Conexion.close()
