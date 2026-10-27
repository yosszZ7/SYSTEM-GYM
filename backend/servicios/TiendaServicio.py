import os
import json
from datetime import datetime
from ConexionBD import ConectarBD
from backend.servicios.ListaDeProductos import ListarProductos
from backend.servicios.RegistrarProducto import RegistrarProducto
from backend.servicios.ActualizarProducto import ActualizarProducto
from backend.servicios.ProcesarVenta import ProcesarVenta
from backend.servicios.RegistrarVenta import RegistrarVenta
from backend.servicios.ListaDeClientes import ListarClientes
from backend.logica_negocio import aplicar_descuento, calcular_nuevo_stock_salida, verificar_alerta_stock_minimo

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
META_JSON_PATH = os.path.join(BASE_DIR, "static", "data", "tienda_meta.json")
PEDIDOS_JSON_PATH = os.path.join(BASE_DIR, "static", "data", "tienda_pedidos.json")

# Catálogo de imágenes integradas de suplementos y productos deportivos (sin imágenes de computadoras/tecnología)
IMAGENES_SUPLEMENTOS = [
    {"id": "raptor_whey", "nombre": "Proteína Raptor Hydro Whey (5 lbs)", "url": "/static/image/productos/raptor_whey.svg"},
    {"id": "power_creatina", "nombre": "Suplemento Power Creatine 100% (500g)", "url": "/static/image/productos/power_creatina.svg"},
    {"id": "power_preworkout", "nombre": "Pre-Entreno Power Nitro Pump (30 serv)", "url": "/static/image/productos/power_preworkout.svg"},
    {"id": "whey_gold", "nombre": "Proteína 100% Whey Gold Standard (5 lbs)", "url": "/static/image/productos/whey_gold.svg"},
    {"id": "creatina_mono", "nombre": "Creatina Monohidratada Pura (300g)", "url": "/static/image/productos/creatina_mono.svg"},
    {"id": "mass_gainer", "nombre": "Ganador de Masa Muscular Serious Mass (6 lbs)", "url": "/static/image/productos/mass_gainer.svg"},
    {"id": "bebida_energetica", "nombre": "Bebida Energética & Isotónica Gym Fuel (500ml)", "url": "/static/image/productos/bebida_energetica.svg"},
    {"id": "shaker_pro", "nombre": "Shaker Pro Antiderrames WORLDGYM (700ml)", "url": "/static/image/productos/shaker_pro.svg"},
    {"id": "guantes_pro", "nombre": "Kit Guantes y Straps de Levantamiento Pro", "url": "/static/image/productos/guantes_pro.svg"},
    {"id": "default_suplemento", "nombre": "Suplemento Deportivo Estándar WORLDGYM", "url": "/static/image/productos/default_suplemento.svg"},
]

CATEGORIAS_TIENDA = [
    "Proteínas",
    "Creatina",
    "Preentrenos",
    "Ganadores de masa",
    "Bebidas energéticas",
    "Accesorios",
    "Suplementos"
]

# Productos de demostración (claramente diferenciados con EsDemo=True y etiqueta DEMOSTRACIÓN)
PRODUCTOS_DEMOSTRACION = [
    {
        "IdProducto": -101,
        "NombreProducto": "Proteína Raptor Hydro Whey Isolate",
        "Marca": "RAPTOR PERFORMANCE",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 5 lbs (2.27 kg) • 71 servicios • Sabor Chocolate Supremo",
        "Descripcion": "Proteína hidrolizada y aislada de alta pureza con 30g de proteína y 6.8g de BCAA por servicio para máxima recuperación muscular.",
        "Precio": 2650.00,
        "Descuento": 15,
        "PrecioAnterior": 3118.00,
        "Stock": 14,
        "ImagenUrl": "/static/image/productos/raptor_whey.svg",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -102,
        "NombreProducto": "Suplemento Power Creatine 100% Micronized",
        "Marca": "POWER LABS",
        "Categoria": "Creatina",
        "Presentacion": "Envase 500g • 100 servicios (5g por toma)",
        "Descripcion": "Creatina monohidratada micronizada de rápida absorción que incrementa la fuerza explosiva, potencia y síntesis de ATP.",
        "Precio": 1150.00,
        "Descuento": 20,
        "PrecioAnterior": 1438.00,
        "Stock": 18,
        "ImagenUrl": "/static/image/productos/power_creatina.svg",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -103,
        "NombreProducto": "Pre-Entreno Power Nitro Pump Extreme",
        "Marca": "POWER SERIES",
        "Categoria": "Preentrenos",
        "Presentacion": "Envase 300g • 30 servicios • Sabor Fruit Punch",
        "Descripcion": "Fórmula pre-entrenamiento con 350mg de cafeína anhidra, 6g de L-Citrulina y Beta-Alanina para bombeo muscular y enfoque extremo.",
        "Precio": 1280.00,
        "Descuento": 12,
        "PrecioAnterior": 1455.00,
        "Stock": 9,
        "ImagenUrl": "/static/image/productos/power_preworkout.svg",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -104,
        "NombreProducto": "Proteína 100% Whey Gold Standard",
        "Marca": "OPTIMUM NUTRITION",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 5 lbs (2.27 kg) • 24g Proteína • Vainilla Ice Cream",
        "Descripcion": "Mezcla premium de aislado y concentrado de suero de leche con 5.5g de BCAAs naturales y 4g de glutamina por porción.",
        "Precio": 2890.00,
        "Descuento": 10,
        "PrecioAnterior": 3211.00,
        "Stock": 11,
        "ImagenUrl": "/static/image/productos/whey_gold.svg",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -105,
        "NombreProducto": "Creatina Monohidratada Grado Farmacéutico",
        "Marca": "PLATINUM SERIES",
        "Categoria": "Creatina",
        "Presentacion": "Envase 300g • 60 servicios • Sin sabor",
        "Descripcion": "Creatina monohidratada 100% pura sin rellenos ni azúcares añadidos, ideal para combinar con tu batido post-entreno.",
        "Precio": 890.00,
        "Descuento": 0,
        "PrecioAnterior": 890.00,
        "Stock": 22,
        "ImagenUrl": "/static/image/productos/creatina_mono.svg",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -106,
        "NombreProducto": "Ganador de Masa Muscular Serious Mass Gainer",
        "Marca": "ANABOLIC LABS",
        "Categoria": "Ganadores de masa",
        "Presentacion": "Bolsa 6 lbs (2.72 kg) • 1,250 kcal • 50g Proteína",
        "Descripcion": "Fórmula hipercalórica enriquecida con carbohidratos complejos, vitaminas, minerales y creatina para etapas de volumen muscular.",
        "Precio": 2150.00,
        "Descuento": 15,
        "PrecioAnterior": 2529.00,
        "Stock": 8,
        "ImagenUrl": "/static/image/productos/mass_gainer.svg",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -107,
        "NombreProducto": "Bebida Energética & Electrolitos Gym Fuel",
        "Marca": "WORLDGYM NUTRITION",
        "Categoria": "Bebidas energéticas",
        "Presentacion": "Lata 500 ml • Zero Azúcar • Sabor Citrus Blast",
        "Descripcion": "Bebida isotónica y energética con vitaminas del complejo B, taurina y electrolitos para hidratación intensa durante el entrenamiento.",
        "Precio": 95.00,
        "Descuento": 0,
        "PrecioAnterior": 95.00,
        "Stock": 45,
        "ImagenUrl": "/static/image/productos/bebida_energetica.svg",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -108,
        "NombreProducto": "Shaker Pro Antiderrames WORLDGYM",
        "Marca": "WORLDGYM GEAR",
        "Categoria": "Accesorios",
        "Presentacion": "700 ml (24 oz) • Incluye esfera mezcladora de acero inoxidable",
        "Descripcion": "Vaso mezclador ergonómico libre de BPA con tapa de rosca hermética y escala medidora en mililitros y onzas.",
        "Precio": 350.00,
        "Descuento": 10,
        "PrecioAnterior": 389.00,
        "Stock": 25,
        "ImagenUrl": "/static/image/productos/shaker_pro.svg",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -109,
        "NombreProducto": "Kit Pro Guantes y Straps de Levantamiento",
        "Marca": "WORLDGYM GEAR",
        "Categoria": "Accesorios",
        "Presentacion": "Par de Guantes con Muñequera + Correas de Agarre Reforzadas",
        "Descripcion": "Protección palmar antideslizante y soporte de muñeca para peso muerto, dominadas y press pesado.",
        "Precio": 680.00,
        "Descuento": 0,
        "PrecioAnterior": 680.00,
        "Stock": 12,
        "ImagenUrl": "/static/image/productos/guantes_pro.svg",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    }
]


def _asegurar_directorio_datos():
    os.makedirs(os.path.dirname(META_JSON_PATH), exist_ok=True)


def _cargar_meta_local():
    _asegurar_directorio_datos()
    if not os.path.exists(META_JSON_PATH):
        return {}
    try:
        with open(META_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f) or {}
    except Exception:
        return {}


def _guardar_meta_local(meta_dict):
    _asegurar_directorio_datos()
    try:
        with open(META_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(meta_dict, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error guardando tienda_meta.json:", e)


def AsegurarTablaTiendaMeta():
    """
    Crea la tabla auxiliar TiendaProductoMeta en SQL Server si no existe.
    No altera las columnas de la tabla Producto para no romper los procedimientos
    almacenados existentes (SpRegistrarProducto, SpActualizarProducto, SpListarProductos).
    """
    conexion = None
    try:
        conexion = ConectarBD()
        if not conexion:
            return False
        cursor = conexion.cursor()
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TiendaProductoMeta')
            BEGIN
                CREATE TABLE TiendaProductoMeta (
                    IdProducto INT PRIMARY KEY,
                    Presentacion NVARCHAR(200) NULL,
                    Descripcion NVARCHAR(600) NULL,
                    ImagenUrl NVARCHAR(MAX) NULL,
                    Descuento INT NOT NULL DEFAULT 0,
                    PrecioAnterior DECIMAL(10,2) NULL,
                    Destacado BIT NOT NULL DEFAULT 0,
                    VisibleTienda BIT NOT NULL DEFAULT 1,
                    EsDemo BIT NOT NULL DEFAULT 0,
                    FechaActualizacion DATETIME NOT NULL DEFAULT GETDATE()
                )
            END
        """)
        conexion.commit()
        return True
    except Exception as e:
        print("Aviso AsegurarTablaTiendaMeta:", e)
        return False
    finally:
        if conexion:
            conexion.close()


def ObtenerMapaMetaProductos():
    """
    Obtiene los metadatos extendidos de tienda para todos los productos,
    combinando SQL Server (TiendaProductoMeta) con el respaldo local JSON.
    """
    mapa = _cargar_meta_local()
    conexion = None
    try:
        AsegurarTablaTiendaMeta()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("""
                SELECT IdProducto, Presentacion, Descripcion, ImagenUrl,
                       Descuento, PrecioAnterior, Destacado, VisibleTienda, EsDemo
                FROM TiendaProductoMeta
            """)
            for row in cursor.fetchall():
                pid = str(row.IdProducto)
                mapa[pid] = {
                    "IdProducto": int(row.IdProducto),
                    "Presentacion": row.Presentacion or "",
                    "Descripcion": row.Descripcion or "",
                    "ImagenUrl": row.ImagenUrl or "",
                    "Descuento": int(row.Descuento or 0),
                    "PrecioAnterior": float(row.PrecioAnterior) if row.PrecioAnterior is not None else None,
                    "Destacado": bool(row.Destacado),
                    "VisibleTienda": True if row.VisibleTienda is None else bool(row.VisibleTienda),
                    "EsDemo": bool(row.EsDemo)
                }
    except Exception as e:
        print("Aviso al leer TiendaProductoMeta:", e)
    finally:
        if conexion:
            conexion.close()
    return mapa


def GuardarMetaProducto(id_producto, presentacion="", descripcion="", imagen_url="",
                        descuento=0, precio_anterior=None, destacado=False,
                        visible_tienda=True, es_demo=False):
    """
    Guarda o actualiza los metadatos de tienda de un producto en SQL Server y respaldo JSON.
    """
    try:
        descuento_val = max(0, min(90, int(float(descuento or 0))))
    except (ValueError, TypeError):
        descuento_val = 0

    try:
        precio_ant_val = float(precio_anterior) if precio_anterior not in (None, "", 0, "0") else None
    except (ValueError, TypeError):
        precio_ant_val = None

    registro = {
        "IdProducto": int(id_producto),
        "Presentacion": (presentacion or "").strip()[:200],
        "Descripcion": (descripcion or "").strip()[:600],
        "ImagenUrl": (imagen_url or "").strip(),
        "Descuento": descuento_val,
        "PrecioAnterior": precio_ant_val,
        "Destacado": bool(destacado),
        "VisibleTienda": bool(visible_tienda),
        "EsDemo": bool(es_demo)
    }

    # Guardar en respaldo local
    mapa_local = _cargar_meta_local()
    mapa_local[str(id_producto)] = registro
    _guardar_meta_local(mapa_local)

    # Guardar en SQL Server
    conexion = None
    try:
        AsegurarTablaTiendaMeta()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("SELECT COUNT(*) FROM TiendaProductoMeta WHERE IdProducto = ?", (int(id_producto),))
            existe = cursor.fetchone()[0] > 0
            if existe:
                cursor.execute("""
                    UPDATE TiendaProductoMeta
                    SET Presentacion = ?,
                        Descripcion = ?,
                        ImagenUrl = ?,
                        Descuento = ?,
                        PrecioAnterior = ?,
                        Destacado = ?,
                        VisibleTienda = ?,
                        EsDemo = ?,
                        FechaActualizacion = GETDATE()
                    WHERE IdProducto = ?
                """, (
                    registro["Presentacion"],
                    registro["Descripcion"],
                    registro["ImagenUrl"],
                    registro["Descuento"],
                    registro["PrecioAnterior"],
                    1 if registro["Destacado"] else 0,
                    1 if registro["VisibleTienda"] else 0,
                    1 if registro["EsDemo"] else 0,
                    int(id_producto)
                ))
            else:
                cursor.execute("""
                    INSERT INTO TiendaProductoMeta
                    (IdProducto, Presentacion, Descripcion, ImagenUrl, Descuento, PrecioAnterior, Destacado, VisibleTienda, EsDemo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    int(id_producto),
                    registro["Presentacion"],
                    registro["Descripcion"],
                    registro["ImagenUrl"],
                    registro["Descuento"],
                    registro["PrecioAnterior"],
                    1 if registro["Destacado"] else 0,
                    1 if registro["VisibleTienda"] else 0,
                    1 if registro["EsDemo"] else 0
                ))
            conexion.commit()
    except Exception as e:
        print("Aviso al guardar en TiendaProductoMeta:", e)
    finally:
        if conexion:
            conexion.close()

    return True


def InferirImagenSuplemento(nombre="", marca="", categoria=""):
    """
    Asigna automáticamente una imagen representativa de suplemento deportivo
    o accesorio de gimnasio según el nombre, marca o categoría del producto.
    Nunca devuelve imágenes de computadoras ni tecnología.
    """
    texto = f"{nombre or ''} {marca or ''} {categoria or ''}".lower()
    if "raptor" in texto or "carnivor" in texto or "beef" in texto:
        return "/static/image/productos/raptor_whey.svg"
    if "power" in texto and ("creatin" in texto or "mono" in texto):
        return "/static/image/productos/power_creatina.svg"
    if "power" in texto or "pre" in texto or "pump" in texto or "nitro" in texto or "óxido" in texto or "oxido" in texto:
        return "/static/image/productos/power_preworkout.svg"
    if "mass" in texto or "ganador" in texto or "gainer" in texto or "volumen" in texto:
        return "/static/image/productos/mass_gainer.svg"
    if "creatin" in texto:
        return "/static/image/productos/creatina_mono.svg"
    if "whey" in texto or "prote" in texto or "iso" in texto:
        return "/static/image/productos/whey_gold.svg"
    if "bebida" in texto or "energ" in texto or "isot" in texto or "agua" in texto or "hidrat" in texto:
        return "/static/image/productos/bebida_energetica.svg"
    if "shaker" in texto or "botella" in texto or "termo" in texto or "vaso" in texto:
        return "/static/image/productos/shaker_pro.svg"
    if "guante" in texto or "strap" in texto or "cintur" in texto or "accesorio" in texto or "faja" in texto:
        return "/static/image/productos/guantes_pro.svg"
    return "/static/image/productos/default_suplemento.svg"


def InferirCategoriaTienda(nombre="", marca="", categoria_original=""):
    """
    Normaliza o clasifica un producto en las categorías principales de la tienda deportiva.
    """
    cat = (categoria_original or "").strip()
    if cat in CATEGORIAS_TIENDA and cat != "Suplementos":
        return cat
    texto = f"{nombre or ''} {marca or ''} {cat}".lower()
    if "prote" in texto or "whey" in texto or "raptor" in texto or "iso" in texto:
        return "Proteínas"
    if "creatin" in texto:
        return "Creatina"
    if "pre" in texto or "pump" in texto or "nitro" in texto or "energía" in texto:
        return "Preentrenos"
    if "mass" in texto or "ganador" in texto or "gainer" in texto:
        return "Ganadores de masa"
    if "bebida" in texto or "energ" in texto or "hidrat" in texto or "electrolit" in texto:
        return "Bebidas energéticas"
    if "shaker" in texto or "botella" in texto or "guante" in texto or "strap" in texto or "accesorio" in texto or "ropa" in texto:
        return "Accesorios"
    return cat if cat else "Suplementos"


def EnriquecerProducto(prod, mapa_meta=None):
    """
    Combina un diccionario de producto de la base de datos con sus metadatos de tienda,
    calculando precios con descuento, indicadores de stock y disponibilidad.
    """
    if mapa_meta is None:
        mapa_meta = ObtenerMapaMetaProductos()

    pid = prod.get("IdProducto")
    meta = mapa_meta.get(str(pid), {})

    nombre = prod.get("NombreProducto") or "Producto Deportivo"
    marca = prod.get("Marca") or "WORLDGYM"
    categoria_bd = prod.get("Categoria") or "Suplementos"
    categoria_tienda = InferirCategoriaTienda(nombre, marca, categoria_bd)

    precio_base = float(prod.get("Precio") or 0.0)
    descuento = int(meta.get("Descuento") if meta.get("Descuento") is not None else prod.get("Descuento", 0) or 0)
    descuento = max(0, min(90, descuento))

    # Precio actual es el Precio de la tabla Producto; si hay descuento activo, calculamos el precio anterior o el precio de oferta
    precio_ant_meta = meta.get("PrecioAnterior") or prod.get("PrecioAnterior")
    if descuento > 0:
        if precio_ant_meta and float(precio_ant_meta) > precio_base:
            precio_anterior = round(float(precio_ant_meta), 2)
            precio_actual = round(precio_base, 2)
        else:
            # Calculamos el precio de referencia antes del descuento para que Precio en BD sea el precio real cobrado en Venta
            precio_actual = round(precio_base, 2)
            precio_anterior = round(precio_base / (1.0 - (descuento / 100.0)), 2)
    else:
        precio_actual = round(precio_base, 2)
        precio_anterior = round(precio_base, 2)

    stock = int(prod.get("Stock") if prod.get("Stock") is not None else 0)
    imagen_url = meta.get("ImagenUrl") or prod.get("ImagenUrl") or InferirImagenSuplemento(nombre, marca, categoria_bd)
    presentacion = meta.get("Presentacion") or prod.get("Presentacion") or "Presentación estándar de gimnasio"
    descripcion = meta.get("Descripcion") or prod.get("Descripcion") or f"{nombre} de la marca {marca}. Suplementación y equipamiento deportivo disponible en WORLDGYM."
    destacado = bool(meta.get("Destacado") if "Destacado" in meta else prod.get("Destacado", descuento > 0))
    visible_tienda = bool(meta.get("VisibleTienda") if "VisibleTienda" in meta else prod.get("VisibleTienda", True))
    es_demo = bool(meta.get("EsDemo") if "EsDemo" in meta else prod.get("EsDemo", False))

    if stock <= 0:
        estado_stock = "Agotado"
        clase_stock = "agotado"
    elif verificar_alerta_stock_minimo(stock, 5):
        estado_stock = f"¡Últimas {stock} uds!"
        clase_stock = "bajo"
    else:
        estado_stock = f"Disponible ({stock} en stock)"
        clase_stock = "disponible"

    return {
        "IdProducto": pid,
        "NombreProducto": nombre,
        "Marca": marca,
        "Categoria": categoria_bd,
        "CategoriaTienda": categoria_tienda,
        "Presentacion": presentacion,
        "Descripcion": descripcion,
        "Precio": precio_actual,
        "PrecioAnterior": precio_anterior,
        "Descuento": descuento,
        "EnOferta": descuento > 0,
        "Stock": stock,
        "Disponible": stock > 0,
        "EstadoStock": estado_stock,
        "ClaseStock": clase_stock,
        "ImagenUrl": imagen_url,
        "Destacado": destacado,
        "VisibleTienda": visible_tienda,
        "EsDemo": es_demo,
        "OrigenDatos": "DEMOSTRACIÓN" if es_demo else "CATÁLOGO OFICIAL",
        "FechaRegistro": prod.get("FechaRegistro", "")
    }


def ObtenerCatalogoTienda(incluir_ocultos=False, incluir_demos=True):
    """
    Obtiene la lista completa de productos para la tienda o el panel administrativo.
    1. Consulta los productos reales registrados en SQL Server (ListarProductos).
    2. Fusiona los metadatos extendidos de TiendaProductoMeta.
    3. Si incluir_demos=True, agrega los productos de demostración que aún no existan
       por nombre en la base de datos, claramente diferenciados con EsDemo=True.
    """
    mapa_meta = ObtenerMapaMetaProductos()
    _, productos_bd = ListarProductos()
    productos_bd = productos_bd or []

    catalogo = []
    nombres_registrados = set()

    for p in productos_bd:
        enriquecido = EnriquecerProducto(p, mapa_meta)
        nombres_registrados.add((enriquecido["NombreProducto"] or "").strip().lower())
        if incluir_ocultos or enriquecido["VisibleTienda"]:
            catalogo.append(enriquecido)

    if incluir_demos:
        for demo in PRODUCTOS_DEMOSTRACION:
            nombre_demo = (demo["NombreProducto"] or "").strip().lower()
            if nombre_demo not in nombres_registrados:
                # Verificar si el admin personalizó la visibilidad de este demo
                enriquecido_demo = EnriquecerProducto(demo, mapa_meta)
                enriquecido_demo["EsDemo"] = True
                enriquecido_demo["OrigenDatos"] = "DEMOSTRACIÓN"
                if incluir_ocultos or enriquecido_demo["VisibleTienda"]:
                    catalogo.append(enriquecido_demo)

    return catalogo


def SincronizarCatalogoBaseEnBD():
    """
    Permite al administrador importar los productos base de suplementos deportivos
    directamente a las tablas Producto e Inventario en SQL Server sin duplicar
    productos existentes, marcándolos con sus imágenes y metadatos.
    """
    _, productos_bd = ListarProductos()
    productos_bd = productos_bd or []
    existentes = {(p.get("NombreProducto") or "").strip().lower() for p in productos_bd}

    insertados = 0
    errores = []

    for item in PRODUCTOS_DEMOSTRACION:
        nombre_norm = item["NombreProducto"].strip().lower()
        if nombre_norm in existentes:
            continue

        ok, res = RegistrarProducto(
            item["NombreProducto"],
            item["Marca"],
            item["Categoria"],
            float(item["Precio"]),
            int(item["Stock"])
        )
        if ok:
            insertados += 1
            existentes.add(nombre_norm)
        else:
            errores.append(str(res))

    # Asociar los metadatos a los productos recién creados
    _, productos_actualizados = ListarProductos()
    for p in (productos_actualizados or []):
        nombre_p = (p.get("NombreProducto") or "").strip().lower()
        for demo in PRODUCTOS_DEMOSTRACION:
            if demo["NombreProducto"].strip().lower() == nombre_p:
                GuardarMetaProducto(
                    id_producto=p["IdProducto"],
                    presentacion=demo["Presentacion"],
                    descripcion=demo["Descripcion"],
                    imagen_url=demo["ImagenUrl"],
                    descuento=demo["Descuento"],
                    precio_anterior=demo["PrecioAnterior"],
                    destacado=demo["Destacado"],
                    visible_tienda=True,
                    es_demo=True
                )
                break

    return insertados, errores


def _guardar_pedido_local(pedido):
    _asegurar_directorio_datos()
    pedidos = []
    if os.path.exists(PEDIDOS_JSON_PATH):
        try:
            with open(PEDIDOS_JSON_PATH, "r", encoding="utf-8") as f:
                pedidos = json.load(f) or []
        except Exception:
            pedidos = []
    pedidos.insert(0, pedido)
    try:
        with open(PEDIDOS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(pedidos[:200], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error guardando tienda_pedidos.json:", e)


def ProcesarPedidoTienda(items_carrito, usuario_sesion=None, notas=""):
    """
    Valida existencias reales en el backend, evita cantidades negativas o sobreventa,
    y registra la compra reutilizando el módulo de Ventas (ProcesarVenta / RegistrarVenta)
    cuando los productos pertenecen al catálogo oficial en SQL Server.
    """
    if not items_carrito or not isinstance(items_carrito, list):
        return False, "El carrito está vacío o el formato de productos no es válido.", None

    catalogo_actual = ObtenerCatalogoTienda(incluir_ocultos=False, incluir_demos=True)
    mapa_catalogo = {int(p["IdProducto"]): p for p in catalogo_actual}

    items_validados_bd = []
    resumen_lineas = []
    subtotal_sin_descuento = 0.0
    total_final = 0.0
    incluye_demos = False

    for linea in items_carrito:
        try:
            id_prod = int(linea.get("IdProducto"))
            cantidad = int(linea.get("Cantidad"))
        except (ValueError, TypeError):
            return False, "Uno de los productos tiene un identificador o cantidad inválida.", None

        if cantidad <= 0:
            return False, "La cantidad de cada producto debe ser mayor a cero.", None

        prod_info = mapa_catalogo.get(id_prod)
        if not prod_info:
            return False, f"El producto con ID #{id_prod} ya no está disponible en la tienda.", None

        # Validar stock mediante la regla de negocio del sistema
        ok_stock, _, msg_stock = calcular_nuevo_stock_salida(int(prod_info["Stock"]), cantidad)
        if not ok_stock:
            return False, f"No hay existencias suficientes para '{prod_info['NombreProducto']}'. {msg_stock}", None

        precio_unit = float(prod_info["Precio"])
        precio_ant_unit = float(prod_info.get("PrecioAnterior") or precio_unit)
        subtotal_linea = round(precio_unit * cantidad, 2)
        subtotal_ant_linea = round(precio_ant_unit * cantidad, 2)

        subtotal_sin_descuento += subtotal_ant_linea
        total_final += subtotal_linea

        if id_prod > 0:
            items_validados_bd.append({
                "IdProducto": id_prod,
                "Cantidad": cantidad
            })
        else:
            incluye_demos = True

        resumen_lineas.append({
            "IdProducto": id_prod,
            "NombreProducto": prod_info["NombreProducto"],
            "Marca": prod_info["Marca"],
            "Presentacion": prod_info["Presentacion"],
            "Cantidad": cantidad,
            "PrecioUnitario": precio_unit,
            "Subtotal": subtotal_linea,
            "EsDemo": prod_info["EsDemo"]
        })

    # Determinar IdCliente para registrar en el módulo de Ventas de SQL Server
    id_cliente = None
    if usuario_sesion:
        id_cliente = usuario_sesion.get("cliente_id")

    if not id_cliente and items_validados_bd:
        # Buscar un cliente asociado o el primer cliente activo para asociar la venta en mostrador/tienda
        _, clientes = ListarClientes()
        if clientes and len(clientes) > 0:
            nombre_usr = (usuario_sesion.get("usuario_nombre") or "").lower() if usuario_sesion else ""
            cliente_match = next(
                (c for c in clientes if nombre_usr and nombre_usr in str(c.get("NombreCompleto", "")).lower()),
                clientes[0]
            )
            id_cliente = cliente_match.get("IdCliente")

    venta_registrada_bd = False
    mensaje_bd = ""

    if items_validados_bd and id_cliente:
        if len(items_validados_bd) == 1:
            unico = items_validados_bd[0]
            ok_venta, res_venta = RegistrarVenta(int(id_cliente), int(unico["IdProducto"]), int(unico["Cantidad"]))
        else:
            ok_venta, res_venta = ProcesarVenta(int(id_cliente), items_validados_bd)

        if not ok_venta:
            return False, f"No se pudo procesar la venta en inventario: {res_venta}", None
        venta_registrada_bd = True
        mensaje_bd = str(res_venta)

    folio = f"WG-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    comprobante = {
        "Folio": folio,
        "Fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "Cliente": (usuario_sesion.get("usuario_nombre") if usuario_sesion else None) or "Cliente WORLDGYM",
        "IdCliente": id_cliente,
        "Items": resumen_lineas,
        "SubtotalOriginal": round(subtotal_sin_descuento, 2),
        "AhorroDescuento": round(max(0.0, subtotal_sin_descuento - total_final), 2),
        "Total": round(total_final, 2),
        "VentaRegistradaBD": venta_registrada_bd,
        "IncluyeDemos": incluye_demos,
        "Notas": (notas or "").strip()[:300]
    }

    _guardar_pedido_local(comprobante)

    if venta_registrada_bd:
        msg_exito = f"¡Compra confirmada! Folio {folio}. Se actualizó el inventario y se registró en el módulo de Ventas."
    else:
        msg_exito = f"¡Pedido de demostración generado! Folio {folio}. (Los artículos de demostración no descuentan inventario real hasta ser importados al catálogo oficial)."

    return True, msg_exito, comprobante
