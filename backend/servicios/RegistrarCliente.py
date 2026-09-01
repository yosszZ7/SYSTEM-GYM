from ConexionBD import ConectarBD

def RegistrarCliente(PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
                     Telefono, Correo, RequiereEntrenador=0, IdEntrenador=None):
    if not PrimerNombre or not PrimerApellido or not Telefono or not Correo:
        return False, "Faltan datos obligatorios..."
    if RequiereEntrenador and not IdEntrenador:
        return False, "Debe especificar un entrenador..."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        # Modificamos el SP para que retorne el IdCliente (usando OUTPUT o SELECT)
        # Asumiendo que el SP fue modificado para retornar el IdCliente como un SELECT
        Cursor.execute(
            "EXEC SpRegistrarCliente ?, ?, ?, ?, ?, ?, ?, ?",
            (PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido,
             Telefono, Correo, RequiereEntrenador, IdEntrenador)
        )
        # Capturar el IdCliente devuelto (si el SP hace SELECT SCOPE_IDENTITY())
        fila = Cursor.fetchone()
        if fila:
            id_cliente = fila[0]  # asumiendo que es la primera columna
        else:
            # Si no devuelve, podríamos hacer un SELECT SCOPE_IDENTITY() adicional
            Cursor.execute("SELECT CAST(SCOPE_IDENTITY() AS INT)")
            id_cliente = Cursor.fetchone()[0]
        Conexion.commit()
        return True, id_cliente
    except Exception as Error:
        return False, f"Error al registrar cliente: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()