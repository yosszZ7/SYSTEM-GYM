from ConexionBD import ConectarBD

def CambiarContrasena(IdUsuario, ContrasenaActual, NuevaContrasena):
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            print("No se pudo conectar con la BD")
            return None

        Cursor = Conexion.cursor()

        # Ejecutamos el procedimiento almacenado
        Cursor.execute(
            "EXEC SpCambiarContrasena ?, ?, ?",
            (IdUsuario, ContrasenaActual, NuevaContrasena)
        )

        Conexion.commit()
        print("Contraseña actualizada correctamente")
        return True

    except Exception as Error:
        print("ERROR EN CAMBIAR CONTRSENA: ", Error)
        return None
    finally:
        if Conexion:
            Conexion.close()
