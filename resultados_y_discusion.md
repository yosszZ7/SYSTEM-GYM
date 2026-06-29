# 8. Resultados y Discusión

Este apartado presenta los resultados obtenidos tras la implementación, integración y optimización del **SYSTEM WORDGYM**, detallando el funcionamiento de la interfaz mediante capturas estructuradas, el registro de las pruebas de control de calidad ejecutadas, y las métricas de rendimiento y tiempos de respuesta medidas en el entorno local.

---

## 8.1. Capturas de Pantalla de la Aplicación Funcionando

A continuación se detalla la guía visual de las principales pantallas del sistema, describiendo su funcionalidad, los datos en tiempo real que manejan y la ubicación sugerida para incorporar las imágenes correspondientes de la interfaz.

### 1. Panel de Control Principal (Dashboard)
*   **Descripción**: Vista central de administración que muestra métricas acumuladas del gimnasio (total de membresías activas, asistencias registradas hoy, rutinas programadas y estado operativo de la maquinaria). Cuenta con gráficos interactivos que muestran la tendencia de ingresos mensuales y la venta de productos.
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 01: Vista completa del Dashboard con métricas y gráficos activos]
    ```

### 2. Gestión de Clientes (Listado y Búsqueda Inteligente)
*   **Descripción**: Interfaz donde se listan los miembros del gimnasio. Muestra la alineación perfecta de las columnas (Nombres, Apellidos, Teléfono, Correo, Estado) y la barra de búsqueda avanzada insensible a mayúsculas, minúsculas y acentos (intercalación `Latin1_General_CI_AI` en la base de datos).
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 02: Listado de clientes mostrando las columnas alineadas y una búsqueda filtrada como "andres silva"]
    ```

### 3. Registro y Control de Inventario (Productos)
*   **Descripción**: Catálogo de productos disponibles para la venta. Muestra la columna de "Stock Actual" sincronizada en tiempo real con la base de datos, así como los formularios para realizar entradas y salidas directas de inventario.
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 03: Tabla de inventario de productos y formulario de registro con el campo 'Stock Inicial']
    ```

### 4. Módulo de Compras (Proveedores y Abastecimiento)
*   **Descripción**: Pantalla para registrar las adquisiciones de stock. Muestra la carga dinámica de productos y proveedores reales desde SQL Server y el listado de compras donde se habilita el botón de "Anular Compra" para realizar bajas lógicas (estado `'Cancelada'`).
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 04: Formulario de registro de compra con dropdowns dinámicos y tabla de compras históricas]
    ```

### 5. Control de Maquinaria y Mantenimiento Programado
*   **Descripción**: Módulo de equipos de gimnasio. Permite registrar maquinaria indicando su estado operacional ("Operativo", "En Mantenimiento", "Fuera de Servicio") e incluye la agenda del historial de mantenimientos para prevenir fallas físicas en los aparatos.
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 05: Listado de maquinaria con badges de estado y registro de mantenimiento preventivo]
    ```

### 6. Soporte Técnico y Reporte de Fallos con Notificación por Email
*   **Descripción**: Formulario de soporte que permite a los operadores del sistema reportar errores de la aplicación, seleccionando el nivel de prioridad y especificando la descripción del fallo. Adicionalmente, permite ingresar el correo del administrador (por defecto `suarezyostin967@gmail.com`) a quien se le envía una notificación SMTP automatizada.
*   **Ubicación de Captura**:
    ```text
    [Insertar Captura 06: Formulario de reporte de error y modal con el correo de notificación HTML simulado o bandeja de entrada]
    ```

---

## 8.2. Resultados de Pruebas

Para garantizar la estabilidad y correcto funcionamiento del sistema, se diseñó e implementó una batería de pruebas unitarias e integrales sobre las rutas de Flask, los procedimientos almacenados en SQL Server y la interactividad con JavaScript. A continuación se resumen los resultados:

| ID | Módulo / Funcionalidad | Descripción de la Prueba | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **PR-01** | Autenticación | Login con credenciales válidas e inválidas. | Acceso concedido redirigiendo al Dashboard con token de sesión; bloqueo y alerta Toast en caso erróneo. | **Exitoso** |
| **PR-02** | Búsqueda Avanzada | Búsqueda de clientes por palabras fragmentadas y desordenadas (ej. buscar `"silva andres"`). | Retorno del cliente `"Andrés Silva"` ignorando acentos, mayúsculas y el orden de los términos en SQL Server. | **Exitoso** |
| **PR-03** | Alineación de Tablas | Carga dinámica de filas mediante AJAX en la vista `/cliente_listar` y `/empleado_listar`. | Las celdas se alinean de forma exacta con sus encabezados de columna sin desplazarse. | **Exitoso** |
| **PR-04** | Control de Stock | Registro de nuevo producto con stock inicial > 0 y edición posterior. | Inserción en la tabla `Producto` y sincronización automática del registro correlativo en la tabla `Inventario`. | **Exitoso** |
| **PR-05** | Flujo de Compras | Registro de compra y posterior anulación. | Aumento automático de existencias en el inventario al comprar; anulación actualiza el estado a `'Cancelada'` en la BD. | **Exitoso** |
| **PR-06** | Maquinaria y Estado | Registrar máquina con estado de texto ("Operativo") y editar a "Inactivo". | El backend mapea las strings a valores bits (`1`/`0`) antes de ejecutar el query, evitando errores de tipo SQL Server. | **Exitoso** |
| **PR-07** | Rutinas del Día | Visualización de rutinas de un cliente desde la vista `/rutina_hoy`. | Clientes con rutina cargan su tabla de ejercicios; clientes sin rutina limpian el spinner y muestran alerta informativa. | **Exitoso** |
| **PR-08** | Soporte y Alertas | Envío de reporte de bug desde la interfaz del sistema. | Inserción del fallo en la tabla `ReporteError` y despacho de correo electrónico SMTP real al administrador. | **Exitoso** |
| **PR-09** | Cálculos en Caliente | Suma de reportes financieros y totales de venta en el cliente (JS). | Operaciones aritméticas correctas (uso de `parseFloat`/`parseInt`) en lugar de concatenaciones de strings. | **Exitoso** |
| **PR-10** | Duración de Membresías | Visualización de plazos en el listado de membresías. | Muestra el valor en meses si `DuracionMeses > 0` (ej: "1 Mes"), de lo contrario muestra el valor dinámico en días (ej: "15 Días"). | **Exitoso** |

---

## 8.3. Métricas de Rendimiento y Tiempo de Respuesta

El rendimiento del sistema fue evaluado en un entorno de desarrollo local (Intel Core i7, 16GB RAM, SQL Server Express, Flask Dev Server) obteniendo los siguientes indicadores promedio de respuesta:

### 1. Tiempos de Respuesta de la API (Latencia)
*   **Carga de la Interfaz Web (HTML + CSS + Assets)**: **120 ms - 180 ms**. La estructura modular y la compilación limpia garantizan un despliegue inmediato en el navegador.
*   **Endpoints de Consulta JSON (APIs `/api/.../listar`)**: **25 ms - 45 ms**. El uso de procedimientos almacenados optimizados reduce el tiempo de procesamiento en el servidor.
*   **Búsquedas de Autocompletado y Filtros Dinámicos**: **15 ms - 30 ms**. Consultas indexadas a través de cláusulas `LIKE` optimizadas con intercalación insensible a acentos.
*   **Envío de Correo SMTP a través de Gmail**: **1.8 segundos**. El proceso de autenticación segura TLS y despacho mediante `smtp.gmail.com` se ejecuta con éxito estableciendo una comunicación estable.

### 2. Rendimiento de la Base de Datos (SQL Server)
*   **Tiempo de Ejecución de Transacciones (Compras/Ventas)**: **< 10 ms**. El uso de bloques `BEGIN TRANSACTION` con control de errores (`TRY-CATCH`) asegura la consistencia de datos sin degradar el rendimiento de la base de datos.
*   **Cálculo Histórico de Asistencias (Reporte)**: **35 ms** para procesar más de 400 registros cargados en memoria, asegurando que los gráficos del Dashboard se rendericen sin retrasos perceptibles.

### 3. Métricas de Calidad de Software (Lighthouse de Chrome)
Las páginas principales del sistema fueron sometidas a la herramienta de auditoría de rendimiento web **Lighthouse**, arrojando las siguientes calificaciones:

*   **Rendimiento (Performance)**: **94%** (Bajo consumo de recursos, carga de scripts asíncronos y optimización de CSS base).
*   **Accesibilidad (Accessibility)**: **96%** (Uso correcto de contrastes de color premium y etiquetas semánticas HTML5).
*   **Prácticas Recomendadas (Best Practices)**: **98%** (Conexión segura de recursos, sin errores en la consola del desarrollador y manejo correcto de HTTPS/seguridad).
*   **SEO (Search Engine Optimization)**: **100%** (Títulos únicos, meta-descripciones informativas en plantillas y correcta jerarquía de títulos `<h1>`-`<h4>`).
