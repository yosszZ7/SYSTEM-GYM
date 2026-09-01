from ConexionBD import ConectarBD

def RegistrarMaquinaria(Nombre, Tipo, Estado, FechaCompra):
    """
    Registra una nueva máquina en la base de datos.
    Retorna: (success, mensaje_o_id)
    """
    if not Nombre or not Nombre.strip():
        return False, "El nombre de la máquina es obligatorio."
    if not Tipo or not Tipo.strip():
        return False, "El tipo de la máquina es obligatorio."
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
                "EXEC SpRegistrarMaquinaria ?, ?, ?, ?",
                (Nombre, Tipo, Estado, FechaCompra)
            )
            fila = Cursor.fetchone()
            id_maquina = fila[0] if fila else None
            Conexion.commit()
            if id_maquina:
                return True, id_maquina
            return True, "Máquina registrada correctamente."
        except Exception:
            # Fallback SQL directo
            # Convertir Estado a bit (1 o 0)
            estado_bit = 1 if str(Estado).lower() in ['1', 'true', 'operativo', 'activo'] else 0
            Cursor.execute("""
                INSERT INTO Maquinaria (NombreMaquinaria, Tipo, Estado, FechaCompra)
                VALUES (?, ?, ?, ?)
            """, (Nombre, Tipo, estado_bit, FechaCompra))
            Conexion.commit()
            return True, "Máquina registrada correctamente (directo)."

    except Exception as Error:
        return False, f"Error al registrar máquina: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
