import os
import re
import json
import unicodedata
from datetime import datetime, timedelta
from ConexionBD import ConectarBD
from backend.servicios.ListaDeProductos import ListarProductos
from backend.servicios.RegistrarProducto import RegistrarProducto
from backend.servicios.ActualizarProducto import ActualizarProducto
from backend.servicios.ProcesarVenta import ProcesarVenta
from backend.servicios.RegistrarVenta import RegistrarVenta
from backend.servicios.ListaDeClientes import ListarClientes
from backend.servicios.ReporteVentasPorProducto import ReporteVentasPorProducto
from backend.servicios.ReporteMembresiasActivas import ReporteMembresiasActivas
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
    {"id": "real_protein_water", "nombre": "Bebida Hidratante / Agua Deportiva (330 ml)", "url": "/static/image/productos/real_protein_water.webp"},
    {"id": "cat_aminoacidos", "nombre": "Aminoácidos BCAA y Glutamina", "url": "/static/image/productos/cat_aminoacidos.png"},
    {"id": "cat_vitaminas", "nombre": "Multivitamínicos y Omega 3 Deportivo", "url": "/static/image/productos/cat_vitaminas.png"},
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

# Las 6 categorías visuales oficiales de la tienda de suplementos
CATEGORIAS_VISUALES_CONFIG = [
    {"clave": "Proteínas", "nombre": "Proteínas", "imagen": "/static/image/productos/cat_proteinas.png"},
    {"clave": "Creatina", "nombre": "Creatinas", "imagen": "/static/image/productos/cat_creatinas.png"},
    {"clave": "Preentrenos", "nombre": "Pre-entrenos", "imagen": "/static/image/productos/cat_preentreno.png"},
    {"clave": "Ganadores de masa", "nombre": "Mass Gainer", "imagen": "/static/image/productos/cat_massgainer.png"},
    {"clave": "Bebidas energéticas", "nombre": "Bebidas y energía", "imagen": "/static/image/productos/cat_aminoacidos.png"},
    {"clave": "Accesorios", "nombre": "Accesorios", "imagen": "/static/image/productos/cat_accesorios.webp"},
]

PLACEHOLDER_PRESENTACION_ANTIGUO = "presentación estándar de gimnasio"

# Productos base disponibles para importación administrativa cuando se requiera poblar una BD vacía
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


def _sin_acentos(texto):
    if not texto:
        return ""
    normalizado = unicodedata.normalize("NFD", str(texto))
    return "".join(c for c in normalizado if unicodedata.category(c) != "Mn").lower().strip()


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

    mapa_local = _cargar_meta_local()
    mapa_local[str(id_producto)] = registro
    _guardar_meta_local(mapa_local)

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


def InferirCategoriaTienda(nombre="", marca="", categoria_original=""):
    """
    Clasifica cada producto con precisión dentro de las categorías de la tienda,
    evitando falsos positivos (ej: 'Isotónica' -> Bebidas, nunca Proteínas;
    'Powerade' -> Bebidas, nunca Preentrenos; 'Bebida Raptor' -> Bebidas).
    """
    cat_raw = (categoria_original or "").strip()
    cat_norm = _sin_acentos(cat_raw)
    nombre_norm = _sin_acentos(nombre)
    marca_norm = _sin_acentos(marca)
    texto_prod = f"{nombre_norm} {marca_norm}".strip()

    # 1. Respetar categorías explícitas de tienda cuando no sean genéricas
    mapa_exacto = {
        "proteinas": "Proteínas",
        "creatina": "Creatina",
        "creatinas": "Creatina",
        "preentrenos": "Preentrenos",
        "pre-entrenos": "Preentrenos",
        "pre entreno": "Preentrenos",
        "ganadores de masa": "Ganadores de masa",
        "mass gainer": "Ganadores de masa",
        "bebidas energeticas": "Bebidas energéticas",
        "accesorios": "Accesorios",
        "ropa": "Accesorios",
        "equipos": "Accesorios",
    }
    if cat_norm in mapa_exacto:
        return mapa_exacto[cat_norm]

    # 2. Bebidas embotelladas, hidratantes, isotónicas, aguas y energizantes (antes de evaluar marcas)
    if cat_norm in ("bebidas", "hidratacion"):
        return "Bebidas energéticas"
    if any(k in nombre_norm for k in (
        "agua ", "agua purificada", "bebida", "energizante", "energetica",
        "isotonica", "isotonico", "rehidratante", "electrolit", "suero rehidratante"
    )):
        return "Bebidas energéticas"

    # 3. Ganadores de masa muscular (Mass Gainer)
    if any(k in texto_prod for k in ("mass gainer", "ganador", "gainer", "hipercalorico")):
        return "Ganadores de masa"

    # 4. Creatinas
    if "creatin" in texto_prod:
        return "Creatina"

    # 5. Pre-entrenos (coincidencias exactas sin falso positivo con 'presentacion' o 'powerade')
    if re.search(r"\b(pre[\s\-]?entreno|pre[\s\-]?workout|c4|nitraflex|roar|pump)\b", texto_prod):
        return "Preentrenos"

    # 6. Proteínas (coincidencias exactas sin falso positivo con 'isotonica')
    if re.search(r"\b(proteina|proteinas|protein|whey|isolat\w*|isopure|casein\w*|carnivor|beef[\s\-]?xp)\b", texto_prod):
        return "Proteínas"

    # 7. Accesorios deportivos
    if any(k in texto_prod for k in (
        "shaker", "mezclador", "botella deportiva", "guante", "strap",
        "cinturon", "venda", "magnesio", "chalk", "toalla", "accesorio", "mochila"
    )):
        return "Accesorios"

    # 8. Otros suplementos registrados (BCAA, Glutamina, Multivitamínicos, Omega 3, etc.)
    return "Suplementos"


def EtiquetaCategoriaTienda(categoria_tienda):
    """
    Devuelve la etiqueta legible oficial para mostrar en tarjetas y filtros.
    """
    mapa = {
        "Proteínas": "Proteínas",
        "Creatina": "Creatinas",
        "Preentrenos": "Pre-entrenos",
        "Ganadores de masa": "Mass Gainer",
        "Bebidas energéticas": "Bebidas y energía",
        "Accesorios": "Accesorios",
        "Suplementos": "Aminoácidos y vitaminas",
    }
    return mapa.get(categoria_tienda, categoria_tienda or "Suplementos")


def InferirImagenSuplemento(nombre="", marca="", categoria=""):
    """
    Asigna una fotografía de estudio acorde al tipo real de producto,
    respetando primero la categoría funcional para evitar imágenes cruzadas.
    """
    cat_tienda = InferirCategoriaTienda(nombre, marca, categoria)
    nombre_norm = _sin_acentos(nombre)
    marca_norm = _sin_acentos(marca)
    texto = f"{nombre_norm} {marca_norm}".strip()

    if cat_tienda == "Bebidas energéticas":
        if any(k in texto for k in ("energizante", "energetica", "red bull", "monster", "raptor", "sparkling energy")):
            return "/static/image/productos/real_bebida_energetica.webp"
        return "/static/image/productos/real_protein_water.webp"

    if cat_tienda == "Ganadores de masa":
        return "/static/image/productos/real_mass_gainer.webp"

    if cat_tienda == "Creatina":
        if "muscletech" in texto or "platinum" in texto or "300g" in texto:
            return "/static/image/productos/real_creatina_mono.png"
        return "/static/image/productos/real_power_creatina.webp"

    if cat_tienda == "Preentrenos":
        if "scoop" in nombre_norm or "nitraflex" in texto or "gat" in texto:
            return "/static/image/productos/real_nitraflex_pre.webp"
        return "/static/image/productos/real_power_preworkout.webp"

    if cat_tienda == "Proteínas":
        if "beef" in texto or ("raptor" in texto and "citrus" in texto):
            return "/static/image/productos/real_beef_citrus.avif"
        if "beef" in texto or "raptor" in texto or "carnivor" in texto:
            return "/static/image/productos/real_beef_xp.avif"
        if "isolat" in texto or "isopure" in texto or "sascha" in texto:
            return "/static/image/productos/real_iso_whey.webp"
        if "barra" in nombre_norm or "rule" in texto:
            return "/static/image/productos/real_rule1_whey.webp"
        if "scoop" in nombre_norm:
            return "/static/image/productos/real_raptor_whey.webp"
        return "/static/image/productos/real_whey_gold.webp"

    if cat_tienda == "Accesorios":
        return "/static/image/productos/real_accesorio_gym.webp"

    # Otros suplementos: distinguir aminoácidos/glutamina vs vitaminas/omega
    if any(k in texto for k in ("amino", "bcaa", "glutamin")):
        return "/static/image/productos/cat_aminoacidos.png"
    if any(k in texto for k in ("multivitam", "vitamin", "omega", "fish oil", "caps")):
        return "/static/image/productos/cat_vitaminas.png"

    return "/static/image/productos/real_whey_gold.webp"


def _extraer_presentacion_y_tamano(nombre="", categoria_bd="", categoria_tienda="", presentacion_meta=""):
    """
    Extrae el tamaño/contenido y formato únicamente a partir de los datos reales
    registrados en el nombre o metadatos del producto, sin inventar valores.
    """
    pres_limpia = (presentacion_meta or "").strip()
    if pres_limpia and _sin_acentos(pres_limpia) == _sin_acentos(PLACEHOLDER_PRESENTACION_ANTIGUO):
        pres_limpia = ""

    fuente = f"{nombre or ''} {pres_limpia}".strip()

    # Extraer tamaño o contenido registrado (ej: 1 Litro, 600ml, 300g, 5lbs, 30 serv, 60 caps, 1 servicio)
    patrones_tamano = [
        (r"\b(\d+(?:[\.,]\d+)?)\s*(litros?|l)\b", lambda m: f"{m.group(1)} {'Litro' if m.group(1) == '1' else 'Litros'}"),
        (r"\b(\d+(?:[\.,]\d+)?)\s*ml\b", lambda m: f"{m.group(1)} ml"),
        (r"\b(\d+(?:[\.,]\d+)?)\s*(lbs?|libras?)\b", lambda m: f"{m.group(1)} {'lb' if m.group(1) == '1' else 'lbs'}"),
        (r"\b(\d+(?:[\.,]\d+)?)\s*kg\b", lambda m: f"{m.group(1)} kg"),
        (r"\b(\d+(?:[\.,]\d+)?)\s*(g|gr|gramos?)\b", lambda m: f"{m.group(1)} g"),
        (r"\b(\d+(?:[\.,]\d+)?)\s*oz\b", lambda m: f"{m.group(1)} oz"),
        (r"\b(\d+)\s*(serv|servicios?)\b", lambda m: f"{m.group(1)} {'servicio' if m.group(1) == '1' else 'servicios'}"),
        (r"\b(\d+)\s*(caps|capsulas|cápsulas)\b", lambda m: f"{m.group(1)} cápsulas"),
    ]

    hallazgos_tamano = []
    for regex, formateador in patrones_tamano:
        match = re.search(regex, fuente, flags=re.IGNORECASE)
        if match:
            valor_fmt = formateador(match)
            if valor_fmt not in hallazgos_tamano:
                hallazgos_tamano.append(valor_fmt)

    contenido_tamano = " • ".join(hallazgos_tamano[:2]) if hallazgos_tamano else ""

    # Extraer sabor o formato registrado en el nombre
    nombre_norm = _sin_acentos(nombre)
    detalles_formato = []

    match_sabor = re.search(r"\bsabor\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)", nombre or "", flags=re.IGNORECASE)
    if match_sabor:
        sabor_txt = match_sabor.group(1).strip()
        # Evitar capturar el tamaño si viene pegado al sabor (ej: 'Sabor Coco 625ml')
        sabor_txt = re.sub(r"\b\d+.*$", "", sabor_txt).strip()
        if sabor_txt:
            detalles_formato.append(f"Sabor {sabor_txt.title()}")

    if "en polvo" in nombre_norm:
        detalles_formato.append("En polvo")
    elif "barra" in nombre_norm:
        detalles_formato.append("Barra proteica")
    elif "scoop" in nombre_norm:
        detalles_formato.append("Porción individual")
    elif "caps" in nombre_norm or "capsula" in nombre_norm:
        detalles_formato.append("Cápsulas")
    elif "zero carbs" in nombre_norm:
        detalles_formato.append("Zero Carbs")
    elif "monohidratada" in nombre_norm:
        detalles_formato.append("Monohidratada")
    elif "isotonica" in nombre_norm:
        detalles_formato.append("Bebida isotónica")
    elif "rehidratante" in nombre_norm:
        detalles_formato.append("Hidratación con electrolitos")
    elif "energizante" in nombre_norm:
        detalles_formato.append("Bebida energizante")
    elif "purificada" in nombre_norm:
        detalles_formato.append("Agua embotellada")

    if pres_limpia:
        presentacion_final = pres_limpia
    else:
        partes = [
            p for p in detalles_formato
            if not (contenido_tamano and _sin_acentos(p) in _sin_acentos(contenido_tamano))
        ]
        if contenido_tamano and all(
            _sin_acentos(contenido_tamano) not in _sin_acentos(p)
            for p in partes
        ):
            partes.append(contenido_tamano)
        if not partes:
            partes.append("Envase estándar")
        presentacion_final = " • ".join(partes)

    return presentacion_final, contenido_tamano


def _parsear_fecha_registro(valor_fecha):
    """
    Convierte FechaRegistro (datetime o cadena DD/MM/YYYY o YYYY-MM-DD) a ISO YYYY-MM-DD.
    """
    if not valor_fecha:
        return ""
    if isinstance(valor_fecha, datetime):
        return valor_fecha.strftime("%Y-%m-%d")
    txt = str(valor_fecha).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y"):
        try:
            return datetime.strptime(txt[:19], fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return ""


def _extraer_familia_variante(nombre="", marca=""):
    """
    Identifica la familia base de un producto removiendo sufijos de tamaño o sabor
    para agrupar presentaciones legítimas de la misma marca (ej: Agua Purificada 600ml / 1 Litro,
    Suero Rehidratante Sabor Fresa 625ml / Sabor Coco 625ml).
    """
    base = str(nombre or "").strip()
    # Remover sabor explícito y medidas registradas
    base = re.sub(r"\bsabor\s+[a-záéíóúñ]+", "", base, flags=re.IGNORECASE)
    base = re.sub(
        r"\b\d+(?:[\.,]\d+)?\s*(litros?|l|ml|lbs?|libras?|kg|g|gr|oz|serv|servicios?|caps|cápsulas|capsulas)\b",
        "",
        base,
        flags=re.IGNORECASE,
    )
    base = re.sub(r"\(\s*\)", "", base)
    base_norm = re.sub(r"\s+", " ", _sin_acentos(base)).strip(" -•")
    marca_norm = re.sub(r"\s+", " ", _sin_acentos(marca)).strip()
    if not base_norm:
        base_norm = _sin_acentos(nombre)
    return f"{marca_norm}::{base_norm}", re.sub(r"\s+", " ", base).strip(" -•")


def _etiqueta_corta_variante(nombre="", contenido_tamano=""):
    """
    Genera la etiqueta compacta que diferencia cada variante (ej: '600 ml', '1 Litro', 'Sabor Coco • 625 ml').
    """
    match_sabor = re.search(r"\bsabor\s+([a-záéíóúñ]+)", nombre or "", flags=re.IGNORECASE)
    partes = []
    if match_sabor:
        partes.append(f"Sabor {match_sabor.group(1).strip().title()}")
    if contenido_tamano:
        partes.append(contenido_tamano)
    if partes:
        return " • ".join(partes)
    return (nombre or "").strip()


def ObtenerMapaVentasProductos():
    """
    Obtiene las unidades reales vendidas por IdProducto desde SpReporteVentasPorProducto.
    """
    mapa_ventas = {}
    try:
        ok, registros = ReporteVentasPorProducto()
        if ok and isinstance(registros, list):
            for r in registros:
                pid = r.get("IdProducto")
                if pid is not None:
                    mapa_ventas[int(pid)] = int(r.get("TotalVendido") or 0)
    except Exception as e:
        print("Aviso al consultar ventas por producto:", e)
    return mapa_ventas


def EnriquecerProducto(prod, mapa_meta=None, unidades_vendidas=0):
    """
    Combina un diccionario de producto de la base de datos con sus metadatos de tienda,
    calculando precios con descuento real, indicadores de stock, disponibilidad y presentación.
    """
    if mapa_meta is None:
        mapa_meta = ObtenerMapaMetaProductos()

    pid = prod.get("IdProducto")
    meta = mapa_meta.get(str(pid), {})

    nombre = (prod.get("NombreProducto") or "Producto Deportivo").strip()
    marca = (prod.get("Marca") or "WORLDGYM").strip()
    categoria_bd = (prod.get("Categoria") or "Suplementos").strip()
    categoria_tienda = InferirCategoriaTienda(nombre, marca, categoria_bd)
    categoria_etiqueta = EtiquetaCategoriaTienda(categoria_tienda)

    precio_base = float(prod.get("Precio") or 0.0)
    descuento = int(meta.get("Descuento") if meta.get("Descuento") is not None else prod.get("Descuento", 0) or 0)
    descuento = max(0, min(90, descuento))

    precio_ant_meta = meta.get("PrecioAnterior") or prod.get("PrecioAnterior")
    if descuento > 0:
        if precio_ant_meta and float(precio_ant_meta) > precio_base:
            precio_anterior = round(float(precio_ant_meta), 2)
            precio_actual = round(precio_base, 2)
        else:
            precio_actual = round(precio_base, 2)
            precio_anterior = round(precio_base / (1.0 - (descuento / 100.0)), 2)
    else:
        precio_actual = round(precio_base, 2)
        precio_anterior = None

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

    presentacion_raw = meta.get("Presentacion") or prod.get("Presentacion") or ""
    presentacion, contenido_tamano = _extraer_presentacion_y_tamano(
        nombre=nombre,
        categoria_bd=categoria_bd,
        categoria_tienda=categoria_tienda,
        presentacion_meta=presentacion_raw
    )

    desc_meta = (meta.get("Descripcion") or prod.get("Descripcion") or "").strip()
    desc_generica_antigua = f"{nombre} de la marca {marca}. Suplementación y equipamiento deportivo disponible en WORLDGYM."
    if desc_meta and _sin_acentos(desc_meta) != _sin_acentos(desc_generica_antigua):
        descripcion = desc_meta
    else:
        detalle_tam = f" en presentación de {contenido_tamano}" if contenido_tamano else ""
        descripcion = (
            f"{nombre}{detalle_tam}, marca {marca}. "
            f"Registrado en la línea de {categoria_etiqueta.lower()} del inventario oficial de WORLDGYM."
        )

    destacado_admin = bool(meta.get("Destacado") if "Destacado" in meta else prod.get("Destacado", False))
    visible_tienda = bool(meta.get("VisibleTienda") if "VisibleTienda" in meta else prod.get("VisibleTienda", True))
    es_demo = bool(meta.get("EsDemo") if "EsDemo" in meta else prod.get("EsDemo", False))

    # Estado real del producto (Activo vs Inactivo/Descontinuado)
    estado_raw = str(prod.get("Estado") or "").strip().lower()
    inactivo_bd = estado_raw in ("0", "false", "inactivo", "descontinuado")
    activo_catalogo = visible_tienda and not inactivo_bd

    if not activo_catalogo:
        estado_producto = "Descontinuado" if estado_raw == "descontinuado" else "Inactivo"
        estado_disponibilidad = "Inactivo"
        estado_stock = f"{estado_producto} (No visible en tienda)"
        clase_stock = "agotado"
    elif stock <= 0:
        estado_producto = "Activo"
        estado_disponibilidad = "Agotado"
        estado_stock = "Agotado (0 disponibles)"
        clase_stock = "agotado"
    elif verificar_alerta_stock_minimo(stock, 5):
        estado_producto = "Activo"
        estado_disponibilidad = "Últimas unidades"
        estado_stock = f"Últimas {stock} {'unidad' if stock == 1 else 'unidades'}"
        clase_stock = "bajo"
    else:
        estado_producto = "Activo"
        estado_disponibilidad = "Disponible"
        estado_stock = f"Disponible ({stock} en stock)"
        clase_stock = "disponible"

    fecha_reg_str = str(prod.get("FechaRegistro") or "")
    fecha_iso = _parsear_fecha_registro(prod.get("FechaRegistro"))

    return {
        "IdProducto": pid,
        "NombreProducto": nombre,
        "Marca": marca,
        "Categoria": categoria_bd,
        "CategoriaTienda": categoria_tienda,
        "CategoriaEtiqueta": categoria_etiqueta,
        "Presentacion": presentacion,
        "ContenidoTamano": contenido_tamano,
        "Descripcion": descripcion,
        "Precio": precio_actual,
        "PrecioAnterior": precio_anterior,
        "Descuento": descuento,
        "EnOferta": descuento > 0,
        "Stock": stock,
        "Disponible": activo_catalogo and stock > 0,
        "EstadoDisponibilidad": estado_disponibilidad,
        "EstadoProducto": estado_producto,
        "EstadoStock": estado_stock,
        "ClaseStock": clase_stock,
        "ImagenUrl": imagen_url,
        "Destacado": destacado_admin,
        "DestacadoAdmin": destacado_admin,
        "UnidadesVendidas": int(unidades_vendidas or 0),
        "EsNuevo": False,
        "MotivoDestacado": "",
        "VisibleTienda": visible_tienda,
        "EsDemo": es_demo,
        "OrigenDatos": "DEMOSTRACIÓN" if es_demo else "CATÁLOGO OFICIAL",
        "FechaRegistro": fecha_reg_str,
        "FechaRegistroISO": fecha_iso,
        "GrupoVariante": f"prod::{pid}",
        "NombreFamilia": nombre,
        "EtiquetaVariante": _etiqueta_corta_variante(nombre, contenido_tamano),
        "EsVariantePrincipal": True,
        "Variantes": []
    }


def ObtenerCatalogoTienda(incluir_ocultos=False, incluir_demos=False):
    """
    Obtiene el catálogo estructurado de productos para la tienda:
    1. Consulta los registros reales en SQL Server (ListarProductos) y ventas reales (ReporteVentasPorProducto).
    2. Consolida registros exactamente duplicados por (NombreProducto, Marca) sin alterar la BD,
       conservando el lote activo con stock e integrando metadatos y ventas reales acumuladas.
    3. Excluye productos inactivos u ocultos cuando incluir_ocultos=False.
    4. Identifica productos nuevos según FechaRegistro real y agrupa presentaciones/sabores como variantes.
    """
    mapa_meta = ObtenerMapaMetaProductos()
    mapa_ventas = ObtenerMapaVentasProductos()
    _, productos_bd = ListarProductos()
    productos_bd = productos_bd or []

    # Agrupar posibles registros duplicados exactos por (NombreProducto normalizado, Marca normalizada)
    grupos_exactos = {}
    for p in productos_bd:
        clave_dup = (_sin_acentos(p.get("NombreProducto")), _sin_acentos(p.get("Marca")))
        grupos_exactos.setdefault(clave_dup, []).append(p)

    consolidados = []
    fechas_primer_registro = {}

    for clave_dup, filas in grupos_exactos.items():
        # Calcular ventas reales acumuladas y primera fecha de registro del producto en BD
        ventas_grupo = sum(mapa_ventas.get(int(f.get("IdProducto") or 0), 0) for f in filas)
        fechas_iso_grupo = [
            _parsear_fecha_registro(f.get("FechaRegistro"))
            for f in filas
            if _parsear_fecha_registro(f.get("FechaRegistro"))
        ]
        primera_fecha_iso = min(fechas_iso_grupo) if fechas_iso_grupo else ""

        # Enriquecer cada lote candidato para elegir el registro canónico activo
        candidatos = [EnriquecerProducto(f, mapa_meta, unidades_vendidas=ventas_grupo) for f in filas]
        if not incluir_ocultos:
            candidatos = [c for c in candidatos if c["VisibleTienda"] and c["EstadoProducto"] == "Activo"]
        if not incluir_demos:
            candidatos = [c for c in candidatos if not c["EsDemo"]]
        if not candidatos:
            continue

        # Priorizar: 1) con existencias disponibles (>0), 2) con personalización en TiendaProductoMeta, 3) registro original (menor IdProducto)
        candidatos.sort(key=lambda c: (
            0 if int(c["Stock"]) > 0 else 1,
            0 if str(c["IdProducto"]) in mapa_meta else 1,
            int(c["IdProducto"] or 0)
        ))
        canonico = candidatos[0]

        # Si otro lote del mismo producto tenía imagen o descripción personalizada en TiendaProductoMeta, preservarla
        for alt in candidatos[1:]:
            if str(alt["IdProducto"]) in mapa_meta:
                meta_alt = mapa_meta[str(alt["IdProducto"])]
                if meta_alt.get("ImagenUrl") and str(canonico["IdProducto"]) not in mapa_meta:
                    canonico["ImagenUrl"] = alt["ImagenUrl"]
                if meta_alt.get("Presentacion") and _sin_acentos(meta_alt.get("Presentacion")) != _sin_acentos(PLACEHOLDER_PRESENTACION_ANTIGUO):
                    canonico["Presentacion"] = alt["Presentacion"]
                if meta_alt.get("Descripcion"):
                    canonico["Descripcion"] = alt["Descripcion"]
                if meta_alt.get("Descuento", 0) > 0 and canonico["Descuento"] == 0:
                    canonico["Descuento"] = alt["Descuento"]
                    canonico["PrecioAnterior"] = alt["PrecioAnterior"]
                    canonico["EnOferta"] = True
                if meta_alt.get("Destacado"):
                    canonico["Destacado"] = True
                    canonico["DestacadoAdmin"] = True

        fechas_primer_registro[int(canonico["IdProducto"])] = primera_fecha_iso
        if primera_fecha_iso:
            canonico["FechaRegistroISO"] = primera_fecha_iso
        consolidados.append(canonico)

    # Respaldo con productos de demostración únicamente si se solicita explícitamente o si la BD está vacía
    if incluir_demos or len(productos_bd) == 0:
        nombres_registrados = {_sin_acentos(c["NombreProducto"]) for c in consolidados}
        for demo in PRODUCTOS_DEMOSTRACION:
            if _sin_acentos(demo["NombreProducto"]) not in nombres_registrados:
                enriquecido_demo = EnriquecerProducto(demo, mapa_meta, unidades_vendidas=0)
                enriquecido_demo["EsDemo"] = True
                enriquecido_demo["OrigenDatos"] = "DEMOSTRACIÓN"
                if incluir_ocultos or enriquecido_demo["VisibleTienda"]:
                    consolidados.append(enriquecido_demo)

    # Identificar productos nuevos (Nuevos ingresos) con base en FechaRegistro real en SQL Server
    fechas_validas = sorted({f for f in fechas_primer_registro.values() if f})
    fecha_base_inicial = fechas_validas[0] if fechas_validas else ""
    hace_30_dias = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    for item in consolidados:
        pid_int = int(item["IdProducto"])
        f_iso = fechas_primer_registro.get(pid_int, item.get("FechaRegistroISO") or "")
        es_nuevo = False
        if f_iso:
            if len(fechas_validas) > 1 and f_iso > fecha_base_inicial:
                es_nuevo = True
            elif f_iso >= hace_30_dias and len(fechas_validas) == 1:
                es_nuevo = True
        item["EsNuevo"] = es_nuevo

        # Determinar condición real de producto destacado (sin inventar estadísticas)
        if item["EnOferta"]:
            item["MotivoDestacado"] = f"OFERTA -{item['Descuento']}%"
        elif item["DestacadoAdmin"]:
            item["MotivoDestacado"] = "DESTACADO"
        elif item["UnidadesVendidas"] >= 8:
            item["MotivoDestacado"] = "MÁS VENDIDO"
            item["Destacado"] = True
        elif item["EsNuevo"]:
            item["MotivoDestacado"] = "NUEVO INGRESO"
            item["Destacado"] = True

    # Agrupar presentaciones o sabores legítimos de la misma marca como variantes
    familias = {}
    for item in consolidados:
        clave_fam, nombre_fam = _extraer_familia_variante(item["NombreProducto"], item["Marca"])
        familias.setdefault(clave_fam, {"nombre_familia": nombre_fam, "items": []})["items"].append(item)

    for clave_fam, info in familias.items():
        lista_fam = info["items"]
        if len(lista_fam) > 1:
            # Ordenar variantes por precio ascendente y nombre para una selección natural (ej: 600 ml -> 1 Litro)
            lista_fam.sort(key=lambda x: (float(x["Precio"]), x["NombreProducto"]))
            resumen_variantes = [
                {
                    "IdProducto": v["IdProducto"],
                    "NombreProducto": v["NombreProducto"],
                    "Etiqueta": v["EtiquetaVariante"],
                    "Presentacion": v["Presentacion"],
                    "ContenidoTamano": v["ContenidoTamano"],
                    "Precio": v["Precio"],
                    "PrecioAnterior": v["PrecioAnterior"],
                    "Descuento": v["Descuento"],
                    "EnOferta": v["EnOferta"],
                    "Stock": v["Stock"],
                    "Disponible": v["Disponible"],
                    "EstadoStock": v["EstadoStock"],
                    "ClaseStock": v["ClaseStock"],
                    "ImagenUrl": v["ImagenUrl"],
                }
                for v in lista_fam
            ]
            # Elegir como variante principal la primera con stock disponible
            idx_principal = next((i for i, v in enumerate(lista_fam) if v["Disponible"]), 0)
            for idx, v in enumerate(lista_fam):
                v["GrupoVariante"] = f"fam::{clave_fam}"
                v["NombreFamilia"] = info["nombre_familia"] or v["NombreProducto"]
                v["EsVariantePrincipal"] = (idx == idx_principal)
                v["Variantes"] = resumen_variantes
        else:
            unico = lista_fam[0]
            unico["GrupoVariante"] = f"prod::{unico['IdProducto']}"
            unico["NombreFamilia"] = unico["NombreProducto"]
            unico["EsVariantePrincipal"] = True
            unico["Variantes"] = []

    # Orden alfabético limpio por defecto
    consolidados.sort(key=lambda x: _sin_acentos(x["NombreProducto"]))
    return consolidados


def ObtenerResumenTienda(catalogo):
    """
    Calcula conteos reales por categoría usando exactamente la misma colección del catálogo
    que alimenta la rejilla de productos, garantizando coincidencia 1 a 1.
    """
    catalogo = catalogo or []

    disponibles_por_cat = {}
    totales_por_cat = {}
    for p in catalogo:
        cat = p.get("CategoriaTienda") or "Suplementos"
        totales_por_cat[cat] = totales_por_cat.get(cat, 0) + 1
        if p.get("Disponible"):
            disponibles_por_cat[cat] = disponibles_por_cat.get(cat, 0) + 1

    categorias = []
    for cfg in CATEGORIAS_VISUALES_CONFIG:
        clave = cfg["clave"]
        disponibles = disponibles_por_cat.get(clave, 0)
        totales = totales_por_cat.get(clave, 0)
        categorias.append({
            "clave": clave,
            "nombre": cfg["nombre"],
            "imagen": cfg["imagen"],
            "disponibles": disponibles,
            "totales": totales
        })

    otros_disp = disponibles_por_cat.get("Suplementos", 0)
    otros_tot = totales_por_cat.get("Suplementos", 0)

    marcas_map = {}
    for p in catalogo:
        m = (p.get("Marca") or "").strip()
        if m:
            norm = _sin_acentos(m)
            if norm not in marcas_map:
                marcas_map[norm] = m
    marcas = sorted(marcas_map.values(), key=lambda s: _sin_acentos(s))

    precios = [float(p.get("Precio") or 0) for p in catalogo if float(p.get("Precio") or 0) > 0]
    ofertas_count = sum(1 for p in catalogo if p.get("EnOferta") and int(p.get("Descuento") or 0) > 0)
    nuevos_count = sum(1 for p in catalogo if p.get("EsNuevo"))
    tiene_ventas_reales = any(int(p.get("UnidadesVendidas") or 0) > 0 for p in catalogo)

    return {
        "categorias": categorias,
        "otros_suplementos_disponibles": otros_disp,
        "otros_suplementos_totales": otros_tot,
        "marcas": marcas,
        "precio_min": round(min(precios), 2) if precios else 0.0,
        "precio_max": round(max(precios), 2) if precios else 0.0,
        "ofertas_count": ofertas_count,
        "nuevos_count": nuevos_count,
        "tiene_ventas_reales": tiene_ventas_reales,
        "total_productos_unicos": len(catalogo)
    }


def EnriquecerMembresiasTienda(membresias):
    """
    Enriquece los 4 planes reales de membresía registrados en SQL Server
    con duración clara, disponibilidad real, socios activos, beneficios operativos reales
    del sistema y condiciones de contratación, sin modificar precios ni inventar servicios.
    """
    lista_base = membresias if (membresias and isinstance(membresias, list)) else [
        {"IdMembresia": 1, "NombreMembresia": "Pase de un día", "Precio": 50.00, "DuracionDias": 1, "DuracionMeses": 0, "Tipo": "Diario"},
        {"IdMembresia": 2, "NombreMembresia": "Membresía basica semanal", "Precio": 150.00, "DuracionDias": 7, "DuracionMeses": 0, "Tipo": "Semanal"},
        {"IdMembresia": 3, "NombreMembresia": "Membresia basica quincenal", "Precio": 300.00, "DuracionDias": 15, "DuracionMeses": 0, "Tipo": "Quincenal"},
        {"IdMembresia": 4, "NombreMembresia": "Membresia basica mensual", "Precio": 500.00, "DuracionDias": 30, "DuracionMeses": 1, "Tipo": "Mensual"},
    ]

    mapa_activos = {}
    try:
        ok_act, activos = ReporteMembresiasActivas()
        if ok_act and isinstance(activos, list):
            for a in activos:
                mid = a.get("IdMembresia")
                if mid is not None:
                    mapa_activos[int(mid)] = int(a.get("TotalClientesActivos") or 0)
    except Exception:
        pass

    enriquecidas = []
    for m in sorted(lista_base, key=lambda x: int(x.get("DuracionDias") or 0)):
        mid = int(m.get("IdMembresia") or 0)
        dias = int(m.get("DuracionDias") or 0)
        meses = int(m.get("DuracionMeses") or 0)
        precio = float(m.get("Precio") or 0.0)
        nombre_db = (m.get("NombreMembresia") or "Plan de Membresía").strip()
        tipo = (m.get("Tipo") or "Estándar").strip()
        tipo_norm = _sin_acentos(tipo)
        nombre_norm = _sin_acentos(nombre_db)

        if dias == 1 or "diario" in tipo_norm or "dia" in nombre_norm:
            titulo = "PLAN DIARIO"
            duracion = "1 DÍA"
            imagen = "/static/image/membresias/plan_diario.png"
            es_popular = False
            beneficios = [
                "Acceso general al área de pesas y maquinaria durante el día contratado.",
                "Registro de ingreso y asistencia diaria en recepción."
            ]
            condiciones = "Vigencia de 1 día calendario en la fecha de activación • Uso personal e intransferible • Pago único en recepción."
        elif dias == 7 or "semanal" in tipo_norm:
            titulo = "PLAN SEMANAL"
            duracion = "7 DÍAS"
            imagen = "/static/image/membresias/plan_semanal.png"
            es_popular = False
            beneficios = [
                "Acceso continuo a instalaciones y maquinaria durante 7 días calendario.",
                "Control de asistencias y seguimiento de rutinas asignadas en sistema."
            ]
            condiciones = "Vigencia de 7 días consecutivos desde la activación • Modalidad básica individual • Pago en efectivo, tarjeta o transferencia."
        elif dias == 15 or "quincenal" in tipo_norm:
            titulo = "PLAN QUINCENAL"
            duracion = "15 DÍAS"
            imagen = "/static/image/membresias/plan_quincenal.png"
            es_popular = False
            beneficios = [
                "Acceso continuo a zonas de entrenamiento y maquinaria por 15 días.",
                "Registro de asistencias y programación de rutina en el sistema."
            ]
            condiciones = "Vigencia de 15 días calendario consecutivos desde el registro del pago • Modalidad básica individual renovable."
        elif dias >= 28 or meses >= 1 or "mensual" in tipo_norm:
            titulo = "PLAN MENSUAL"
            duracion = f"{dias if dias > 0 else 30} DÍAS (1 MES)"
            imagen = "/static/image/membresias/plan_mensual.png"
            es_popular = True
            beneficios = [
                "Acceso completo a instalaciones y maquinaria durante 30 días continuos.",
                "Asignación de rutina semanal por grupo muscular y control de asistencias."
            ]
            condiciones = "Vigencia de 30 días calendario continuos desde la fecha de pago • Modalidad básica mensual personal • Renovación directa en recepción."
        else:
            titulo = nombre_db.upper()
            duracion = f"{dias} DÍAS" if dias > 0 else f"{meses} MESES"
            imagen = "/static/image/membresias/plan_mensual.png"
            es_popular = False
            beneficios = [
                f"Acceso a instalaciones y equipamiento de World Gym durante {duracion.lower()}.",
                "Control de asistencia registrado en el sistema."
            ]
            condiciones = f"Vigencia de {duracion.lower()} desde la fecha de activación • Modalidad personal."

        socios_activos = mapa_activos.get(mid, 0)
        disponibilidad = "Disponible • Activación inmediata"

        enriquecidas.append({
            "IdMembresia": mid,
            "NombreMembresia": nombre_db,
            "TituloPlan": titulo,
            "Tipo": tipo,
            "DuracionDias": dias,
            "DuracionMeses": meses,
            "DuracionTexto": duracion,
            "Precio": precio,
            "PrecioFormateado": f"{precio:.2f}",
            "ImagenPlan": imagen,
            "EsPopular": es_popular,
            "EtiquetaPopular": "MÁS POPULAR • RECOMENDADO" if es_popular else "",
            "Beneficios": beneficios,
            "Condiciones": condiciones,
            "Disponibilidad": disponibilidad,
            "SociosActivos": socios_activos
        })

    return enriquecidas


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
    Valida existencias reales en el backend contra el inventario actual en SQL Server,
    evita cantidades negativas o sobreventa, y registra la compra reutilizando el módulo
    de Ventas (ProcesarVenta / RegistrarVenta).
    """
    if not items_carrito or not isinstance(items_carrito, list):
        return False, "El carrito está vacío o el formato de productos no es válido.", None

    # Consultar inventario real directamente desde ListarProductos para máxima exactitud transaccional
    mapa_meta = ObtenerMapaMetaProductos()
    _, productos_bd = ListarProductos()
    mapa_bd = {}
    for p_raw in (productos_bd or []):
        enriq = EnriquecerProducto(p_raw, mapa_meta)
        if enriq["VisibleTienda"] and enriq["EstadoProducto"] == "Activo":
            mapa_bd[int(enriq["IdProducto"])] = enriq

    # Respaldo para artículos demo únicamente si aún existieran en una sesión de prueba sin BD
    catalogo_demo = ObtenerCatalogoTienda(incluir_ocultos=False, incluir_demos=True)
    for p_cat in catalogo_demo:
        pid_cat = int(p_cat["IdProducto"])
        if pid_cat not in mapa_bd:
            mapa_bd[pid_cat] = p_cat

    # Consolidar líneas repetidas del mismo IdProducto por seguridad
    cantidades_por_id = {}
    orden_ids = []
    for linea in items_carrito:
        try:
            id_prod = int(linea.get("IdProducto"))
            cantidad = int(linea.get("Cantidad"))
        except (ValueError, TypeError):
            return False, "Uno de los productos tiene un identificador o cantidad inválida.", None
        if cantidad <= 0:
            return False, "La cantidad de cada producto debe ser mayor a cero.", None
        if id_prod not in cantidades_por_id:
            orden_ids.append(id_prod)
            cantidades_por_id[id_prod] = 0
        cantidades_por_id[id_prod] += cantidad

    items_validados_bd = []
    resumen_lineas = []
    subtotal_sin_descuento = 0.0
    total_final = 0.0
    incluye_demos = False

    for id_prod in orden_ids:
        cantidad = cantidades_por_id[id_prod]
        prod_info = mapa_bd.get(id_prod)
        if not prod_info:
            return False, f"El producto seleccionado (#{id_prod}) ya no está activo o disponible en el catálogo.", None

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

    id_cliente = None
    if usuario_sesion:
        id_cliente = usuario_sesion.get("cliente_id")

    if not id_cliente and items_validados_bd:
        _, clientes = ListarClientes()
        if clientes and len(clientes) > 0:
            nombre_usr = (usuario_sesion.get("usuario_nombre") or "").lower() if usuario_sesion else ""
            cliente_match = next(
                (c for c in clientes if nombre_usr and nombre_usr in str(c.get("NombreCompleto", "")).lower()),
                clientes[0]
            )
            id_cliente = cliente_match.get("IdCliente")

    venta_registrada_bd = False

    if items_validados_bd and id_cliente:
        if len(items_validados_bd) == 1:
            unico = items_validados_bd[0]
            ok_venta, res_venta = RegistrarVenta(int(id_cliente), int(unico["IdProducto"]), int(unico["Cantidad"]))
        else:
            ok_venta, res_venta = ProcesarVenta(int(id_cliente), items_validados_bd)

        if not ok_venta:
            return False, f"No se pudo procesar la venta en inventario: {res_venta}", None
        venta_registrada_bd = True

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
        msg_exito = f"¡Compra confirmada! Folio {folio}. Se actualizó el inventario real y se registró en el módulo de Ventas."
    else:
        msg_exito = f"¡Pedido generado! Folio {folio}."

    return True, msg_exito, comprobante
