from ConexionBD import ConectarBD

def CrearUsuario(NombreUsuario, Contrasena, IdRol, IdCliente=None, IdEmpleado=None):
    """
    Crea un nuevo usuario en el sistema.
    Retorna: (success, id_usuario) si éxito, (False, mensaje_error) si fallo.
    """
    # Validaciones básicas
    if not NombreUsuario or not NombreUsuario.strip():
        return False, "El nombre de usuario es obligatorio."
    if not Contrasena or not Contrasena.strip():
        return False, "La contraseña es obligatoria."
    if not IdRol or IdRol <= 0:
        return False, "El rol es obligatorio."

    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute(
            "EXEC SpCrearUsuario ?, ?, ?, ?, ?",
            (NombreUsuario, Contrasena, IdRol, IdCliente, IdEmpleado)
        )
        
        # Recuperar el IdUsuario retornado por el SP
        fila = Cursor.fetchone()
        if fila:
            # La fila puede ser una tupla o un objeto; asumimos que la columna se llama IdUsuario
            # Podemos acceder por índice o por nombre. Lo más simple: fila[0]
            id_usuario = fila[0]
        else:
            # Si por alguna razón no devuelve nada, hacemos commit igual y luego obtenemos con SCOPE_IDENTITY()
            id_usuario = None

        Conexion.commit()
        
        if id_usuario:
            return True, id_usuario
        else:
            # Intento alternativo: ejecutar SELECT SCOPE_IDENTITY() directamente
            Cursor.execute("SELECT SCOPE_IDENTITY()")
            id_usuario = Cursor.fetchone()[0]
            return True, id_usuario

    except Exception as Error:
        mensaje_error = str(Error)
        return False, f"Error al crear usuario: {mensaje_error}"
    finally:
        if Conexion:
            Conexion.close()