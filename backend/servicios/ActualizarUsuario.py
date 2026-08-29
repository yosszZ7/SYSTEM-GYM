from ConexionBD import ConectarBD, TraducirErrorBD

def ActualizarUsuario(IdUsuario, NombreUsuario, IdRol, Estado, IdCliente=None, IdEmpleado=None):
    """
    Actualiza los datos de un usuario en el sistema.
    Retorna: (success, mensaje)
    """
    if not IdUsuario or IdUsuario <= 0:
        return False, "ID de usuario inválido."
    if not NombreUsuario or not NombreUsuario.strip():
        return False, "El nombre de usuario es obligatorio."
    if not IdRol or IdRol <= 0:
        return False, "Debe seleccionar un rol válido."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        try:
            Cursor.execute(
                "EXEC SpActualizarUsuario ?, ?, ?, ?, ?, ?",
                (IdUsuario, NombreUsuario, IdRol, Estado, IdCliente, IdEmpleado)
            )
            Conexion.commit()
            return True, "Usuario actualizado correctamente."
        except Exception:
            # Fallback SQL directo
            Cursor.execute("""
                UPDATE Usuario 
                SET NombreUsuario = ?, IdRol = ?, Estado = ?, IdCliente = ?, IdEmpleado = ?
                WHERE IdUsuario = ?
            """, (NombreUsuario, IdRol, Estado, IdCliente, IdEmpleado, IdUsuario))
            Conexion.commit()
            return True, "Usuario actualizado correctamente (directo)."

    except Exception as Error:
        return False, TraducirErrorBD(Error, "Error al actualizar usuario")
    finally:
        if Conexion:
            Conexion.close()
