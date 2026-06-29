from ConexionBD import ConectarBD

def LoginUsuario(NombreUsuario, Contrasena):
    """
    Autentica un usuario y retorna sus datos.
    En éxito: (True, datos_usuario)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()   # ✅ Corregido: paréntesis
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        Cursor.execute("EXEC SpLoginUsuario ?, ?", (NombreUsuario, Contrasena))

        # Obtener resultados
        Filas = Cursor.fetchall()
        if not Filas:
            return False, "Credenciales incorrectas o usuario inactivo."

        # Convertir la primera fila a diccionario
        Columnas = [desc[0] for desc in Cursor.description]
        Usuario = dict(zip(Columnas, Filas[0]))

        # Opcional: imprimir en consola (solo para debugging)
        print("Login exitoso - Usuario:", Usuario.get("NombreUsuario"))

        return True, Usuario

    except Exception as Error:
        return False, f"Error en login: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()