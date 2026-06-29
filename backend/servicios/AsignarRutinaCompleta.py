from servicios.AsignarRutinaCliente import AsignarRutinaCliente
from servicios.DefinirDiaRutina import DefinirDiaRutina
from servicios.AgregarEjercicioRutinaDia import AgregarEjercicioRutinaDia

def AsignarRutinaCompleta(IdCliente, FechaInicio, DuracionDias, FrecuenciaSemanal,
                          NombreRutina, dias):
    """
    dias: lista de dict, cada uno con:
        IdDiaSemana, IdEnfoqueMuscular1, IdEnfoqueMuscular2 (opcional), NotaGeneral (opcional),
        ejercicios: lista de dict con Orden, IdEjercicio, Series, Repeticiones,
                    PesoRecomendado (opcional), DescansoSegundos (opcional), Nota (opcional)
    Retorna: (success, IdRutinaCliente) o (False, mensaje_error)
    """
    # 1. Asignar rutina cabecera
    success, resultado = AsignarRutinaCliente(
        IdCliente, FechaInicio, DuracionDias, FrecuenciaSemanal, NombreRutina
    )
    if not success:
        return False, resultado
    # resultado es un dict con IdRutinaCliente y FechaFinEstimada
    id_rutina = resultado.get('IdRutinaCliente')
    if not id_rutina:
        return False, "No se pudo obtener el ID de la rutina"

    # 2. Por cada día, definir enfoques y luego agregar ejercicios
    for dia in dias:
        id_dia = dia.get('IdDiaSemana')
        enfoque1 = dia.get('IdEnfoqueMuscular1')
        enfoque2 = dia.get('IdEnfoqueMuscular2')
        nota_general = dia.get('NotaGeneral')
        # Definir día
        success, msg = DefinirDiaRutina(id_rutina, id_dia, enfoque1, enfoque2, nota_general)
        if not success:
            return False, f"Error en día {id_dia}: {msg}"
        # Agregar ejercicios de ese día
        for ej in dia.get('ejercicios', []):
            success, msg = AgregarEjercicioRutinaDia(
                id_rutina, id_dia,
                ej.get('Orden'), ej.get('IdEjercicio'), ej.get('Series'), ej.get('Repeticiones'),
                ej.get('PesoRecomendado'), ej.get('DescansoSegundos'), ej.get('Nota')
            )
            if not success:
                return False, f"Error al agregar ejercicio: {msg}"

    return True, id_rutina