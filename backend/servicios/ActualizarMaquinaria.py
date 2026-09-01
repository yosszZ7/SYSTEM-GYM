from ConexionBD import ConectarBD

def ActualizarMaquinaria(IdMaquina, Nombre, Tipo, Estado, FechaCompra):
    """
    Actualiza una máquina de la base de datos.
    Retorna: (success, mensaje)
    """
    if not IdMaquina or IdMaquina <= 0:
        return False, "ID de máquina inválido."
    if not Nombre or not Nombre.strip():
        return False, "El nombre de la máquina es obligatorio."
    if not Tipo or not Tipo.strip():
        return False, "El tipo de máquina es obligatorio."
    if not Estado or not Estado.strip():
        return False, "El estado de la máquina es obligatorio."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        try:
            Cursor.execute(
                "EXEC SpActualizarMaquinaria ?, ?, ?, ?, ?",
                (IdMaquina, Nombre, Tipo, Estado, FechaCompra)
            )
            Conexion.commit()
            return True, "Máquina actualizada correctamente."
        except Exception:
            # Fallback SQL directo
            estado_bit = 1 if str(Estado).lower() in ['1', 'true', 'operativo', 'activo'] else 0
            Cursor.execute("""
                UPDATE Maquinaria 
                SET NombreMaquinaria = ?, Tipo = ?, Estado = ?, FechaCompra = ?
                WHERE IdMaquina = ?
            """, (Nombre, Tipo, estado_bit, FechaCompra, IdMaquina))
            Conexion.commit()
            return True, "Máquina actualizada correctamente (directo)."

    except Exception as Error:
        return False, f"Error al actualizar máquina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
