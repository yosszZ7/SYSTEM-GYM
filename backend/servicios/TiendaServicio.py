import os
import re
import json
import unicodedata
from datetime import datetime, timedelta
from urllib import request as urllib_request, parse as urllib_parse, error as urllib_error
import base64
from ConexionBD import ConectarBD
from backend.servicios.ListaDeProductos import ListarProductos
from backend.servicios.RegistrarProducto import RegistrarProducto
from backend.servicios.ActualizarProducto import ActualizarProducto
from backend.servicios.ProcesarVenta import ProcesarVenta
from backend.servicios.RegistrarVenta import RegistrarVenta
from backend.servicios.ListaDeClientes import ListarClientes
from backend.servicios.ListaDeMembresias import ListarMembresias
from backend.servicios.ListaDeMetodosPago import ListarMetodosPago
from backend.servicios.AsignarMembresia import AsignarMembresia
from backend.servicios.ObtenerMembresiaActivaCliente import ObtenerMembresiaActivaCliente
from backend.servicios.ReporteVentasPorProducto import ReporteVentasPorProducto
from backend.servicios.ReporteMembresiasActivas import ReporteMembresiasActivas
from backend.logica_negocio import aplicar_descuento, calcular_nuevo_stock_salida, verificar_alerta_stock_minimo

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
META_JSON_PATH = os.path.join(BASE_DIR, "static", "data", "tienda_meta.json")
PEDIDOS_JSON_PATH = os.path.join(BASE_DIR, "static", "data", "tienda_pedidos.json")
SOLICITUDES_MEMBRESIA_JSON_PATH = os.path.join(BASE_DIR, "static", "data", "membresias_solicitudes.json")

# Catálogo de imágenes reales oficiales de suplementos y productos deportivos
IMAGENES_SUPLEMENTOS = [
    {"id": "monster_energy_473ml", "nombre": "Monster Energy Clásica Negra/Verde (473 ml / 16 oz)", "url": "/static/image/productos/monster_energy_473ml.webp"},
    {"id": "redbull_250ml", "nombre": "Red Bull Bebida Energizante Slim Can (250 ml)", "url": "/static/image/productos/redbull_250ml.webp"},
    {"id": "raptor_energy_600ml", "nombre": "Raptor Bebida Energizante Botella PET (600 ml)", "url": "/static/image/productos/raptor_energy_600ml.webp"},
    {"id": "powerade_600ml", "nombre": "Powerade Bebida Isotónica (600 ml)", "url": "/static/image/productos/powerade_600ml.webp"},
    {"id": "gatorade_600ml", "nombre": "Gatorade Bebida Isotónica (600 ml)", "url": "/static/image/productos/gatorade_600ml.webp"},
    {"id": "electrolit_coco", "nombre": "Electrolit Suero Rehidratante Sabor Coco (625 ml)", "url": "/static/image/productos/electrolit_coco.webp"},
    {"id": "electrolit_fresa", "nombre": "Electrolit Suero Rehidratante Sabor Fresa (625 ml)", "url": "/static/image/productos/electrolit_fresa.webp"},
    {"id": "fuente_pura_1l", "nombre": "Fuente Pura Agua Purificada (1 Litro)", "url": "/static/image/productos/fuente_pura_1l.webp"},
    {"id": "fuente_pura_600ml", "nombre": "Fuente Pura Agua Purificada (600 ml)", "url": "/static/image/productos/fuente_pura_600ml.webp"},
    {"id": "scoop_proteina", "nombre": "Varias - Scoop de Proteína (1 servicio)", "url": "/static/image/productos/scoop_proteina.webp"},
    {"id": "scoop_preentreno", "nombre": "Varias - Scoop de Pre-entreno (1 servicio)", "url": "/static/image/productos/scoop_preentreno.webp"},
    {"id": "quest_bar_chocolate", "nombre": "Quest Nutrition Barra de Proteína Sabor Chocolate", "url": "/static/image/productos/quest_bar_chocolate.webp"},
    {"id": "xtend_bcaa", "nombre": "Xtend BCAA en Polvo Cilíndrico Azul/Gris (30 serv)", "url": "/static/image/productos/xtend_bcaa.webp"},
    {"id": "universal_glutamina", "nombre": "Universal Nutrition Glutamina Bote Blanco (300 g)", "url": "/static/image/productos/universal_glutamina.webp"},
    {"id": "musclepharm_fish_oil", "nombre": "MusclePharm Omega 3 Fish Oil Blanco/Verde (100 caps)", "url": "/static/image/productos/musclepharm_fish_oil.webp"},
    {"id": "gnc_megamen_sport", "nombre": "GNC Mega Men Sport Multivitamínico Frasco Negro (60 caps)", "url": "/static/image/productos/gnc_megamen_sport.webp"},
    {"id": "muscletech_platinum_creatina", "nombre": "MuscleTech Platinum Creatina Monohidratada 100% (300 g)", "url": "/static/image/productos/muscletech_platinum_creatina.webp"},
    {"id": "optimum_creatina", "nombre": "Optimum Nutrition Micronized Creatine Powder", "url": "/static/image/productos/optimum_creatina.webp"},
    {"id": "cellucor_c4_original", "nombre": "Cellucor Pre-Entreno C4 Original Amarillo/Cromado (30 serv)", "url": "/static/image/productos/cellucor_c4_original.webp"},
    {"id": "isopure_zero_carb", "nombre": "Isopure Proteína Isolatada Zero Carb Bote Negro (3 lbs)", "url": "/static/image/productos/isopure_zero_carb.webp"},
    {"id": "dymatize_super_mass", "nombre": "Dymatize Super Mass Gainer Negro/Verde (5-6 lbs)", "url": "/static/image/productos/dymatize_super_mass.webp"},
    {"id": "optimum_gold_standard_whey", "nombre": "Optimum Nutrition 100% Whey Gold Standard Negro/Rojo/Dorado", "url": "/static/image/productos/optimum_gold_standard_whey.webp"},
    {"id": "real_beef_xp", "nombre": "Proteína Raptor / Beef-XP Clear Isolate (3.96 lb)", "url": "/static/image/productos/real_beef_xp.avif"},
    {"id": "real_beef_citrus", "nombre": "Proteína Raptor / Beef-XP Citrus Twist (3.96 lb)", "url": "/static/image/productos/real_beef_citrus.avif"},
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
    Asigna la fotografía comercial oficial correspondiente a cada producto del catálogo,
    respetando empaques de marca, sabores y presentaciones reales con fondo blanco/transparente.
    """
    nombre_norm = _sin_acentos(nombre)
    marca_norm = _sin_acentos(marca)
    texto = f"{nombre_norm} {marca_norm}".strip()

    # 1. Bebidas energéticas y comerciales específicas
    if "monster" in texto:
        return "/static/image/productos/monster_energy_473ml.webp"
    if "red bull" in texto:
        return "/static/image/productos/redbull_250ml.webp"
    if "raptor" in texto and any(k in texto for k in ("bebida", "energ", "600")):
        return "/static/image/productos/raptor_energy_600ml.webp"

    # 2. Bebidas isotónicas y de hidratación
    if "powerade" in texto:
        return "/static/image/productos/powerade_600ml.webp"
    if "gatorade" in texto:
        return "/static/image/productos/gatorade_600ml.webp"
    if "electrolit" in texto:
        if "fresa" in texto:
            return "/static/image/productos/electrolit_fresa.webp"
        return "/static/image/productos/electrolit_coco.webp"

    # 3. Aguas purificadas (Fuente Pura)
    if "fuente pura" in texto or ("agua" in texto and "purificada" in texto):
        if any(k in texto for k in ("1 litro", "1l", "1 l", "1000", "litro")):
            return "/static/image/productos/fuente_pura_1l.webp"
        return "/static/image/productos/fuente_pura_600ml.webp"

    # 4. Servicios individuales (Scoops)
    if "scoop" in nombre_norm:
        if any(k in texto for k in ("pre", "entreno", "workout", "c4")):
            return "/static/image/productos/scoop_preentreno.webp"
        return "/static/image/productos/scoop_proteina.webp"

    # 5. Barras de proteína
    if "quest" in texto or "barra" in nombre_norm:
        return "/static/image/productos/quest_bar_chocolate.webp"

    # 6. Aminoácidos y Glutamina
    if "xtend" in texto or "bcaa" in texto:
        return "/static/image/productos/xtend_bcaa.webp"
    if "universal" in texto or "glutamin" in texto:
        return "/static/image/productos/universal_glutamina.webp"

    # 7. Vitaminas, Multivitamínicos y Omega 3
    if "musclepharm" in texto or "fish oil" in texto or "omega" in texto:
        return "/static/image/productos/musclepharm_fish_oil.webp"
    if "gnc" in texto or "mega men" in texto or "multivitam" in texto:
        return "/static/image/productos/gnc_megamen_sport.webp"

    # 8. Creatinas
    if "muscletech" in texto or "platinum" in texto or ("creatina" in texto and "monohidratada" in texto and "opti" not in texto):
        return "/static/image/productos/muscletech_platinum_creatina.webp"
    if "creatin" in texto:
        return "/static/image/productos/optimum_creatina.webp"

    # 9. Pre-entrenos
    if "c4" in texto or "cellucor" in texto:
        return "/static/image/productos/cellucor_c4_original.webp"
    if "nitraflex" in texto:
        return "/static/image/productos/real_nitraflex_pre.webp"

    # 10. Ganadores de masa (Mass Gainer)
    if any(k in texto for k in ("dymatize", "mass gainer", "ganador", "gainer", "hipercalorico")):
        return "/static/image/productos/dymatize_super_mass.webp"

    # 11. Proteínas
    if "isopure" in texto or "zero carb" in texto:
        return "/static/image/productos/isopure_zero_carb.webp"
    if "beef" in texto or ("raptor" in texto and "citrus" in texto):
        return "/static/image/productos/real_beef_citrus.avif"
    if "beef" in texto or ("raptor" in texto and "whey" not in texto):
        return "/static/image/productos/real_beef_xp.avif"
    if "rule" in texto:
        return "/static/image/productos/real_rule1_whey.webp"
    if any(k in texto for k in ("optimum", "gold standard", "whey", "proteina")):
        return "/static/image/productos/optimum_gold_standard_whey.webp"

    # 12. Accesorios
    if any(k in texto for k in ("shaker", "guante", "strap", "cinturon", "magnesio", "chalk", "accesorio")):
        return "/static/image/productos/real_accesorio_gym.webp"

    return "/static/image/productos/optimum_gold_standard_whey.webp"


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
    imagen_url = meta.get("ImagenUrl") or prod.get("ImagenUrl")
    placeholders_obsoletos = {
        "/static/image/productos/real_protein_water.webp",
        "/static/image/productos/real_bebida_energetica.webp",
        "/static/image/productos/cat_aminoacidos.png",
        "/static/image/productos/cat_vitaminas.png",
        "/static/image/productos/cat_proteinas.png",
        "/static/image/productos/cat_creatinas.png",
        "/static/image/productos/cat_preentreno.png",
        "/static/image/productos/cat_massgainer.png",
        "/static/image/productos/default_suplemento.svg",
        "/static/image/productos/raptor_whey.svg",
        "/static/image/productos/power_creatina.svg",
        "/static/image/productos/power_preworkout.svg",
        "/static/image/productos/whey_gold.svg",
        "/static/image/productos/creatina_mono.svg",
        "/static/image/productos/mass_gainer.svg",
        "/static/image/productos/bebida_energetica.svg",
        "/static/image/productos/shaker_pro.svg",
        "/static/image/productos/guantes_pro.svg"
    }
    if not imagen_url or imagen_url in placeholders_obsoletos:
        imagen_url = InferirImagenSuplemento(nombre, marca, categoria_bd)

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


# ==============================================================================
# CONTRATACIÓN Y PAGO DE MEMBRESÍAS DESDE LA INTERFAZ DEL CLIENTE (WORLD GYM)
# ==============================================================================
CAMPOS_TARJETA_PROHIBIDOS = {
    "cardnumber", "card_number", "numero_tarjeta", "numerotarjeta", "pan",
    "cvv", "cvc", "codigo_seguridad", "codigoseguridad", "security_code"
}


def ContienenDatosCrudosTarjeta(payload):
    """
    Verifica que ningún payload recibido por el servidor intente enviar o almacenar
    números completos de tarjeta (PAN) ni códigos de seguridad (CVV/CVC).
    """
    if not isinstance(payload, dict):
        return False
    for k in payload.keys():
        k_norm = re.sub(r"[\s\-_]", "", str(k or "").lower())
        if k_norm in {re.sub(r"[\s\-_]", "", c) for c in CAMPOS_TARJETA_PROHIBIDOS}:
            return True
    return False


def AsegurarTablaSolicitudesMembresia():
    """
    Crea la tabla auxiliar TiendaSolicitudMembresia en SQL Server si no existe.
    Permite registrar contrataciones de membresías iniciadas por el cliente desde la web,
    tanto pendientes de confirmación en efectivo como confirmadas mediante pasarela de tarjeta.
    """
    conexion = None
    try:
        conexion = ConectarBD()
        if not conexion:
            return False
        cursor = conexion.cursor()
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TiendaSolicitudMembresia')
            BEGIN
                CREATE TABLE TiendaSolicitudMembresia (
                    IdSolicitud INT IDENTITY(1,1) PRIMARY KEY,
                    Folio NVARCHAR(50) NOT NULL,
                    IdCliente INT NOT NULL,
                    NombreCliente NVARCHAR(200) NOT NULL,
                    IdUsuario INT NULL,
                    IdMembresia INT NOT NULL,
                    NombreMembresia NVARCHAR(150) NOT NULL,
                    TituloPlan NVARCHAR(150) NOT NULL,
                    DuracionDias INT NOT NULL DEFAULT 30,
                    DuracionTexto NVARCHAR(80) NOT NULL,
                    Monto DECIMAL(10,2) NOT NULL,
                    MetodoPago NVARCHAR(40) NOT NULL,
                    EstadoPago NVARCHAR(40) NOT NULL DEFAULT 'Pendiente',
                    EstadoMembresia NVARCHAR(50) NOT NULL DEFAULT 'Pendiente de confirmación',
                    ReferenciaPasarela NVARCHAR(150) NULL,
                    Ultimos4 NVARCHAR(10) NULL,
                    MarcaTarjeta NVARCHAR(40) NULL,
                    Notas NVARCHAR(400) NULL,
                    FechaSolicitud DATETIME NOT NULL DEFAULT GETDATE(),
                    FechaConfirmacion DATETIME NULL,
                    ConfirmadoPor NVARCHAR(120) NULL
                )
            END
        """)
        conexion.commit()
        return True
    except Exception as e:
        print("Aviso AsegurarTablaSolicitudesMembresia:", e)
        return False
    finally:
        if conexion:
            conexion.close()


def _cargar_solicitudes_membresia_local():
    _asegurar_directorio_datos()
    if not os.path.exists(SOLICITUDES_MEMBRESIA_JSON_PATH):
        return []
    try:
        with open(SOLICITUDES_MEMBRESIA_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print("Error leyendo membresias_solicitudes.json:", e)
        return []


def _guardar_solicitudes_membresia_local(lista):
    _asegurar_directorio_datos()
    try:
        with open(SOLICITUDES_MEMBRESIA_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump((lista or [])[:300], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error guardando membresias_solicitudes.json:", e)


def ObtenerConfigPasarelaPago():
    """
    Verifica si las credenciales de la pasarela de pago electrónica (Stripe)
    están configuradas en las variables de entorno (.env).
    Nunca simula transacciones ficticias cuando las credenciales no están presentes.
    """
    public_key = (os.getenv("STRIPE_PUBLIC_KEY") or os.getenv("PAYMENT_GATEWAY_PUBLIC_KEY") or "").strip()
    secret_key = (os.getenv("STRIPE_SECRET_KEY") or os.getenv("PAYMENT_GATEWAY_SECRET_KEY") or "").strip()
    moneda_pasarela = (os.getenv("STRIPE_CURRENCY") or "nio").strip().lower()
    proveedor = (os.getenv("PAYMENT_GATEWAY_PROVIDER") or "Stripe").strip()

    claves_validas = bool(
        public_key and secret_key
        and not public_key.endswith("_reemplazar")
        and not secret_key.endswith("_reemplazar")
        and len(public_key) >= 12
        and len(secret_key) >= 12
    )

    faltantes = []
    if not public_key:
        faltantes.append("STRIPE_PUBLIC_KEY")
    if not secret_key:
        faltantes.append("STRIPE_SECRET_KEY")

    return {
        "habilitada": claves_validas,
        "proveedor": proveedor,
        "public_key": public_key if claves_validas else "",
        "moneda": moneda_pasarela.upper(),
        "variables_requeridas": ["STRIPE_PUBLIC_KEY", "STRIPE_SECRET_KEY"],
        "variables_faltantes": faltantes,
        "modo_seguridad": "Tokenización directa PCI-DSS (sin almacenar PAN ni CVV en servidor)",
        "instrucciones_configuracion": (
            "Para habilitar cobros electrónicos reales con tarjeta en World Gym, configure las claves "
            "STRIPE_PUBLIC_KEY (pk_live_... o pk_test_...) y STRIPE_SECRET_KEY (sk_live_... o sk_test_...) "
            "en el archivo .env o en las variables de entorno del servidor."
        )
    }


def _resolver_cliente_de_sesion(usuario_sesion):
    """
    Obtiene el IdCliente y NombreCompleto asociados al usuario autenticado en la sesión.
    """
    if not usuario_sesion:
        return None, None

    id_cliente = usuario_sesion.get("cliente_id")
    id_usuario = usuario_sesion.get("usuario_id")
    nombre_sesion = (usuario_sesion.get("usuario_nombre") or "Cliente World Gym").strip()

    conexion = None
    try:
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            if not id_cliente and id_usuario:
                cursor.execute("SELECT IdCliente FROM Usuario WHERE IdUsuario = ?", (int(id_usuario),))
                row_u = cursor.fetchone()
                if row_u and row_u[0]:
                    id_cliente = int(row_u[0])

            if id_cliente:
                cursor.execute("""
                    SELECT IdCliente, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido
                    FROM Cliente WHERE IdCliente = ?
                """, (int(id_cliente),))
                row_c = cursor.fetchone()
                if row_c:
                    partes = [row_c[1], row_c[2], row_c[3], row_c[4]]
                    nombre_completo = " ".join(str(p).strip() for p in partes if p and str(p).strip())
                    return int(row_c[0]), (nombre_completo or nombre_sesion)
    except Exception as e:
        print("Aviso resolviendo cliente de sesión:", e)
    finally:
        if conexion:
            conexion.close()

    ok_cli, clientes_res = ListarClientes()
    clientes = clientes_res if (ok_cli and isinstance(clientes_res, list)) else []
    if id_cliente:
        for c in clientes:
            if isinstance(c, dict) and int(c.get("IdCliente") or 0) == int(id_cliente):
                partes = [c.get("PrimerNombre"), c.get("SegundoNombre"), c.get("PrimerApellido"), c.get("SegundoApellido")]
                nombre_c = " ".join(str(p).strip() for p in partes if p and str(p).strip()) or c.get("NombreCompleto") or nombre_sesion
                return int(id_cliente), nombre_c

    if clientes:
        nombre_low = nombre_sesion.lower()
        for c in clientes:
            if not isinstance(c, dict):
                continue
            partes = [c.get("PrimerNombre"), c.get("SegundoNombre"), c.get("PrimerApellido"), c.get("SegundoApellido")]
            nombre_c = " ".join(str(p).strip() for p in partes if p and str(p).strip()) or str(c.get("NombreCompleto") or "")
            if nombre_low and nombre_low in nombre_c.lower():
                return int(c.get("IdCliente")), nombre_c
        primero = clientes[0]
        if isinstance(primero, dict):
            partes = [primero.get("PrimerNombre"), primero.get("SegundoNombre"), primero.get("PrimerApellido"), primero.get("SegundoApellido")]
            nombre_p = " ".join(str(p).strip() for p in partes if p and str(p).strip()) or nombre_sesion
            return int(primero.get("IdCliente")), nombre_p

    return (int(id_cliente) if id_cliente else 1), nombre_sesion


def _obtener_plan_por_id(id_membresia):
    ok_mem, membresias_raw = ListarMembresias()
    planes = EnriquecerMembresiasTienda(membresias_raw if (ok_mem and isinstance(membresias_raw, list)) else None)
    for p in planes:
        if int(p.get("IdMembresia") or 0) == int(id_membresia or 0):
            return p
    return None


def _resolver_id_metodo_pago(nombre_buscado="Efectivo"):
    """
    Busca el IdMetodoPago correspondiente en la tabla MetodoPago ('Efectivo' o 'Tarjeta').
    """
    buscado = _sin_acentos(nombre_buscado)
    ok_mp, metodos = ListarMetodosPago()
    for m in (metodos if (ok_mp and isinstance(metodos, list)) else []):
        if not isinstance(m, dict):
            continue
        nom = _sin_acentos(m.get("Nombre") or m.get("NombreMetodo") or "")
        if buscado in nom:
            return int(m.get("IdMetodoPago"))
    if "tarjeta" in buscado:
        return 2
    return 1


def _insertar_solicitud_membresia(registro):
    """
    Persiste la solicitud/transacción de membresía en SQL Server (TiendaSolicitudMembresia)
    y sincroniza el respaldo JSON local.
    """
    id_generado = None
    conexion = None
    try:
        AsegurarTablaSolicitudesMembresia()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("""
                INSERT INTO TiendaSolicitudMembresia (
                    Folio, IdCliente, NombreCliente, IdUsuario,
                    IdMembresia, NombreMembresia, TituloPlan, DuracionDias, DuracionTexto,
                    Monto, MetodoPago, EstadoPago, EstadoMembresia,
                    ReferenciaPasarela, Ultimos4, MarcaTarjeta, Notas,
                    FechaSolicitud, FechaConfirmacion, ConfirmadoPor
                )
                OUTPUT INSERTED.IdSolicitud
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, ?)
            """, (
                registro["Folio"],
                int(registro["IdCliente"]),
                registro["NombreCliente"],
                int(registro["IdUsuario"]) if registro.get("IdUsuario") else None,
                int(registro["IdMembresia"]),
                registro["NombreMembresia"],
                registro["TituloPlan"],
                int(registro["DuracionDias"]),
                registro["DuracionTexto"],
                float(registro["Monto"]),
                registro["MetodoPago"],
                registro["EstadoPago"],
                registro["EstadoMembresia"],
                registro.get("ReferenciaPasarela"),
                registro.get("Ultimos4"),
                registro.get("MarcaTarjeta"),
                registro.get("Notas"),
                datetime.now() if registro.get("EstadoPago") == "Confirmado" else None,
                registro.get("ConfirmadoPor")
            ))
            fila = cursor.fetchone()
            if fila and fila[0]:
                id_generado = int(fila[0])
            conexion.commit()
    except Exception as e:
        print("Aviso insertando en TiendaSolicitudMembresia:", e)
    finally:
        if conexion:
            conexion.close()

    lista_local = _cargar_solicitudes_membresia_local()
    if not id_generado:
        max_id = max([int(x.get("IdSolicitud") or 0) for x in lista_local], default=0)
        id_generado = max_id + 1
    registro["IdSolicitud"] = id_generado
    lista_local = [x for x in lista_local if str(x.get("Folio")) != str(registro["Folio"])]
    lista_local.insert(0, registro)
    _guardar_solicitudes_membresia_local(lista_local)
    return registro


def ListarSolicitudesMembresiaTienda(id_cliente=None, estado_pago=None):
    """
    Devuelve todas las contrataciones y solicitudes de membresía iniciadas desde la interfaz
    del cliente, combinando SQL Server y el respaldo local.
    """
    mapa_por_folio = {}
    for item_local in _cargar_solicitudes_membresia_local():
        folio = str(item_local.get("Folio") or "")
        if folio:
            mapa_por_folio[folio] = dict(item_local)

    conexion = None
    try:
        AsegurarTablaSolicitudesMembresia()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("""
                SELECT IdSolicitud, Folio, IdCliente, NombreCliente, IdUsuario,
                       IdMembresia, NombreMembresia, TituloPlan, DuracionDias, DuracionTexto,
                       Monto, MetodoPago, EstadoPago, EstadoMembresia,
                       ReferenciaPasarela, Ultimos4, MarcaTarjeta, Notas,
                       FechaSolicitud, FechaConfirmacion, ConfirmadoPor
                FROM TiendaSolicitudMembresia
                ORDER BY FechaSolicitud DESC, IdSolicitud DESC
            """)
            for r in cursor.fetchall():
                f_sol = r.FechaSolicitud
                f_conf = r.FechaConfirmacion
                item_bd = {
                    "IdSolicitud": int(r.IdSolicitud),
                    "Folio": str(r.Folio),
                    "IdCliente": int(r.IdCliente),
                    "NombreCliente": str(r.NombreCliente or "Cliente"),
                    "IdUsuario": int(r.IdUsuario) if r.IdUsuario is not None else None,
                    "IdMembresia": int(r.IdMembresia),
                    "NombreMembresia": str(r.NombreMembresia or ""),
                    "TituloPlan": str(r.TituloPlan or ""),
                    "DuracionDias": int(r.DuracionDias or 30),
                    "DuracionTexto": str(r.DuracionTexto or ""),
                    "Monto": float(r.Monto or 0.0),
                    "MetodoPago": str(r.MetodoPago or "Efectivo"),
                    "EstadoPago": str(r.EstadoPago or "Pendiente"),
                    "EstadoMembresia": str(r.EstadoMembresia or "Pendiente de confirmación"),
                    "ReferenciaPasarela": str(r.ReferenciaPasarela or "") if r.ReferenciaPasarela else None,
                    "Ultimos4": str(r.Ultimos4 or "") if r.Ultimos4 else None,
                    "MarcaTarjeta": str(r.MarcaTarjeta or "") if r.MarcaTarjeta else None,
                    "Notas": str(r.Notas or ""),
                    "FechaSolicitud": f_sol.strftime("%d/%m/%Y %H:%M") if hasattr(f_sol, "strftime") else str(f_sol or ""),
                    "FechaSolicitudISO": f_sol.strftime("%Y-%m-%d") if hasattr(f_sol, "strftime") else str(f_sol or "")[:10],
                    "FechaConfirmacion": f_conf.strftime("%d/%m/%Y %H:%M") if hasattr(f_conf, "strftime") else (str(f_conf) if f_conf else None),
                    "ConfirmadoPor": str(r.ConfirmadoPor or "") if r.ConfirmadoPor else None
                }
                mapa_por_folio[item_bd["Folio"]] = item_bd
    except Exception as e:
        print("Aviso listando TiendaSolicitudMembresia:", e)
    finally:
        if conexion:
            conexion.close()

    resultado = list(mapa_por_folio.values())
    if id_cliente is not None:
        resultado = [x for x in resultado if int(x.get("IdCliente") or 0) == int(id_cliente)]
    if estado_pago:
        est_norm = estado_pago.strip().lower()
        resultado = [x for x in resultado if str(x.get("EstadoPago") or "").strip().lower() == est_norm]

    resultado.sort(key=lambda x: int(x.get("IdSolicitud") or 0), reverse=True)
    return resultado


def ObtenerEstadoMembresiaClienteTienda(usuario_sesion):
    """
    Consulta la membresía activa real del cliente en SQL Server (ObtenerMembresiaActivaCliente)
    y sus solicitudes recientes desde la tienda web.
    """
    if not usuario_sesion or not usuario_sesion.get("usuario_id"):
        return {
            "autenticado": False,
            "id_cliente": None,
            "nombre_cliente": None,
            "membresia_activa": None,
            "solicitudes": []
        }

    id_cliente, nombre_cliente = _resolver_cliente_de_sesion(usuario_sesion)
    membresia_activa = None
    if id_cliente:
        ok_m, datos_m = ObtenerMembresiaActivaCliente(int(id_cliente))
        if ok_m and isinstance(datos_m, dict):
            f_ini = datos_m.get("FechaInicio")
            f_fin = datos_m.get("FechaFin") or datos_m.get("FechaVencimiento")
            membresia_activa = {
                "IdClienteMembresia": datos_m.get("IdClienteMembresia"),
                "IdMembresia": datos_m.get("IdMembresia"),
                "NombreMembresia": datos_m.get("NombreMembresia") or datos_m.get("Tipo") or "Membresía Activa",
                "Tipo": datos_m.get("Tipo") or "Estándar",
                "Precio": float(datos_m.get("Precio") or 0.0),
                "FechaInicio": f_ini.strftime("%d/%m/%Y") if hasattr(f_ini, "strftime") else str(f_ini or ""),
                "FechaFin": f_fin.strftime("%d/%m/%Y") if hasattr(f_fin, "strftime") else str(f_fin or ""),
                "DiasRestantes": datos_m.get("DiasRestantes"),
                "Estado": datos_m.get("Estado") or "Activa"
            }

    solicitudes = ListarSolicitudesMembresiaTienda(id_cliente=id_cliente) if id_cliente else []
    return {
        "autenticado": True,
        "id_cliente": id_cliente,
        "nombre_cliente": nombre_cliente,
        "membresia_activa": membresia_activa,
        "solicitudes": solicitudes[:10]
    }


def RegistrarContratacionMembresiaEfectivo(id_membresia, usuario_sesion, notas=""):
    """
    Registra una solicitud de contratación de membresía con pago en Efectivo.
    NO simula un pago electrónico ni activa la membresía antes de recibir el efectivo:
    deja el registro en estado 'Pendiente' para que el administrador o recepcionista
    confirme la recepción del dinero en las instalaciones del gimnasio.
    """
    if not usuario_sesion or not usuario_sesion.get("usuario_id"):
        return False, "Debes iniciar sesión en tu cuenta para contratar una membresía.", None

    plan = _obtener_plan_por_id(id_membresia)
    if not plan:
        return False, "El plan de membresía seleccionado no existe o no está disponible.", None

    id_cliente, nombre_cliente = _resolver_cliente_de_sesion(usuario_sesion)
    if not id_cliente:
        return False, "No se encontró el perfil de cliente asociado a tu cuenta.", None

    # Evitar duplicar solicitudes pendientes idénticas para el mismo cliente y plan
    existentes = ListarSolicitudesMembresiaTienda(id_cliente=id_cliente, estado_pago="Pendiente")
    for sol in existentes:
        if int(sol.get("IdMembresia") or 0) == int(plan["IdMembresia"]) and sol.get("MetodoPago") == "Efectivo":
            return True, (
                f"Ya tienes una solicitud de pago en efectivo pendiente para {plan['TituloPlan']} "
                f"(Folio {sol['Folio']}). Preséntate en recepción para completar tu pago."
            ), sol

    ahora = datetime.now()
    folio = f"MEM-EF-{ahora.strftime('%Y%m%d-%H%M%S')}"
    dias = int(plan.get("DuracionDias") or 30)
    fecha_fin_estimada = (ahora + timedelta(days=max(1, dias))).strftime("%d/%m/%Y")

    registro = {
        "Folio": folio,
        "IdCliente": int(id_cliente),
        "NombreCliente": nombre_cliente,
        "IdUsuario": usuario_sesion.get("usuario_id"),
        "IdMembresia": int(plan["IdMembresia"]),
        "NombreMembresia": plan["NombreMembresia"],
        "TituloPlan": plan["TituloPlan"],
        "DuracionDias": dias,
        "DuracionTexto": plan["DuracionTexto"],
        "Monto": round(float(plan["Precio"]), 2),
        "MetodoPago": "Efectivo",
        "EstadoPago": "Pendiente",
        "EstadoMembresia": "Pendiente de confirmación en recepción",
        "ReferenciaPasarela": None,
        "Ultimos4": None,
        "MarcaTarjeta": None,
        "Notas": (notas or "Pago presencial en efectivo en recepción de World Gym.").strip()[:350],
        "FechaSolicitud": ahora.strftime("%d/%m/%Y %H:%M"),
        "FechaSolicitudISO": ahora.strftime("%Y-%m-%d"),
        "FechaInicioEstimada": ahora.strftime("%d/%m/%Y"),
        "FechaFinEstimada": fecha_fin_estimada,
        "FechaConfirmacion": None,
        "ConfirmadoPor": None
    }

    guardado = _insertar_solicitud_membresia(registro)
    mensaje = (
        f"Solicitud de contratación registrada con folio {folio}. "
        f"Tu pago de C${guardado['Monto']:.2f} en efectivo ha quedado PENDIENTE DE CONFIRMACIÓN. "
        f"Acércate a la recepción de World Gym con tu folio para entregar el efectivo y activar tu membresía inmediatamente."
    )
    return True, mensaje, guardado


def CrearIntentoPagoMembresiaTarjeta(id_membresia, usuario_sesion):
    """
    Inicia una transacción real de pago con tarjeta mediante la API de Stripe (PaymentIntent).
    Si las credenciales de la pasarela no están configuradas en el servidor, rechaza cualquier
    simulación ficticia e informa con claridad qué variables se requieren.
    """
    if not usuario_sesion or not usuario_sesion.get("usuario_id"):
        return False, "Debes iniciar sesión en tu cuenta para contratar una membresía.", None

    plan = _obtener_plan_por_id(id_membresia)
    if not plan:
        return False, "El plan de membresía seleccionado no existe.", None

    config = ObtenerConfigPasarelaPago()
    if not config["habilitada"]:
        return False, (
            "La pasarela de pago electrónico con tarjeta aún no tiene credenciales activas en este entorno. "
            "Para habilitar cobros reales con tarjeta, configure STRIPE_PUBLIC_KEY y STRIPE_SECRET_KEY en el archivo .env "
            "del servidor, o seleccione el método de pago en Efectivo en recepción."
        ), {"pasarela": config, "plan": plan}

    id_cliente, nombre_cliente = _resolver_cliente_de_sesion(usuario_sesion)
    secret_key = (os.getenv("STRIPE_SECRET_KEY") or os.getenv("PAYMENT_GATEWAY_SECRET_KEY") or "").strip()
    moneda = (os.getenv("STRIPE_CURRENCY") or "nio").strip().lower()
    monto_centavos = int(round(float(plan["Precio"]) * 100))

    payload_form = urllib_parse.urlencode({
        "amount": str(monto_centavos),
        "currency": moneda,
        "description": f"Membresía World Gym - {plan['TituloPlan']} ({plan['DuracionTexto']}) - Cliente #{id_cliente}",
        "metadata[id_cliente]": str(id_cliente),
        "metadata[nombre_cliente]": str(nombre_cliente),
        "metadata[id_membresia]": str(plan["IdMembresia"]),
        "metadata[titulo_plan]": str(plan["TituloPlan"]),
        "automatic_payment_methods[enabled]": "true"
    }).encode("utf-8")

    auth_header = base64.b64encode(f"{secret_key}:".encode("utf-8")).decode("ascii")
    req = urllib_request.Request(
        "https://api.stripe.com/v1/payment_intents",
        data=payload_form,
        headers={
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method="POST"
    )

    try:
        with urllib_request.urlopen(req, timeout=12) as resp:
            datos_stripe = json.loads(resp.read().decode("utf-8"))
            return True, "Intento de pago creado en la pasarela.", {
                "client_secret": datos_stripe.get("client_secret"),
                "payment_intent_id": datos_stripe.get("id"),
                "public_key": config["public_key"],
                "monto": float(plan["Precio"]),
                "moneda": moneda.upper(),
                "plan": plan
            }
    except urllib_error.HTTPError as he:
        try:
            err_json = json.loads(he.read().decode("utf-8"))
            msg_stripe = err_json.get("error", {}).get("message") or str(he)
        except Exception:
            msg_stripe = str(he)
        return False, f"La pasarela de pagos rechazó la solicitud: {msg_stripe}", None
    except Exception as e:
        return False, f"No se pudo conectar con la pasarela de pagos: {str(e)}", None


def ConfirmarContratacionMembresiaTarjeta(id_membresia, payment_intent_id, usuario_sesion, payload_original=None):
    """
    Verifica directamente con la pasarela de pagos (Stripe API) que el PaymentIntent tenga
    estado 'succeeded'. Una vez verificado el cobro electrónico real:
    1. Activa/actualiza la membresía del cliente ejecutando AsignarMembresia (SpAsignarMembresia).
    2. Registra el pago oficial en la tabla Pagos con método 'Tarjeta'.
    3. Guarda la transacción confirmada en TiendaSolicitudMembresia (sin guardar jamás PAN ni CVV).
    """
    if ContienenDatosCrudosTarjeta(payload_original or {}):
        return False, (
            "Por seguridad PCI-DSS, el servidor de World Gym nunca recibe ni almacena números completos de tarjeta "
            "ni códigos de seguridad (CVV/CVC). El pago debe procesarse exclusivamente mediante el token de la pasarela."
        ), None

    if not usuario_sesion or not usuario_sesion.get("usuario_id"):
        return False, "Debes iniciar sesión en tu cuenta para confirmar la contratación.", None

    payment_intent_id = (payment_intent_id or "").strip()
    if not payment_intent_id or not payment_intent_id.startswith("pi_"):
        return False, "No se recibió un identificador de transacción válido (PaymentIntent) de la pasarela de pago.", None

    config = ObtenerConfigPasarelaPago()
    if not config["habilitada"]:
        return False, "La pasarela de pago con tarjeta no está configurada en el servidor.", None

    plan = _obtener_plan_por_id(id_membresia)
    if not plan:
        return False, "El plan de membresía seleccionado no existe.", None

    # Evitar reprocesar un mismo PaymentIntent ya confirmado
    existentes = ListarSolicitudesMembresiaTienda()
    for s in existentes:
        if s.get("ReferenciaPasarela") == payment_intent_id and s.get("EstadoPago") == "Confirmado":
            return True, f"Tu membresía {plan['TituloPlan']} ya fue activada y confirmada (Folio {s['Folio']}).", s

    secret_key = (os.getenv("STRIPE_SECRET_KEY") or os.getenv("PAYMENT_GATEWAY_SECRET_KEY") or "").strip()
    auth_header = base64.b64encode(f"{secret_key}:".encode("utf-8")).decode("ascii")
    url_verify = f"https://api.stripe.com/v1/payment_intents/{urllib_parse.quote(payment_intent_id)}?expand[]=payment_method"
    req = urllib_request.Request(
        url_verify,
        headers={"Authorization": f"Basic {auth_header}"},
        method="GET"
    )

    try:
        with urllib_request.urlopen(req, timeout=12) as resp:
            pi_data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return False, f"No se pudo verificar el estado de la transacción con la pasarela: {str(e)}", None

    estado_pi = pi_data.get("status")
    if estado_pi != "succeeded":
        return False, f"El pago aún no figura como completado en la pasarela (estado actual: {estado_pi}).", None

    pm_info = pi_data.get("payment_method") if isinstance(pi_data.get("payment_method"), dict) else {}
    card_info = pm_info.get("card") if isinstance(pm_info.get("card"), dict) else {}
    ultimos4 = str(card_info.get("last4") or "")[:4] or None
    marca_tarjeta = str(card_info.get("brand") or "Tarjeta").upper()[:30]

    id_cliente, nombre_cliente = _resolver_cliente_de_sesion(usuario_sesion)
    id_metodo_tarjeta = _resolver_id_metodo_pago("Tarjeta")
    monto = round(float(plan["Precio"]), 2)

    ok_asig, msg_asig = AsignarMembresia(int(id_cliente), int(plan["IdMembresia"]), int(id_metodo_tarjeta), monto)
    if not ok_asig:
        return False, f"El pago fue verificado, pero ocurrió un aviso al activar la membresía en base de datos: {msg_asig}", None

    ahora = datetime.now()
    dias = int(plan.get("DuracionDias") or 30)
    fecha_fin = (ahora + timedelta(days=max(1, dias))).strftime("%d/%m/%Y")
    folio = f"MEM-TC-{ahora.strftime('%Y%m%d-%H%M%S')}"

    registro = {
        "Folio": folio,
        "IdCliente": int(id_cliente),
        "NombreCliente": nombre_cliente,
        "IdUsuario": usuario_sesion.get("usuario_id"),
        "IdMembresia": int(plan["IdMembresia"]),
        "NombreMembresia": plan["NombreMembresia"],
        "TituloPlan": plan["TituloPlan"],
        "DuracionDias": dias,
        "DuracionTexto": plan["DuracionTexto"],
        "Monto": monto,
        "MetodoPago": "Tarjeta",
        "EstadoPago": "Confirmado",
        "EstadoMembresia": "Activa",
        "ReferenciaPasarela": payment_intent_id,
        "Ultimos4": ultimos4,
        "MarcaTarjeta": marca_tarjeta,
        "Notas": f"Pago electrónico verificado por pasarela ({marca_tarjeta} {'•••• ' + ultimos4 if ultimos4 else ''}).".strip(),
        "FechaSolicitud": ahora.strftime("%d/%m/%Y %H:%M"),
        "FechaSolicitudISO": ahora.strftime("%Y-%m-%d"),
        "FechaInicioEstimada": ahora.strftime("%d/%m/%Y"),
        "FechaFinEstimada": fecha_fin,
        "FechaConfirmacion": ahora.strftime("%d/%m/%Y %H:%M"),
        "ConfirmadoPor": "Pasarela Electrónica"
    }

    guardado = _insertar_solicitud_membresia(registro)
    return True, f"¡Pago confirmado y membresía {plan['TituloPlan']} activada exitosamente! Folio {folio}.", guardado


def ConfirmarPagoEfectivoMembresiaAdmin(id_solicitud, usuario_admin="Administración"):
    """
    Permite al administrador o recepcionista confirmar que recibió el dinero en efectivo
    de una solicitud pendiente:
    1. Ejecuta AsignarMembresia (SpAsignarMembresia) para activar/actualizar la membresía del cliente
       y crear el recibo oficial en la tabla Pagos.
    2. Actualiza el estado de la solicitud en TiendaSolicitudMembresia a 'Confirmado' y 'Activa'.
    """
    todas = ListarSolicitudesMembresiaTienda()
    solicitud = next((x for x in todas if int(x.get("IdSolicitud") or 0) == int(id_solicitud or 0)), None)
    if not solicitud:
        return False, "No se encontró la solicitud de membresía indicada.", None

    if str(solicitud.get("EstadoPago") or "").lower() == "confirmado":
        return False, f"La solicitud {solicitud.get('Folio')} ya fue confirmada anteriormente.", solicitud

    id_cliente = int(solicitud["IdCliente"])
    id_membresia = int(solicitud["IdMembresia"])
    monto = float(solicitud["Monto"])
    id_metodo_efectivo = _resolver_id_metodo_pago("Efectivo")

    ok_asig, res_asig = AsignarMembresia(id_cliente, id_membresia, id_metodo_efectivo, monto)
    if not ok_asig:
        return False, f"No se pudo activar la membresía en la base de datos: {res_asig}", None

    ahora_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    conexion = None
    try:
        AsegurarTablaSolicitudesMembresia()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("""
                UPDATE TiendaSolicitudMembresia
                SET EstadoPago = 'Confirmado',
                    EstadoMembresia = 'Activa',
                    FechaConfirmacion = GETDATE(),
                    ConfirmadoPor = ?
                WHERE IdSolicitud = ? OR Folio = ?
            """, (usuario_admin, int(id_solicitud), solicitud["Folio"]))
            conexion.commit()
    except Exception as e:
        print("Aviso actualizando TiendaSolicitudMembresia:", e)
    finally:
        if conexion:
            conexion.close()

    lista_local = _cargar_solicitudes_membresia_local()
    for item in lista_local:
        if int(item.get("IdSolicitud") or 0) == int(id_solicitud) or item.get("Folio") == solicitud["Folio"]:
            item["EstadoPago"] = "Confirmado"
            item["EstadoMembresia"] = "Activa"
            item["FechaConfirmacion"] = ahora_str
            item["ConfirmadoPor"] = usuario_admin
            solicitud = item
    _guardar_solicitudes_membresia_local(lista_local)

    solicitud["EstadoPago"] = "Confirmado"
    solicitud["EstadoMembresia"] = "Activa"
    solicitud["FechaConfirmacion"] = ahora_str
    solicitud["ConfirmadoPor"] = usuario_admin

    return True, (
        f"Pago en efectivo confirmado correctamente. Se activó el {solicitud['TituloPlan']} "
        f"para {solicitud['NombreCliente']} y se registró la transacción en el Historial de Pagos."
    ), solicitud


def CancelarSolicitudMembresiaAdmin(id_solicitud, usuario_admin="Administración"):
    """
    Permite al administrador descartar/cancelar una solicitud en efectivo no pagada.
    """
    todas = ListarSolicitudesMembresiaTienda()
    solicitud = next((x for x in todas if int(x.get("IdSolicitud") or 0) == int(id_solicitud or 0)), None)
    if not solicitud:
        return False, "No se encontró la solicitud indicada."

    if str(solicitud.get("EstadoPago") or "").lower() == "confirmado":
        return False, "No se puede cancelar una solicitud cuyo pago ya fue confirmado."

    conexion = None
    try:
        AsegurarTablaSolicitudesMembresia()
        conexion = ConectarBD()
        if conexion:
            cursor = conexion.cursor()
            cursor.execute("""
                UPDATE TiendaSolicitudMembresia
                SET EstadoPago = 'Cancelado',
                    EstadoMembresia = 'Cancelada',
                    ConfirmadoPor = ?
                WHERE IdSolicitud = ? OR Folio = ?
            """, (usuario_admin, int(id_solicitud), solicitud["Folio"]))
            conexion.commit()
    except Exception as e:
        print("Aviso cancelando solicitud:", e)
    finally:
        if conexion:
            conexion.close()

    lista_local = _cargar_solicitudes_membresia_local()
    for item in lista_local:
        if int(item.get("IdSolicitud") or 0) == int(id_solicitud) or item.get("Folio") == solicitud["Folio"]:
            item["EstadoPago"] = "Cancelado"
            item["EstadoMembresia"] = "Cancelada"
            item["ConfirmadoPor"] = usuario_admin
    _guardar_solicitudes_membresia_local(lista_local)
    return True, f"Solicitud {solicitud['Folio']} marcada como cancelada."

