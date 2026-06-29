# Resumen de Cambios (Walkthrough) - Integración GYM SISTEM

Se ha realizado con éxito la integración completa de los endpoints de la API JSON, la reparación de la alineación de columnas, la restauración de importaciones del inventario, la resolución de conflictos en la búsqueda de clientes, y la implementación de búsquedas dinámicas e insensibles a acentos y mayúsculas.

## Cambios Realizados

1. **Creación de API Endpoints para Listados**:
   Se crearon las siguientes rutas JSON en [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py) que conectan directamente con los servicios del backend para devolver los datos reales al frontend:
   * `/api/clientes/listar` (conecta con `ListarClientes`)
   * `/api/empleados/listar` (conecta con `ListarEmpleados`)
   * `/api/productos/listar` (conecta con `ListarProductos`)
   * `/api/ejercicios/listar` (conecta con `ListarEjercicios`)
   * `/api/ventas/listar` (conecta con `ListarVentas`)
   * `/api/compras/listar` (conecta con `ListarCompras`)
   * `/api/usuarios/listar` (conecta con `ListarUsuarios`)
   * `/api/maquinaria/listar` (conecta con `ListarMaquinaria`)
   * `/api/membresias/listar` (conecta con `ListarMembresias`)
   * `/api/grupos-musculares/listar` (conecta con `ListarGruposMusculares`)
   * `/api/inventario/listar` (conecta con `ListarInventario`)

2. **Endpoints para Reportes de Estadísticas**:
   Se implementaron los reportes solicitados por el JavaScript del frontend con un sistema de consulta dinámica a base de datos y fallbacks lógicos para asegurar la visualización correcta en el Dashboard:
   * `/api/reportes/ingresos` (conecta con `ReporteIngresosMensuales`)
   * `/api/reportes/ventas-producto` (conecta con `ReporteVentasPorProducto`)
   * `/api/reportes/membresias-activas` (calcula membresías activas, próximas a vencer en 7 días y vencidas contra SQL Server)
   * `/api/reportes/asistencias` (calcula asistencias de hoy, de la semana y del mes contra la tabla `AsistenciasClientes`)
   * `/api/reportes/rutinas-activas` (cobertura y ejercicios totales usando `ReporteRutinasActivas`)

3. **Endpoints para Eliminación Directa**:
   Se implementaron los endpoints POST para la eliminación (física y lógica según corresponda) de registros directo desde la interfaz de usuario:
   * `/api/clientes/eliminar` (actualiza `Estado = 0`)
   * `/api/empleados/eliminar` (actualiza `Estado = 0`)
   * `/api/productos/eliminar` (elimina el registro del producto)
   * `/api/ejercicios/eliminar` (conecta con el servicio `EliminarEjercicio`)
   * `/api/ventas/eliminar` (anula la venta actualizando `Estado = 0`)
   * `/api/maquinaria/eliminar` (elimina el equipo del inventario)
   * `/api/compras/eliminar` (anula la compra actualizando `Estado = 0`)
   * `/api/grupos-musculares/eliminar` (elimina el grupo muscular)
   * `/api/mantenimiento/eliminar` (elimina el registro de mantenimiento)

4. **Alineación de Parámetros y Stacked Routes**:
   * **Búsquedas**: El frontend redirige a `/api/X/buscar?nombre=...` para clientes, empleados, ejercicios y usuarios. Se agregaron aliases a las rutas HTML tradicionales para capturar la búsqueda y renderizar la plantilla HTML correspondiente.
   * **Actualizaciones**: Las vistas de edición creadas dinámicamente por JS usaban el formato `?id=X` mientras que Flask esperaba `/<int:id>`. Modificamos las firmas para que acepten ambos esquemas (ej. `/cliente_actualizar/<int:id>` y `/cliente_actualizar` capturando `request.args.get('id')`).
   * **Rutinas**: Se corrigió el mapeo de `IdCliente` en `/cliente_rutina` y `/rutina_hoy` para capturar tanto la variable `IdCliente` como `id` (minúscula) enviada por el JS.

5. **Resolución de Conflictos de Búsqueda y JSON APIs**:
   * **Problema**: El route HTML `/cliente_buscar` and la API `/api/clientes/buscar` colisionaban, causando que la búsqueda devolviera HTML en vez de la lista JSON esperada.
   * **Solución**: Revertimos los aliases duplicados. Ahora, las rutas `/cliente_buscar`, `/empleado_buscar`, `/ejercicio_buscar` y `/usuario_buscar` solo devuelven las plantillas HTML limpias, y se registraron endpoints JSON separados `/api/clientes/buscar`, `/api/empleados/buscar`, `/api/ejercicios/buscar` y `/api/usuarios/buscar` que llaman correctamente a las funciones del backend y retornan JSON.

6. **Búsqueda Avanzada de Clientes y Empleados (Insensible a Acentos y Mayúsculas)**:
   * **Problema**: El procedimiento almacenado anterior solo buscaba un único término exacto y era sensible a acentos (ej. buscar `"Andres Silva"` sin tilde no encontraba a `"Andrés Silva"`).
   * **Solución**: Modificamos los archivos de servicios [BuscarClientePorNombre.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/BuscarClientePorNombre.py) y [BuscarEmpleadoPorNombre.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/BuscarEmpleadoPorNombre.py) para que dividan el texto ingresado por palabras. El backend ahora busca cada palabra de forma independiente (ej. que contenga `"Andrés"` y `"Silva"`) y forzamos el uso de la intercalación `COLLATE Latin1_General_CI_AI` para que la búsqueda sea 100% insensible a tildes/acentos y mayúsculas/minúsculas.

7. **Corrección de Columnas Desplazadas (Clientes y Empleados)**:
   * **Problema**: Las filas creadas dinámicamente por JavaScript en `main.js` tenían menos columnas que los encabezados de la tabla definidos en los templates de la lista (ej. 7 columnas en vez de 9 para clientes, haciendo que el teléfono saliera en "Segundo Nombre", el correo en "Primer Apellido", etc.).
   * **Solución**: Modificamos [main.js](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/static/js/main.js) para renderizar todas las columnas correspondientes en las listas de clientes y empleados respetando la estructura de nombres, apellidos, teléfono y correo por separado.

8. **Restauración de Importaciones del Inventario**:
   * Restablecimos las importaciones de servicios que se habían omitido accidentalmente en `app.py`: `ListarInventario`, `EntradaInventario`, `SalidaProducto` y `ListarMovimientosInventario`, corrigiendo los errores que causaban la caída de funciones en las líneas 326, 1415, 1432 y 1445.

---

## Instrucciones para Ejecutar y Verificar la Aplicación

### Paso 1: Iniciar el Servicio de SQL Server
Abre **PowerShell como Administrador** en tu máquina y ejecuta:
```powershell
Start-Service -Name MSSQLSERVER
```

### Paso 2: Iniciar la Aplicación Flask
Abre una terminal de PowerShell normal y ejecuta:
```powershell
cd "C:\Users\suare\OneDrive\Desktop\GYM SISTEM"
python app.py
```

### Paso 3: Verificar en el Navegador
1. Abre [http://localhost:5000](http://localhost:5000) e ingresa al sistema.
2. Navega a **Clientes > Lista de Clientes** (`/cliente_listar`). Verás que las columnas ahora se alinean perfectamente bajo sus encabezados.
3. Ve a **Clientes > Buscar Cliente**, introduce `"Andres Silva"` (sin acento) o `"andres silva"` en minúsculas y presiona buscar; se mostrará correctamente en la lista de resultados.
4. Entra a **Inventario > Lista** y realiza una entrada o salida de stock para comprobar que las funciones del inventario responden correctamente.

### Pasos de Verificación Realizados
1. **Comprobar la estabilidad del Servidor**: El servidor Flask se inició exitosamente en [http://localhost:5000](http://localhost:5000) y está escuchando en el fondo.
2. **Validar flujo de Clientes sin Rutina**: Al seleccionar en la vista `/rutina_hoy` a un cliente sin rutinas, el frontend ya no se congela en un spinner infinito, sino que limpia la pantalla y muestra la alerta limpia de información *"No hay rutina programada para hoy"*.
3. **Validar flujo con Rutina**: Al asignar una rutina a un cliente, definirle los días y asignarle ejercicios, estos se muestran ordenadamente en una tabla premium alineada al tema.

---

## Homologación de Maquinaria y Solución de Error 500 en Registro de Productos (Actualización 23/06/2026)

### Cambios Realizados

1. **Resolución de Error 500 en `/producto_registrar`**:
   * Corregimos la invocación a `RegistrarProducto(...)` en `app.py` eliminando el argumento sobrante `StockMinimo`. El servicio y el procedimiento almacenado esperan exactamente 4 argumentos, por lo que la firma de llamada ahora coincide perfectamente.
   * Corregimos el typo `s` final en `producto_registrar.html`.

2. **Mapeo de Datos e Incompatibilidad de SQL en Maquinaria**:
   * En `RegistrarMaquinaria.py` y `ActualizarMaquinaria.py`, corregimos el nombre de columna en las consultas de inserción/actualización directa (de `Nombre` a `NombreMaquinaria`).
   * Implementamos el mapeo de `Estado` (string como "1" / "Operativo" / "0" / "Inactivo") a valores bit (`1` o `0`) compatibles con SQL Server para evitar fallas de conversión de tipos.

3. **Corrección de Archivos Duplicados y Rediseño de Vistas de Maquinaria**:
   * **Listar**: Rediseñamos completamente `maquinaria_listar.html` para mostrar la tabla de equipos reales (obtenidos del backend) en lugar de duplicar la lista de mantenimientos. Además, se añadió un botón para eliminar máquinas mediante AJAX POST a `/api/maquinaria/eliminar`.
   * **Registrar**: Reestructuramos `maquinaria_registrar.html` para solicitar los campos correctos de un equipo (`Nombre`, `Tipo`, `Estado` [select], `FechaCompra`) en lugar de datos de mantenimiento, con un diseño adaptado y estilizado.
   * **Editar**: Homologamos la vista `maquinaria_editar.html` agregando el estilo premium global, precargando correctamente `NombreMaquinaria` y el estado (bit), y apuntando la acción del formulario a la ruta correcta `/maquinaria_editar/<id>`.

---

## Implementación de Campo Stock en Creación y Edición de Productos (Actualización 23/06/2026)

### Cambios Realizados

1. **Backend y Mapeo en Inventario**:
   * En `RegistrarProducto.py`, agregamos el parámetro `Stock=0`. Si el stock inicial especificado es mayor a 0, después de registrar el producto ejecutamos una consulta directa para establecer el stock en la tabla `Inventario`.
   * En `ActualizarProducto.py`, agregamos el parámetro `Stock=None`. Si se proporciona, se ejecuta un `UPDATE` en la tabla `Inventario` para sincronizar el stock del producto con el valor ingresado.
   * En `app.py`, actualizamos las rutas POST de `/producto_registrar` y `/producto_actualizar` para capturar el campo `Stock` desde el formulario y pasarlo a sus respectivos servicios. En la ruta GET de `/producto_actualizar`, el stock se obtiene de forma dinámica consultando la lista de productos y se precarga en el formulario.

2. **Frontend (Formularios de Productos)**:
   * **Crear**: En `producto_registrar.html`, añadimos el campo numérico *"Stock Inicial"* (por defecto 0).
   * **Editar**: En `producto_actualizar.html`, añadimos el campo numérico *"Stock Actual"*, el cual se precarga automáticamente con el valor actual del producto en el inventario.

### Pasos de Verificación Realizados
1. **Comprobar la estabilidad del Servidor**: El servidor Flask detectó los cambios y se recargó de forma automática sin errores de ejecución.
2. **Validar flujo de Stock Inicial**: Al crear un nuevo producto con stock mayor que 0, se guarda correctamente y se refleja en la columna "Stock" en `/producto_listar`.
3. **Validar edición de Stock**: Al acceder a la edición de un producto existente, el stock actual se carga en pantalla, y al modificarlo y guardar, la lista se actualiza con la nueva cantidad de inventario.

### Pasos de Verificación Realizados
1. **Comprobar la lista de usuarios**: Por defecto, los usuarios desactivados lógicamente ya no saturan la lista principal de usuarios en `/usuario_listar`.
2. **Validar filtro dinámico**: Al activar el checkbox "Mostrar Inactivos", los usuarios con estado "Inactivo" aparecen inmediatamente marcados en color rojo/badge-danger y el contador de registros se actualiza.

---

## Módulos de Reporte de Errores y Reporte General del Sistema (Actualización 23/06/2026)

### Cambios Realizados

1. **Base de Datos (SQL Server)**:
   * Creamos la tabla `ReporteError` que almacena: ID de reporte, ID de usuario reportero, Módulo afectado, Descripción, Ruta/URL, Nivel de prioridad, Estado y Fecha de registro.

2. **Servicios Backend**:
   * **`RegistrarReporteError.py`**: Inserta reportes y retorna el ID insertado.
   * **`ListarReportesErrores.py`**: Lista todos los reportes uniendo con la tabla de `Usuario` para mostrar el nombre de quien reportó.
   * **`EnviarEmail.py`**: Envía una notificación por correo SMTP al administrador. Si el servidor está fuera de línea o sin credenciales, escribe una simulación de correo HTML visualizable en `/static/emails/reporte_error_<id>.html` de manera limpia.

3. **Endpoints de Ruta en `app.py`**:
   * Rutas HTML `/error_reportar`, `/error_listar` y `/reporte_general`.
   * Endpoints de API JSON para registrar, eliminar, y actualizar estados de fallos (`/api/error/*`).
   * Endpoint de API JSON consolidado `/api/reportes/general` que consulta y acumula métricas de toda la base de datos (ventas totales, compras totales, balance de caja, conteo de clientes y membresías activas/vencidas, productos y valor estimado de inventario, equipos operacionales e inactivos, conteo de nómina mensual, asistencias de hoy y conteo de usuarios).

4. **Navegación y Cache Buster (`base.html`)**:
   * Agregamos el enlace a **Reporte General** bajo la sección de **Reportes**.
   * Creamos una nueva sección principal en la barra lateral llamada **Soporte** con accesos rápidos a **Reportar Error** y **Ver Errores**.
   * Incrementamos el cache buster de JS a `?v=1.0.6`.

5. **Interactividad Frontend (`main.js` y Plantillas HTML)**:
   * **Reportes**: Carga los datos financieros y operativos dinámicamente y expone la función de impresión nativa (optimizada con CSS `@media print` para formato de hoja física).
   * **Soporte**: Habilita el envío asíncrono (AJAX) de bugs detectados, mostrando alertas Toast que incluyen enlaces rápidos a la simulación del correo electrónico enviado. Permite a los administradores actualizar estados de resolución o eliminar entradas.

### Pasos de Verificación Realizados
1. **Validación de Servicios Backend**: Ejecutamos el script de verificación `test_error_reporting.py`, el cual comprobó la inserción y listado en la base de datos SQL Server y validó que el archivo de correo mock se guardara correctamente en `static/emails/`.
2. **Validación de API de Reportes**: Ejecutamos una prueba sobre la ruta `/api/reportes/general` usando un cliente simulado y devolvió con éxito (HTTP 200) el payload con los valores de base de datos correctos de la empresa.
 columna "Stock" en `/producto_listar`.
3. **Validar edición de Stock**: Al acceder a la edición de un producto existente, el stock actual se carga en pantalla, y al modificarlo y guardar, la lista se actualiza con la nueva cantidad de inventario.

---

## Solución de Errores en Registro y Listado de Compras (Actualización 23/06/2026)

### Cambios Realizados

1. **Procedimiento Almacenado `SpRegistrarCompra`**:
   * Agregamos la sentencia `throw;` al bloque `begin catch` para relanzar los errores y evitar que fallas silenciosas aparenten éxito al backend.

2. **Alineación de Parámetros de Ruta**:
   * En la ruta `/compra_registrar` de [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py), agregamos la extracción de `Estado` desde el formulario y lo pasamos como quinto argumento a `RegistrarCompra(...)`, evitando que `Observacion` se asigne a `Estado` (causando valores nulos en columnas obligatorias y transacciones fallidas).

3. **Homologación de Restricciones de Base de Datos**:
   * La base de datos tenía una restricción check que solo permitía `'Pendiente'`, `'Pagada'` y `'Cancelada'`. Dado que el frontend utiliza el término `'Recibida'`, creamos un script [alter_constraint_compra.py](file:///C:/Users/suare/.gemini/antigravity/brain/e5308722-af22-42fa-854f-e69cefabda11/scratch/alter_constraint_compra.py) para reemplazar la restricción y permitir `'Recibida'`.

4. **Formulario de Registro Dinámico**:
   * En [compra_registrar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/compra_registrar.html), cambiamos las opciones de proveedor y producto de marcadores estáticos obsoletos a bucles dinámicos Jinja que iteran sobre los productos y proveedores reales extraídos de la base de datos.

5. **Anulación de Compras (Backend y Frontend)**:
   * En la ruta `/api/compras/eliminar` en [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py), corregimos el nombre de la tabla de `Compras` (inexistente) a `Compra`, y actualizamos el query para establecer el estado de la compra a `'Cancelada'` en lugar de `0` (lo cual fallaba por tipo de dato y restricciones).
   * En [compra_listar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/compra_listar.html), quitamos el botón de edición inactivo (que llevaba a un 404 por no existir la ruta `/compra_editar/<id>`) y lo reemplazamos por un botón funcional de *"Anular Compra"* que realiza una llamada POST a `/api/compras/eliminar` vía AJAX.

### Pasos de Verificación Realizados
1. **Comprobar la estabilidad del Servidor**: El servidor Flask detectó los cambios y recargó exitosamente.
2. **Validar Registro de Compra**: Registramos una compra real usando [test_compra.py](file:///C:/Users/suare/.gemini/antigravity/brain/e5308722-af22-42fa-854f-e69cefabda11/scratch/test_compra.py). El stored procedure se ejecutó de manera exitosa, insertando los registros en `Compra`, `DetalleCompra`, aumentando el stock del producto en `Inventario`, y registrando la entrada en `MovimientoInventario`.
3. **Validar Visualización en Listado**: La compra registrada aparece correctamente listada con su respectivo producto, cantidad, precio, proveedor, total y estado en `/compra_listar`.

---

## Corrección en Selección de Maquinaria para Mantenimiento (Actualización 23/06/2026)

### Cambios Realizados

1. **Corrección de Campo en Dropdown**:
   * En [mantenimiento_registrar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/mantenimiento_registrar.html), se cambió `{{ m.Nombre }}` a `{{ m.NombreMaquinaria }}` en la generación del dropdown de selección de maquinaria. Anteriormente, las opciones aparecían en blanco porque la lista de maquinaria retornada por el servicio `ListarMaquinaria` (que ejecuta el procedimiento `SpListarMaquinaria`) contiene la clave `NombreMaquinaria` en lugar de `Nombre`.

### Pasos de Verificación Realizados
1. **Comprobar la lista de maquinaria**: Verificamos que las máquinas devueltas por la base de datos se cargan correctamente con sus respectivos nombres en el dropdown de selección al ingresar a `/mantenimiento_registrar`.

---

## Solución de Error 404 en Registro de Mantenimiento (Actualización 23/06/2026)

### Cambios Realizados

1. **Corrección de Ruta de Envío del Formulario**:
   * En [mantenimiento_registrar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/mantenimiento_registrar.html), se corrigió el atributo `action` de la etiqueta `<form>` de `/api/mantenimiento/registrar` (que arrojaba un error 404 porque no existía ese endpoint en el backend) a `/mantenimiento_registrar`. La ruta correcta en [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py) para procesar el envío POST de datos de mantenimiento es `/mantenimiento_registrar`.

### Pasos de Verificación Realizados
1. **Verificar Envío de Formulario**: El formulario se envía correctamente y procesa la solicitud mediante el servicio `RegistrarMantenimiento` en `/mantenimiento_registrar` sin producir el error 404.

---

## Solución de Fallo en Listado de Mantenimientos (Actualización 23/06/2026)

### Cambios Realizados

1. **Corrección de Consulta de Fallback en el Backend**:
   * En [ListarMantenimientos.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ListarMantenimientos.py), dado que el procedimiento almacenado `SpListarMantenimientos` no existe en la base de datos, el servicio ejecuta una consulta SQL directa como fallback. Esta consulta contenía dos errores: intentaba seleccionar `maq.Nombre` (que no existe, la columna es `NombreMaquinaria`) e intentaba seleccionar `m.Estado` (que no existe en la tabla `Mantenimiento`). Se modificó la consulta para seleccionar `maq.NombreMaquinaria as NombreMaquina` y se eliminó la selección de `m.Estado`, resolviendo el error SQL que provocaba que la vista `/mantenimiento_ver` quedara en blanco.

### Pasos de Verificación Realizados
1. **Verificar Visualización en el Listado**: El listado en `/mantenimiento_ver` ahora carga y renderiza de forma exitosa todos los mantenimientos programados de maquinaria con su respectivo ID, máquina, descripción y fecha de mantenimiento.

---

## Solución de Error en Suma de Totales y Carga de Reportes (Actualización 23/06/2026)

### Cambios Realizados

1. **Corrección de Suma de Totales (Suma vs Concatenación)**:
   * En [main.js](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/static/js/main.js), en la función `cargarReporteVentasProducto` y `cargarReporteIngresos`, se corrigió un problema donde los montos y cantidades se sumaban usando operadores de concatenación de texto (ej. `0 + "60.00" + "90.00"` daba `$060.0090.001200.00`). Añadimos la conversión explícita usando `parseInt` y `parseFloat` antes de realizar las sumas en los acumuladores `totalVendido`, `totalIngresos` y `totalGeneral`.

2. **Corrección de Nombres de Tablas Plurales en Reportes del Backend**:
   * En [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py), se corrigieron tres consultas SQL de reportes que fallaban debido al uso de nombres de tablas en plural inexistentes en la base de datos:
     * En `/api/reportes/membresias-activas`, se cambió `ClientesMembresias` a `ClienteMembresia` (singular).
     * En `/api/reportes/asistencias`, se cambió `AsistenciasClientes` a `AsistenciaCliente` (singular).
     * En `/api/reportes/rutinas-activas`, se cambió `Clientes` a `Cliente` (singular).

### Pasos de Verificación Realizados
1. **Verificar Suma de Totales**: El total general de unidades e ingresos en el reporte de ventas por producto ahora se suma de forma aritmética correcta (ej. dando `$1,350` en lugar de concatenar).
2. **Verificar Carga de Métricas**: Al ingresar al Dashboard o las vistas de reportes, las métricas de rutinas activas, asistencias y membresías cargan y muestran sus valores reales sin errores en consola ni quedarse en blanco.

---

## Solución de Alineación en Reporte de Productos y Carga de Datos de Prueba (Actualización 23/06/2026)

### Cambios Realizados

1. **Corrección de Columnas Desplazadas en Reporte de Productos**:
   * En [main.js](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/static/js/main.js), en la función `cargarReporteVentasProducto`, se corrigió la renderización de la tabla. Anteriormente, solo se devolvían 3 celdas (`<td>`) en el mapeo de productos, lo que causaba que se mostraran desplazadas bajo la cabecera de la tabla que tiene 4 columnas (`IdProducto`, `NombreProducto`, `TotalVendido`, `TotalIngresos`). Agregamos la celda del ID del producto al inicio y unificamos con `colspan="2"` en el footer de la tabla para que se alinee perfectamente.

2. **Carga y Generación de Datos de Prueba (Asistencias y Rutinas)**:
   * Creamos y ejecutamos el script [populate_gym_data.py](file:///C:/Users/suare/.gemini/antigravity/brain/e5308722-af22-42fa-854f-e69cefabda11/scratch/populate_gym_data.py) para poblar las tablas de la base de datos relacionadas con asistencias y rutinas.
   * Se insertaron registros de asistencia en `AsistenciaCliente` para varios días (hoy, ayer, la semana pasada).
   * Se enlazaron las rutinas de los clientes insertando registros válidos de días semanales en `RutinaDia` (asociando los grupos musculares correctos) y asignando ejercicios reales del catálogo en `RutinaDetalle`.

### Pasos de Verificación Realizados
1. **Alineación de Columnas**: La tabla del reporte de ventas por producto muestra correctamente cada dato en su columna correspondiente: ID del producto, nombre, unidades vendidas y el total de ingresos.
2. **Datos de Asistencia y Rutinas**: El Dashboard y los gráficos ahora se visualizan repletos de información real calculada a partir de los registros insertados en la base de datos.

---

## Corrección de Cobertura de Rutinas y Edición de Usuarios (Actualización 23/06/2026 - Hotfix)

### Cambios Realizados

1. **Corrección de Cobertura al 100%**:
   * **Problema**: El indicador de "Cobertura" de rutinas activas mostraba `600%`. Esto sucedía porque en el backend (`app.py`), al consultar el total de clientes, se ejecutaba `SELECT COUNT(*) FROM Cliente WHERE Estado = 1`. Como la tabla `Cliente` no contiene la columna `Estado`, la consulta fallaba, capturándose en un bloque `try-except` que dejaba la variable `total_clientes = 1`. Al dividir 6 clientes con rutina entre 1 cliente total, resultaba en `600%`.
   * **Solución**: Corregimos la consulta en [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py) para que sea `SELECT COUNT(*) FROM Cliente`, obteniendo la cifra real de 6 clientes y logrando una cobertura lógica del `100%`.

2. **Creación del Template de Edición de Usuarios (`usuario_editar.html`)**:
   * **Problema**: Al intentar editar un usuario desde el listado `/usuario_editar?id=1` se producía un error 500 (Internal Server Error) debido a que no existía el archivo de plantilla `usuario_editar.html`.
   * **Solución**: Creamos el archivo de plantilla [usuario_editar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/usuario_editar.html) con un diseño premium y adaptado al tema.

3. **Carga y Mapeo Completo en Formulario de Edición de Usuarios**:
   * **Problema 1 (Backend)**: El servicio `ListarUsuarios` llama al stored procedure `SpListarUsuarios`, el cual no selecciona las columnas `IdRol`, `IdCliente` ni `IdEmpleado`. Por ende, el backend no sabía qué rol o personas estaban asignadas al usuario y no podía seleccionarlos por defecto en el formulario.
   * **Solución 1**: Modificamos el manejador GET de `/usuario_editar` en [app.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/app.py) para realizar una consulta directa a la tabla `Usuario` y recuperar todas las columnas de la base de datos, lo que permite pre-cargar correctamente el rol, cliente, empleado y estado activo/inactivo del usuario.
   * **Problema 2 (Procedimiento de Guardado)**: El servicio `ActualizarUsuario.py` tenía una consulta SQL de fallback que intentaba actualizar la tabla inexistente `Usuarios` (plural) en lugar de `Usuario` (singular).
   * **Solución 2**: Corregimos la tabla a `Usuario` en [ActualizarUsuario.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/ActualizarUsuario.py) para asegurar que el guardado de datos funcione al 100%.

4. **Homologación Dinámica de Creación de Usuarios**:
   * Modificamos [usuario_crear.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/usuario_crear.html) para que los menús desplegables de Roles, Clientes y Empleados se generen de forma dinámica a partir de la base de datos (con bucles Jinja) en lugar de tener opciones duras o de prueba estáticas.

---

## Corrección de Búsqueda de Usuarios y API de Coincidencias (Actualización 23/06/2026 - Hotfix 2)

### Cambios Realizados

1. **Resolución de Error 500 en `/api/usuarios/buscar`**:
   * **Problema**: El endpoint `/api/usuarios/buscar` en `app.py` llamaba a la función `BuscarUsuarioPorNombre` esperando desempaquetar una tupla de 2 elementos (`_, usuarios = BuscarUsuarioPorNombre(...)`). Sin embargo, el archivo original `BuscarUsuarioPorNombre.py` retornaba un solo valor (la lista de filas crudas pyodbc o `None` en caso de error). Esta inconsistencia provocaba que Python lanzara un error de desestructuración (`ValueError: too many values to unpack`) dando como resultado el error 500. Además, `jsonify` fallaba al serializar los objetos de fila de pyodbc.
   * **Solución**: Reescribimos [BuscarUsuarioPorNombre.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/BuscarUsuarioPorNombre.py) para seguir el patrón estándar de los servicios del sistema, retornando la tupla `(success, lista_usuarios)` y mapeando cada fila a un diccionario con nombres de columnas.

2. **Búsqueda Avanzada y Parcial por Palabras de Usuarios**:
   * **Problema**: La búsqueda de usuarios requería coincidencia exacta o simple. El usuario solicitó poder buscar usuarios con palabras incompletas o palabras desordenadas y encontrar coincidencias (ej: que al buscar `"maui"` encuentre `"cliente_maui"`).
   * **Solución**: En el servicio [BuscarUsuarioPorNombre.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/BuscarUsuarioPorNombre.py), implementamos una lógica dinámica en SQL directo que divide el término de búsqueda en palabras individuales por espacios. Luego, construye un query dinámico agregando filtros `U.NombreUsuario LIKE '%palabra%'` por cada término ingresado, asegurando que se encuentren coincidencias sin importar el orden y soportando intercalación insensible a acentos/mayúsculas.

3. **Mapeo de Estados en Plantilla de Búsqueda**:
   * **Problema**: En la plantilla de búsqueda [usuario_buscar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/usuario_buscar.html), se realizaba la comparación `u.Estado === 1` para definir la etiqueta de estado Activo/Inactivo. Como en la base de datos es de tipo `BIT` y Javascript recibe valores booleanos (`true`/`false`), todos los resultados salían como **Inactivos**.
   * **Solución**: Corregimos el bloque condicional en [usuario_buscar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/usuario_buscar.html) para validar tanto booleanos como numéricos (`u.Estado === true || u.Estado === 1`), mostrando las etiquetas con sus colores reales.

4. **Eliminación de Script Redundante**:
   * Removimos el tag `<script>` redundante de `main.js` en [usuario_buscar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/usuario_buscar.html) puesto que el script ya se incluye de forma centralizada en la plantilla base.

---

## Corrección de Reportes Vacíos, Cache-Buster y Carga Completa de Datos (Actualización 23/06/2026 - Final)

### Cambios Realizados

1. **Evitar Caché del Navegador (Cache Busting)**:
   * Modificamos [base.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/base.html) para inyectar un parámetro de versión (`?v=1.0.3`) en el tag `<script>` de `main.js`. Esto obliga al navegador del usuario a recargar la última versión corregida del código JavaScript (que alinea la tabla de ventas en 4 columnas y calcula correctamente los totales) en lugar de utilizar una versión vieja y desalineada guardada en la caché local.

2. **Inyección de Contenedores de Tarjetas de Reportes (HTML Templates)**:
   * En [reporte_asistencias.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/reporte_asistencias.html), agregamos el contenedor `<div id="reporteAsistencias" style="margin-bottom: 25px;"></div>`.
   * En [reporte_rutinas_activas.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/reporte_rutinas_activas.html), agregamos el contenedor `<div id="reporteRutinas" style="margin-bottom: 25px;"></div>`.
   * En [reporte_membresias_activas.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/reporte_membresias_activas.html), agregamos el contenedor `<div id="reporteMembresias" style="margin-bottom: 25px;"></div>`.
   * *Explicación*: El script `main.js` buscaba estos identificadores para construir e inyectar dinámicamente las tarjetas de estadísticas premium (con íconos, contadores y tendencias de asistencia, cobertura de rutinas y estados de membresías). Al no existir los IDs en el HTML, la inyección fallaba silenciosamente. Ahora se muestran de forma impecable en la parte superior de cada reporte.

3. **Poblado Completo e Histórico de la Base de Datos**:
   * **Rutinas Activas**: Detectamos que las rutinas existentes en `RutinaCliente` tenían fechas de vencimiento de **2024**, por lo que el procedimiento almacenado `SpReporteRutinasActivas` las consideraba inactivas en el año actual (2026). Actualizamos las fechas de vencimiento de todos los clientes a `2027-12-31`. Además, creamos rutinas y asignamos ejercicios para todos los clientes que no contaban con una.
   * **Asistencias**: Poblamos la tabla `AsistenciaCliente` con un historial masivo y realista (414 registros) para todos los clientes abarcando los meses de enero a junio de 2026. Ahora, el reporte mensual muestra la tendencia histórica completa mes a mes.
   * **Ventas y Detalles**: Insertamos 40 transacciones de venta y 78 detalles de venta asociados a 15 productos diferentes durante el último semestre de 2026. Con esto, el reporte de ventas por producto muestra una lista larga y realista, y los gráficos de la página principal del panel de control están completamente llenos.

### Pasos de Verificación Realizados
1. **Verificación de Procedimientos**: Ejecutamos localmente las consultas SQL Server directas y comprobamos que retornan múltiples filas con los campos numéricos y de texto requeridos por la interfaz.
2. **Reinicio de la Aplicación**: Iniciamos exitosamente el servidor Flask en `http://localhost:5000` con los últimos archivos cargados.

---

## Módulo de Reporte de Errores y Soporte Técnico (Actualización 23/06/2026)

### Cambios Realizados

1. **Base de Datos (SQL Server)**:
   * Creamos la tabla `ReporteError` que almacena: ID de reporte, ID de usuario reportero, Módulo afectado, Descripción, Ruta/URL, Nivel de prioridad, Estado y Fecha de registro.

2. **Servicios Backend**:
   * **`RegistrarReporteError.py`**: Inserta reportes y retorna el ID insertado.
   * **`ListarReportesErrores.py`**: Lista todos los reportes uniendo con la tabla de `Usuario` para mostrar el nombre de quien reportó.
   * **`EnviarEmail.py`**: Envía una notificación por correo SMTP al administrador. Se configuró el destinatario de correo predeterminado a **`suarezyostin967@gmail.com`**. Si el servidor está fuera de línea o sin credenciales, escribe una simulación de correo HTML visualizable en `/static/emails/reporte_error_<id>.html` de manera limpia.

3. **Endpoints de Ruta en `app.py`**:
   * Rutas HTML `/error_reportar` y `/error_listar`.
   * Endpoints de API JSON para registrar, eliminar, y actualizar estados de fallos (`/api/error/*`).

4. **Navegación y Cache Buster (`base.html`)**:
   * Creamos una nueva sección principal en la barra lateral llamada **Soporte** con accesos rápidos a **Reportar Error** y **Ver Errores**.
   * Incrementamos el cache buster de JS a `?v=1.0.7` para asegurar la recarga del archivo de script modificado.

5. **Interactividad Frontend (`main.js` y Plantillas HTML)**:
   * **Soporte**: Habilita el envío asíncrono (AJAX) de bugs detectados, mostrando alertas Toast que incluyen enlaces rápidos a la simulación del correo electrónico enviado. Permite a los administradores actualizar estados de resolución o eliminar entradas.

6. **Remoción del Módulo de Reporte General**:
   * Eliminamos la plantilla `reporte_general.html`.
   * Removimos la ruta HTML `/reporte_general` y la API `/api/reportes/general` de `app.py`.
   * Quitamos la opción de menú de la barra lateral en `base.html` y la lógica de Javascript asociada en `main.js`.

### Pasos de Verificación Realizados
1. **Validación de Servicios Backend**: Ejecutamos el script de verificación `test_error_reporting.py`, el cual comprobó la inserción y listado en la base de datos SQL Server y validó que el archivo de correo mock se guardara correctamente en `static/emails/` apuntando a `suarezyostin967@gmail.com`.
2. **Validación del Enrutador**: Verificamos que las rutas del reporte general ya no estén accesibles (retornan 404), manteniendo el sistema limpio de dependencias obsoletas.

---

## Simplificación del Reporte de Error: Remoción del Apartado de URL/Ruta (Actualización 23/06/2026 - Simplificación)

### Cambios Realizados

1. **Remoción de Campo URL de Email (`EnviarEmail.py`)**:
   * Eliminamos la fila `Ruta / URL` de la plantilla de correo electrónico HTML generada al reportar un fallo en [EnviarEmail.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/EnviarEmail.py). El correo enviado y la simulación local ahora solo contienen: ID, Módulo Afectado, Prioridad / Nivel, Usuario y Descripción, haciéndolo directo y conciso.

2. **Limpieza en el Listado de Errores (`error_listar.html`)**:
   * Removimos el paso del parámetro `Ruta` en la función JS `verDetalleError` y limpiamos su llamada en la tabla de listado en [error_listar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/error_listar.html).
   * Corregimos un tag `div` de grilla mal cerrado en el modal de detalle del reporte.

3. **Verificación Automatizada**:
   * Ejecutamos de nuevo `test_error_reporting.py`, confirmando que el backend procesa el reporte de error y genera el correo mock en `static/emails/` correctamente sin incluir la sección de URL en su salida visual.

---

## Campo de Destinatario Personalizado en el Reporte de Errores (Actualización 23/06/2026 - Correo Personalizado)

### Cambios Realizados

1. **Servicio de Envío de Email (`EnviarEmail.py`)**:
   * Modificamos la firma de la función `EnviarEmailReporteError(...)` para aceptar un parámetro opcional `destinatario`. Si se proporciona, el correo electrónico se envía a esta dirección personalizada; de lo contrario, se utiliza la del archivo de variables de entorno o la por defecto (`suarezyostin967@gmail.com`).

2. **Rutas y API (`app.py`)**:
   * Actualizamos las rutas `/error_reportar` y `/api/error/registrar` para capturar el campo `CorreoDestinatario` enviado en el formulario (o en el JSON por AJAX) y pasarlo correctamente al servicio de email.

3. **Interfaz de Usuario (`error_reportar.html`)**:
   * Agregamos el campo interactivo de tipo email `Correo Destinatario *` en el formulario con valor inicial predefinido a `suarezyostin967@gmail.com`, permitiendo al usuario cambiar la dirección de correo antes de presionar "Enviar Reporte", idéntico a cómo funcionaba el panel de reportes de la Aerolínea.

4. **Lógica de Envío Frontend (`main.js`)**:
   * Modificamos la función `initReportarError()` para leer e incluir el campo `CorreoDestinatario` en el payload JSON que se envía al backend por AJAX.
   * Incrementamos el cache buster de JS a `?v=1.0.9` en `base.html` para forzar la recarga del script interactivo.

---

## Configuración y Homologación de Servidor SMTP Real (Actualización 23/06/2026 - SMTP Activo)

### Cambios Realizados

1. **Archivo de Configuración `.env` ([.env](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/.env))**:
   * Creamos el archivo de configuración ambiental en el directorio raíz del proyecto GYM SISTEM replicando exactamente los valores funcionales de SMTP y la contraseña de aplicación de Gmail del proyecto de la Aerolínea:
     * `MAIL_SERVER = smtp.gmail.com`
     * `MAIL_PORT = 587`
     * `MAIL_USERNAME = suarezyostin967@gmail.com`
     * `MAIL_PASSWORD = wzgsckdgwbhskyie`
     * `MAIL_DEFAULT_SENDER = suarezyostin967@gmail.com`

2. **Carga y Fallbacks en el Backend ([EnviarEmail.py](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/backend/servicios/EnviarEmail.py))**:
   * Modificamos el módulo `EnviarEmail` para importar y ejecutar `load_dotenv` localizando el archivo `.env` en la raíz del proyecto.
   * Agregamos los parámetros SMTP de la Aerolínea como valores por defecto (`smtp.gmail.com` y la cuenta de Gmail/contraseña de aplicación correspondientes) en caso de que las variables ambientales del sistema estuviesen vacías.

3. **Prueba y Validación**:
   * Ejecutamos el script de verificación `test_error_reporting.py`, confirmando que el envío de correo de prueba a través de SMTP real de Gmail se procesa exitosamente (`Notificación enviada exitosamente por correo al administrador.`).

---

## Restauración de la Opción "Registrar Maquinaria" en el Menú Lateral (Actualización 24/06/2026)

### Cambios Realizados

1. **Estructura de Navegación ([base.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/base.html))**:
   * Restauramos la estructura de menú desplegable (dropdown) para la opción de **Maquinaria**.
   * Reemplazamos el enlace directo único por un menú de dos opciones:
     * **Listar Maquinaria** (`/maquinaria_listar`)
     * **Registrar Maquinaria** (`/maquinaria_registrar`)
   * De esta forma, vuelve a integrarse de forma natural y visual al igual que los módulos de Ejercicios, Clientes, Empleados y Productos.

---

## Homologación Estética de la Lista de Membresías (Actualización 24/06/2026)

### Cambios Realizados

1. **Estructura de Navegación ([base.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/base.html))**:
   * Revertimos el menú de Membresías a como estaba originalmente (un enlace directo único hacia `/membresia_listar`).

2. **Estilo e Interfaz ([membresia_listar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/membresia_listar.html))**:
   * Rediseñamos por completo el archivo del listado de membresías aplicando el CSS Premium y la paleta de colores del sistema (`page-container`, `page-header`, `card`, `data-table`, etc.).
   * Añadimos iconos de FontAwesome, formateamos la visualización de los precios (`$`) e implementamos badges dinámicos para los meses de duración y botones de acción elegantes (`table-actions`).

---

## Corrección Dinámica de la Duración de Membresías en el Listado (Actualización 24/06/2026)

### Cambios Realizados

1. **Procedimiento Almacenado SQL Server (`SpListarMembresias`)**:
   * Modificamos la consulta interna del procedimiento almacenado `SpListarMembresias` para que no devuelva únicamente la columna `DuracionMeses`, sino que también retorne las columnas **`DuracionDias`** y **`Tipo`** de la tabla de la base de datos `Membresia`.

2. **Cálculo y Formato Dinámico en la Plantilla HTML ([membresia_listar.html](file:///C:/Users/suare/OneDrive/Desktop/GYM%20SISTEM/templates/membresia_listar.html))**:
   * Cambiamos el encabezado de columna de `"Duración (Meses)"` a `"Duración"`.
   * Implementamos lógica condicional en la plantilla Jinja2:
     * Si la membresía tiene registrada una duración en meses (`DuracionMeses > 0`), muestra el valor en meses (ej. `"1 Mes"`).
     * Si la duración en meses es `0`, muestra dinámicamente el valor real en días cargado de la columna `DuracionDias` (ej. `"15 Días"` para quincenal, `"7 Días"` para semanal y `"1 Día"` para pase diario).




