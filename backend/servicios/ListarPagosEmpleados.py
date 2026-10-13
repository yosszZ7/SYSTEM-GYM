from ConexionBD import ConectarBD

def ListarPagosEmpleados(IdEmpleado=None):
    """
    Retorna la lista de pagos de salario/nómina de empleados.
    Si se especifica IdEmpleado, filtra únicamente los pagos de ese empleado.
    En éxito: (True, lista_de_pagos)
    En error: (False, mensaje_error)
    """
    Conexion = None
    try:
        Conexion = ConectarBD()
        if Conexion is None:
            return False, "No se pudo conectar con la base de datos."

        Cursor = Conexion.cursor()
        if IdEmpleado is not None:
            Cursor.execute("EXEC SpListarPagosEmpleados @IdEmpleado = ?", (int(IdEmpleado),))
        else:
            Cursor.execute("EXEC SpListarPagosEmpleados")

        Columnas = [desc[0] for desc in Cursor.description]
        Filas = Cursor.fetchall()
        Pagos = [dict(zip(Columnas, fila)) for fila in Filas]

        return True, Pagos

    except Exception as Error:
        return False, f"Error al listar pagos de empleados: {str(Error)}"
    finally:
        if Conexion:
            Conexion.close()
