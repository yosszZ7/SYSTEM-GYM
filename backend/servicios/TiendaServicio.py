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

# Catálogo de imágenes reales de estudio de suplementos y productos deportivos (sin imágenes de computadoras/tecnología)
IMAGENES_SUPLEMENTOS = [
    {"id": "real_beef_xp", "nombre": "Proteína Raptor / Beef-XP Clear Isolate (3.96 lb)", "url": "/static/image/productos/real_beef_xp.avif"},
    {"id": "real_beef_citrus", "nombre": "Proteína Raptor / Beef-XP Citrus Twist (3.96 lb)", "url": "/static/image/productos/real_beef_citrus.avif"},
    {"id": "real_iso_whey", "nombre": "Hydrolyzed Whey Protein Isolate (2.11 lb)", "url": "/static/image/productos/real_iso_whey.webp"},
    {"id": "real_whey_gold", "nombre": "Proteína 100% Whey Gold Standard (5 lbs)", "url": "/static/image/productos/real_whey_gold.webp"},
    {"id": "real_raptor_whey", "nombre": "Proteína Critical Whey Advanced (4.4 lbs)", "url": "/static/image/productos/real_raptor_whey.webp"},
    {"id": "real_rule1_whey", "nombre": "Proteína Rule 1 Whey Isolate (5 lbs)", "url": "/static/image/productos/real_rule1_whey.webp"},
    {"id": "real_power_creatina", "nombre": "Suplemento Power / Applied Creatine Monohydrate (500g)", "url": "/static/image/productos/real_power_creatina.webp"},
    {"id": "real_creatina_mono", "nombre": "Creatina Monohidratada Platinum 100% (450g)", "url": "/static/image/productos/real_creatina_mono.png"},
    {"id": "real_power_preworkout", "nombre": "Pre-Entreno Power Roar Fruit Punch (30 serv)", "url": "/static/image/productos/real_power_preworkout.webp"},
    {"id": "real_nitraflex_pre", "nombre": "Pre-Entreno Nitraflex Ultra High Intensity (30 serv)", "url": "/static/image/productos/real_nitraflex_pre.webp"},
    {"id": "real_mass_gainer", "nombre": "Ganador de Masa Muscular Mass Gainer (5.73 lbs)", "url": "/static/image/productos/real_mass_gainer.webp"},
    {"id": "real_bebida_energetica", "nombre": "Bebida Energética Sparkling Citrus (355 ml)", "url": "/static/image/productos/real_bebida_energetica.webp"},
    {"id": "real_protein_water", "nombre": "Bebida Proteica Sparkling Protein Water (330 ml)", "url": "/static/image/productos/real_protein_water.webp"},
    {"id": "real_accesorio_gym", "nombre": "Accesorio Deportivo / Magnesio y Agarre Gym", "url": "/static/image/productos/real_accesorio_gym.webp"},
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

# Productos de demostración con fotografías reales de estudio de suplementos deportivos
PRODUCTOS_DEMOSTRACION = [
    {
        "IdProducto": -101,
        "NombreProducto": "Proteína Raptor Beef-XP Clear Isolate Cherry & Apple",
        "Marca": "RAPTOR • APPLIED NUTRITION",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 3.96 lbs (1.8 kg) • 60 servicios • 27g Proteína",
        "Descripcion": "Proteína aislada hidrolizada libre de lactosa y azúcar con 27g de proteína pura por servicio para máxima definición y fuerza muscular.",
        "Precio": 2650.00,
        "Descuento": 15,
        "PrecioAnterior": 3118.00,
        "Stock": 14,
        "ImagenUrl": "/static/image/productos/real_beef_xp.avif",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -102,
        "NombreProducto": "Proteína Raptor Beef-XP Clear Isolate Citrus Twist",
        "Marca": "RAPTOR • APPLIED NUTRITION",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 3.96 lbs (1.8 kg) • 60 servicios • Sabor Citrus Twist",
        "Descripcion": "Aislado de proteína de absorción ultrarrápida con aminoácidos esenciales para recuperación muscular post-entrenamiento.",
        "Precio": 2650.00,
        "Descuento": 12,
        "PrecioAnterior": 3011.00,
        "Stock": 9,
        "ImagenUrl": "/static/image/productos/real_beef_citrus.avif",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -103,
        "NombreProducto": "Hydrolyzed Whey Protein Isolate Caramel",
        "Marca": "SASCHA FITNESS",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 2.11 lbs • 29 servicios • 25g Proteína • 0g Azúcar",
        "Descripcion": "Proteína de suero hidrolizada y aislada con enzimas digestivas, cero grasa y cero carbohidratos.",
        "Precio": 2950.00,
        "Descuento": 10,
        "PrecioAnterior": 3278.00,
        "Stock": 11,
        "ImagenUrl": "/static/image/productos/real_iso_whey.webp",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -104,
        "NombreProducto": "Proteína Gold Standard 100% Whey Double Rich Chocolate",
        "Marca": "OPTIMUM NUTRITION",
        "Categoria": "Proteínas",
        "Presentacion": "Bote 5 lbs (2.27 kg) • 71 servicios • 24g Proteína + 5.5g BCAA",
        "Descripcion": "Mezcla premium de aislado y concentrado de proteína de suero de leche para desarrollo y mantenimiento de masa muscular magra.",
        "Precio": 3180.00,
        "Descuento": 10,
        "PrecioAnterior": 3533.00,
        "Stock": 15,
        "ImagenUrl": "/static/image/productos/real_whey_gold.webp",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -105,
        "NombreProducto": "Suplemento Power Creatine Monohydrate Micronized",
        "Marca": "POWER • APPLIED NUTRITION",
        "Categoria": "Creatina",
        "Presentacion": "Envase 250g • 50 servicios (5g por toma) • Micronizada",
        "Descripcion": "Creatina monohidratada pura micronizada que incrementa la fuerza explosiva, la potencia en series pesadas y la regeneración de ATP.",
        "Precio": 1150.00,
        "Descuento": 20,
        "PrecioAnterior": 1438.00,
        "Stock": 18,
        "ImagenUrl": "/static/image/productos/real_power_creatina.webp",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -106,
        "NombreProducto": "Platinum 100% Creatine Monohidratada Ultra Pura",
        "Marca": "MUSCLETECH",
        "Categoria": "Creatina",
        "Presentacion": "Envase 450g • 90 servicios • 5g Creatina HPLC Certificada",
        "Descripcion": "Creatina monohidratada de grado clínico probada por HPLC para aumentar el volumen celular y la fuerza muscular.",
        "Precio": 1390.00,
        "Descuento": 0,
        "PrecioAnterior": 1390.00,
        "Stock": 22,
        "ImagenUrl": "/static/image/productos/real_creatina_mono.png",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -107,
        "NombreProducto": "Pre-Entreno Power Roar High Intensity Fruit Punch",
        "Marca": "POWER • RULE 1",
        "Categoria": "Preentrenos",
        "Presentacion": "Envase 315g • 30 servicios • Energía y Bombeo Extremo",
        "Descripcion": "Fórmula pre-entrenamiento con L-Citrulina, Beta-Alanina y cafeína para máxima energía, enfoque mental y vascularidad.",
        "Precio": 1450.00,
        "Descuento": 15,
        "PrecioAnterior": 1705.00,
        "Stock": 10,
        "ImagenUrl": "/static/image/productos/real_power_preworkout.webp",
        "Destacado": True,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -108,
        "NombreProducto": "Pre-Entreno Nitraflex Ultra Strawberry Watermelon",
        "Marca": "GAT SPORT",
        "Categoria": "Preentrenos",
        "Presentacion": "Envase 609g • 30 servicios • Fórmula Hiperémica",
        "Descripcion": "Pre-entreno de alta intensidad diseñado para entrenamientos de fuerza pesada y congestión muscular prolongada.",
        "Precio": 1580.00,
        "Descuento": 0,
        "PrecioAnterior": 1580.00,
        "Stock": 8,
        "ImagenUrl": "/static/image/productos/real_nitraflex_pre.webp",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -109,
        "NombreProducto": "Ganador de Masa Muscular Mass Gainer Chocolate Fudge",
        "Marca": "RULE 1 PROTEINS",
        "Categoria": "Ganadores de masa",
        "Presentacion": "Bote 5.73 lbs (2.6 kg) • 1,000+ kcal • 40g Proteína",
        "Descripcion": "Ganador de peso hipercalórico con carbohidratos complejos, creatina y triglicéridos de cadena media para etapas de volumen.",
        "Precio": 2350.00,
        "Descuento": 12,
        "PrecioAnterior": 2670.00,
        "Stock": 7,
        "ImagenUrl": "/static/image/productos/real_mass_gainer.webp",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -110,
        "NombreProducto": "Bebida Energética Sparkling Energy Juicy Orange",
        "Marca": "BLOOM NUTRITION",
        "Categoria": "Bebidas energéticas",
        "Presentacion": "Lata 355 ml • 180mg Cafeína Natural • Zero Azúcar",
        "Descripcion": "Bebida energética refrescante sin azúcar para activar tu metabolismo y concentración antes de entrenar.",
        "Precio": 120.00,
        "Descuento": 0,
        "PrecioAnterior": 120.00,
        "Stock": 36,
        "ImagenUrl": "/static/image/productos/real_bebida_energetica.webp",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -111,
        "NombreProducto": "Sparkling Protein Water Tropical Burst",
        "Marca": "APPLIED NUTRITION",
        "Categoria": "Bebidas energéticas",
        "Presentacion": "Lata 330 ml • 10g Proteína + Electrolitos • Sin Azúcar",
        "Descripcion": "Agua gasificada proteica enriquecida con vitamina C y electrolitos para hidratación y recuperación inmediata.",
        "Precio": 145.00,
        "Descuento": 10,
        "PrecioAnterior": 161.00,
        "Stock": 28,
        "ImagenUrl": "/static/image/productos/real_protein_water.webp",
        "Destacado": False,
        "VisibleTienda": True,
        "EsDemo": True,
        "OrigenDatos": "DEMOSTRACIÓN"
    },
    {
        "IdProducto": -112,
        "NombreProducto": "Bloque de Magnesio Deportivo Gym Chalk Pro Grip",
        "Marca": "WORLDGYM GEAR",
        "Categoria": "Accesorios",
        "Presentacion": "Bloque 2 oz (56g) Carbonato de Magnesio para Levantamiento",
        "Descripcion": "Magnesio deportivo de alta adherencia que absorbe el sudor y mejora el agarre en peso muerto, dominadas y halterofilia.",
        "Precio": 220.00,
        "Descuento": 0,
        "PrecioAnterior": 220.00,
        "Stock": 20,
        "ImagenUrl": "/static/image/productos/real_accesorio_gym.webp",
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
    Asigna automáticamente una fotografía real de estudio de suplemento deportivo
    o accesorio de gimnasio según el nombre, marca o categoría del producto.
    Nunca devuelve imágenes de computadoras ni tecnología.
    """
    texto = f"{nombre or ''} {marca or ''} {categoria or ''}".lower()
    if "raptor" in texto or "carnivor" in texto or "beef" in texto:
        return "/static/image/productos/real_beef_xp.avif"
    if "power" in texto and ("creatin" in texto or "mono" in texto):
        return "/static/image/productos/real_power_creatina.webp"
    if "power" in texto or "pre" in texto or "pump" in texto or "nitro" in texto or "roar" in texto:
        return "/static/image/productos/real_power_preworkout.webp"
    if "mass" in texto or "ganador" in texto or "gainer" in texto or "volumen" in texto:
        return "/static/image/productos/real_mass_gainer.webp"
    if "creatin" in texto:
        return "/static/image/productos/real_creatina_mono.png"
    if "iso" in texto or "sascha" in texto:
        return "/static/image/productos/real_iso_whey.webp"
    if "whey" in texto or "prote" in texto:
        return "/static/image/productos/real_whey_gold.webp"
    if "bebida" in texto or "energ" in texto or "isot" in texto or "agua" in texto or "hidrat" in texto:
        return "/static/image/productos/real_bebida_energetica.webp"
    if "shaker" in texto or "botella" in texto or "guante" in texto or "strap" in texto or "accesorio" in texto or "magnesio" in texto:
        return "/static/image/productos/real_accesorio_gym.webp"
    return "/static/image/productos/real_whey_gold.webp"


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
    mapa_upgrade_svg = {
        "/static/image/productos/raptor_whey.svg": "/static/image/productos/real_beef_xp.avif",
        "/static/image/productos/power_creatina.svg": "/static/image/productos/real_power_creatina.webp",
        "/static/image/productos/power_preworkout.svg": "/static/image/productos/real_power_preworkout.webp",
        "/static/image/productos/whey_gold.svg": "/static/image/productos/real_whey_gold.webp",
        "/static/image/productos/creatina_mono.svg": "/static/image/productos/real_creatina_mono.png",
        "/static/image/productos/mass_gainer.svg": "/static/image/productos/real_mass_gainer.webp",
        "/static/image/productos/bebida_energetica.svg": "/static/image/productos/real_bebida_energetica.webp",
        "/static/image/productos/shaker_pro.svg": "/static/image/productos/real_protein_water.webp",
        "/static/image/productos/guantes_pro.svg": "/static/image/productos/real_accesorio_gym.webp",
        "/static/image/productos/default_suplemento.svg": "/static/image/productos/real_whey_gold.webp",
    }
    if imagen_url in mapa_upgrade_svg:
        imagen_url = mapa_upgrade_svg[imagen_url]
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
