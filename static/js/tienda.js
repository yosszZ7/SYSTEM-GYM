/**
 * WORLDGYM STORE — Controlador Frontend de Tienda Virtual y Carrito de Compras
 */

(function () {
    const CART_STORAGE_KEY = 'worldgym_store_cart_v1';
    let catalogoProductos = Array.isArray(window.CATALOGO_INICIAL) ? window.CATALOGO_INICIAL : [];
    let carrito = [];
    let estadoFiltros = {
        busqueda: '',
        categoria: 'Todos',
        orden: 'destacados',
        disponibilidad: 'todos',
        origen: 'todos'
    };

    function formatearCordobas(monto) {
        const num = Number(monto || 0);
        return 'C$' + num.toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function cargarCarrito() {
        try {
            const guardado = localStorage.getItem(CART_STORAGE_KEY);
            carrito = guardado ? JSON.parse(guardado) : [];
            if (!Array.isArray(carrito)) carrito = [];
        } catch (e) {
            carrito = [];
        }
        sincronizarCarritoConStock();
    }

    function guardarCarrito() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
        } catch (e) {
            console.error('Error al guardar carrito:', e);
        }
        renderizarCarrito();
    }

    function sincronizarCarritoConStock() {
        const mapa = new Map(catalogoProductos.map(p => [Number(p.IdProducto), p]));
        carrito = carrito.filter(item => {
            const p = mapa.get(Number(item.IdProducto));
            if (!p || Number(p.Stock) <= 0) return false;
            if (item.Cantidad > Number(p.Stock)) {
                item.Cantidad = Number(p.Stock);
            }
            item.Precio = Number(p.Precio);
            item.PrecioAnterior = Number(p.PrecioAnterior || p.Precio);
            item.NombreProducto = p.NombreProducto;
            item.Marca = p.Marca;
            item.Presentacion = p.Presentacion;
            item.ImagenUrl = p.ImagenUrl;
            item.StockMax = Number(p.Stock);
            item.EsDemo = Boolean(p.EsDemo);
            return item.Cantidad > 0;
        });
    }

    window.mostrarToastTienda = function (mensaje, tipo) {
        const container = document.getElementById('storeToastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'store-toast';
        if (tipo === 'error') {
            toast.style.borderLeftColor = '#F04438';
        } else if (tipo === 'warning') {
            toast.style.borderLeftColor = '#F79009';
        }
        const icon = tipo === 'error' ? 'fa-circle-exclamation' : (tipo === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check');
        toast.innerHTML = `<i class="fas ${icon}" style="color: ${tipo === 'error' ? '#F04438' : '#F58220'};"></i> <span>${mensaje}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.25s ease';
            setTimeout(() => toast.remove(), 260);
        }, 3200);
    };

    window.agregarAlCarrito = function (idProducto, cantidadAgregar) {
        const id = Number(idProducto);
        const cant = Number(cantidadAgregar || 1);
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === id);

        if (!prod) {
            mostrarToastTienda('Producto no encontrado en el catálogo.', 'error');
            return;
        }
        const stockDisponible = Number(prod.Stock || 0);
        if (stockDisponible <= 0) {
            mostrarToastTienda('Este producto se encuentra agotado.', 'error');
            return;
        }

        const existente = carrito.find(i => Number(i.IdProducto) === id);
        const cantidadActual = existente ? Number(existente.Cantidad) : 0;

        if (cantidadActual + cant > stockDisponible) {
            mostrarToastTienda(`Solo hay ${stockDisponible} unidades disponibles de "${prod.NombreProducto}".`, 'warning');
            return;
        }

        if (existente) {
            existente.Cantidad += cant;
        } else {
            carrito.push({
                IdProducto: id,
                NombreProducto: prod.NombreProducto,
                Marca: prod.Marca,
                Presentacion: prod.Presentacion,
                Precio: Number(prod.Precio),
                PrecioAnterior: Number(prod.PrecioAnterior || prod.Precio),
                ImagenUrl: prod.ImagenUrl,
                Cantidad: cant,
                StockMax: stockDisponible,
                EsDemo: Boolean(prod.EsDemo)
            });
        }

        guardarCarrito();
        mostrarToastTienda(`"${prod.NombreProducto}" agregado al carrito`, 'success');
    };

    window.cambiarCantidadCarrito = function (idProducto, delta) {
        const id = Number(idProducto);
        const idx = carrito.findIndex(i => Number(i.IdProducto) === id);
        if (idx === -1) return;

        const item = carrito[idx];
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === id);
        const maxStock = prod ? Number(prod.Stock) : Number(item.StockMax || 1);

        const nuevaCantidad = item.Cantidad + Number(delta);
        if (nuevaCantidad <= 0) {
            carrito.splice(idx, 1);
        } else if (nuevaCantidad > maxStock) {
            mostrarToastTienda(`Existencia máxima disponible: ${maxStock} uds.`, 'warning');
            return;
        } else {
            item.Cantidad = nuevaCantidad;
        }
        guardarCarrito();
    };

    window.eliminarDelCarrito = function (idProducto) {
        const id = Number(idProducto);
        carrito = carrito.filter(i => Number(i.IdProducto) !== id);
        guardarCarrito();
    };

    window.vaciarCarrito = function () {
        carrito = [];
        guardarCarrito();
    };

    window.abrirCarrito = function () {
        document.getElementById('storeCartBackdrop')?.classList.add('open');
        document.getElementById('storeCartDrawer')?.classList.add('open');
    };

    window.cerrarCarrito = function () {
        document.getElementById('storeCartBackdrop')?.classList.remove('open');
        document.getElementById('storeCartDrawer')?.classList.remove('open');
    };

    function renderizarCarrito() {
        const badge = document.getElementById('storeCartBadge');
        const lista = document.getElementById('storeCartItems');
        const subtotalEl = document.getElementById('storeCartSubtotal');
        const descuentoEl = document.getElementById('storeCartDiscount');
        const rowDescuentoEl = document.getElementById('storeCartDiscountRow');
        const totalEl = document.getElementById('storeCartTotal');
        const btnCheckout = document.getElementById('storeCheckoutBtn');

        const totalUnidades = carrito.reduce((acc, item) => acc + Number(item.Cantidad || 0), 0);
        if (badge) badge.textContent = String(totalUnidades);

        if (!lista) return;

        if (carrito.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 48px 16px; color: #6E7785;">
                    <i class="fas fa-cart-shopping" style="font-size: 40px; color: #CBD5E1; margin-bottom: 12px; display: block;"></i>
                    <strong style="display: block; color: #1E2430; font-size: 15px; margin-bottom: 4px;">Tu carrito está vacío</strong>
                    <span style="font-size: 13px;">Explora el catálogo de suplementos y agrega tus productos favoritos.</span>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = 'C$0.00';
            if (descuentoEl) descuentoEl.textContent = '-C$0.00';
            if (rowDescuentoEl) rowDescuentoEl.style.display = 'none';
            if (totalEl) totalEl.textContent = 'C$0.00';
            if (btnCheckout) btnCheckout.disabled = true;
            return;
        }

        let subtotalOriginal = 0;
        let totalPagar = 0;

        lista.innerHTML = carrito.map(item => {
            const precioUnit = Number(item.Precio || 0);
            const precioAnt = Number(item.PrecioAnterior || precioUnit);
            const subItem = precioUnit * item.Cantidad;
            subtotalOriginal += precioAnt * item.Cantidad;
            totalPagar += subItem;

            return `
                <div class="store-cart-item">
                    <img src="${item.ImagenUrl}" alt="${item.NombreProducto}" class="store-cart-item-img" onerror="this.src='/static/image/productos/default_suplemento.svg'">
                    <div class="store-cart-item-info">
                        <h4 class="store-cart-item-title" title="${item.NombreProducto}">${item.NombreProducto}</h4>
                        <span class="store-cart-item-brand">${item.Marca} ${item.EsDemo ? '• [DEMO]' : ''}</span>
                        <div class="store-cart-item-bottom">
                            <div class="store-cart-qty-controls">
                                <button type="button" class="store-qty-btn" onclick="cambiarCantidadCarrito(${item.IdProducto}, -1)" title="Disminuir">-</button>
                                <span class="store-qty-val">${item.Cantidad}</span>
                                <button type="button" class="store-qty-btn" onclick="cambiarCantidadCarrito(${item.IdProducto}, 1)" title="Aumentar">+</button>
                            </div>
                            <span class="store-cart-item-price">${formatearCordobas(subItem)}</span>
                        </div>
                    </div>
                    <button type="button" class="store-cart-remove" onclick="eliminarDelCarrito(${item.IdProducto})" title="Eliminar producto">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join('');

        const ahorro = Math.max(0, subtotalOriginal - totalPagar);
        if (subtotalEl) subtotalEl.textContent = formatearCordobas(subtotalOriginal);
        if (rowDescuentoEl) {
            rowDescuentoEl.style.display = ahorro > 0.01 ? 'flex' : 'none';
        }
        if (descuentoEl) descuentoEl.textContent = '-' + formatearCordobas(ahorro);
        if (totalEl) totalEl.textContent = formatearCordobas(totalPagar);
        if (btnCheckout) btnCheckout.disabled = false;
    }

    function crearHtmlTarjeta(p) {
        const agotado = Number(p.Stock) <= 0;
        const enOferta = Boolean(p.EnOferta) && Number(p.Descuento) > 0;
        const mostrarPrecioAnterior = enOferta && Number(p.PrecioAnterior) > Number(p.Precio);

        return `
            <article class="store-card" data-id="${p.IdProducto}">
                <div class="store-card-badges">
                    <div class="store-badge-left">
                        ${enOferta ? `<span class="store-offer-badge">OFERTA</span>` : ''}
                        ${enOferta ? `<span class="store-discount-pill">-${p.Descuento}%</span>` : ''}
                    </div>
                    <div>
                        ${p.EsDemo
                            ? `<span class="store-demo-badge" title="Datos de demostración">DEMOSTRACIÓN</span>`
                            : `<span class="store-official-badge" title="Producto oficial en inventario del gimnasio">OFICIAL</span>`
                        }
                    </div>
                </div>

                <div class="store-card-image-wrap" onclick="abrirDetalleProducto(${p.IdProducto})">
                    <img src="${p.ImagenUrl}" alt="${p.NombreProducto}" loading="lazy" onerror="this.src='/static/image/productos/default_suplemento.svg'">
                </div>

                <div class="store-card-body">
                    <div class="store-card-meta-row">
                        <span class="store-card-brand">${p.Marca || 'WORLDGYM'}</span>
                        <span class="store-card-category">${p.CategoriaTienda || p.Categoria}</span>
                    </div>

                    <h3 class="store-card-title" onclick="abrirDetalleProducto(${p.IdProducto})">${p.NombreProducto}</h3>
                    <p class="store-card-presentation">${p.Presentacion || 'Presentación estándar'}</p>

                    <div class="store-stock-indicator ${p.ClaseStock || 'disponible'}">
                        <span class="store-stock-dot"></span>
                        <span>${p.EstadoStock}</span>
                    </div>

                    <div class="store-card-prices">
                        <span class="store-price-current">${formatearCordobas(p.Precio)}</span>
                        ${mostrarPrecioAnterior ? `<span class="store-price-old">${formatearCordobas(p.PrecioAnterior)}</span>` : ''}
                    </div>

                    <div class="store-card-actions">
                        <button type="button" class="store-add-btn"
                                onclick="agregarAlCarrito(${p.IdProducto}, 1)"
                                ${agotado ? 'disabled' : ''}>
                            <i class="fas ${agotado ? 'fa-ban' : 'fa-plus'}"></i>
                            <span>${agotado ? 'Agotado' : 'Agregar al Carrito'}</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function aplicarFiltrosYRenderizar() {
        const gridDestacados = document.getElementById('storeFeaturedGrid');
        const seccionDestacados = document.getElementById('storeFeaturedSection');
        const gridCatalogo = document.getElementById('storeCatalogGrid');
        const contadorEl = document.getElementById('storeResultsCounter');

        // 1. Renderizar sección de Destacados y Ofertas Especiales
        if (gridDestacados && seccionDestacados) {
            const destacados = catalogoProductos.filter(p => p.Destacado || p.EnOferta).slice(0, 4);
            if (estadoFiltros.busqueda.trim() !== '' || estadoFiltros.categoria !== 'Todos') {
                seccionDestacados.style.display = 'none';
            } else if (destacados.length > 0) {
                seccionDestacados.style.display = 'block';
                gridDestacados.innerHTML = destacados.map(crearHtmlTarjeta).join('');
            } else {
                seccionDestacados.style.display = 'none';
            }
        }

        // 2. Filtrar catálogo principal
        const q = estadoFiltros.busqueda.trim().toLowerCase();
        let filtrados = catalogoProductos.filter(p => {
            if (q) {
                const texto = `${p.NombreProducto} ${p.Marca} ${p.Categoria} ${p.CategoriaTienda} ${p.Presentacion} ${p.Descripcion}`.toLowerCase();
                if (!texto.includes(q)) return false;
            }
            if (estadoFiltros.categoria !== 'Todos') {
                const catProd = (p.CategoriaTienda || p.Categoria || '').toLowerCase();
                const catFiltro = estadoFiltros.categoria.toLowerCase();
                if (catProd !== catFiltro && !(p.Categoria || '').toLowerCase().includes(catFiltro)) {
                    return false;
                }
            }
            if (estadoFiltros.disponibilidad === 'disponibles' && Number(p.Stock) <= 0) {
                return false;
            }
            if (estadoFiltros.disponibilidad === 'ofertas' && !p.EnOferta) {
                return false;
            }
            if (estadoFiltros.origen === 'oficial' && p.EsDemo) {
                return false;
            }
            if (estadoFiltros.origen === 'demo' && !p.EsDemo) {
                return false;
            }
            return true;
        });

        // 3. Ordenamiento
        filtrados.sort((a, b) => {
            if (estadoFiltros.orden === 'precio_asc') {
                return Number(a.Precio) - Number(b.Precio);
            }
            if (estadoFiltros.orden === 'precio_desc') {
                return Number(b.Precio) - Number(a.Precio);
            }
            if (estadoFiltros.orden === 'descuento_desc') {
                return Number(b.Descuento || 0) - Number(a.Descuento || 0);
            }
            if (estadoFiltros.orden === 'nombre_asc') {
                return String(a.NombreProducto).localeCompare(String(b.NombreProducto));
            }
            // Por defecto: Oficiales primero, luego Destacados/Ofertas
            if (a.EsDemo !== b.EsDemo) return a.EsDemo ? 1 : -1;
            if (a.Destacado !== b.Destacado) return a.Destacado ? -1 : 1;
            return Number(b.Descuento || 0) - Number(a.Descuento || 0);
        });

        if (contadorEl) {
            contadorEl.innerHTML = `Mostrando <strong>${filtrados.length}</strong> producto${filtrados.length === 1 ? '' : 's'}`;
        }

        if (!gridCatalogo) return;

        if (filtrados.length === 0) {
            gridCatalogo.innerHTML = `
                <div style="grid-column: 1 / -1; background: #FFFFFF; border: 1px solid #E6E9EF; border-radius: 16px; padding: 48px 20px; text-align: center;">
                    <i class="fas fa-magnifying-glass" style="font-size: 36px; color: #CBD5E1; margin-bottom: 12px; display: block;"></i>
                    <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #181D26;">No encontramos productos con esos filtros</h3>
                    <p style="margin: 0 0 16px 0; font-size: 13.5px; color: #6E7785;">Intenta con otro término de búsqueda o restablece las categorías.</p>
                    <button type="button" class="store-btn-cta" onclick="restablecerFiltrosTienda()" style="padding: 9px 20px; font-size: 13px;">
                        Ver todo el catálogo
                    </button>
                </div>
            `;
            return;
        }

        gridCatalogo.innerHTML = filtrados.map(crearHtmlTarjeta).join('');
    }

    window.seleccionarCategoriaTienda = function (categoria) {
        estadoFiltros.categoria = categoria;
        document.querySelectorAll('.store-cat-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cat') === categoria);
        });
        aplicarFiltrosYRenderizar();
    };

    window.filtrarSoloOfertas = function () {
        estadoFiltros.disponibilidad = 'ofertas';
        const selDisp = document.getElementById('storeFilterAvailability');
        if (selDisp) selDisp.value = 'ofertas';
        aplicarFiltrosYRenderizar();
        document.getElementById('catalogoSection')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.restablecerFiltrosTienda = function () {
        estadoFiltros = {
            busqueda: '',
            categoria: 'Todos',
            orden: 'destacados',
            disponibilidad: 'todos',
            origen: 'todos'
        };
        const inputSearch = document.getElementById('storeSearchInput');
        const btnClear = document.getElementById('storeSearchClear');
        const selSort = document.getElementById('storeSortSelect');
        const selDisp = document.getElementById('storeFilterAvailability');
        const selOrigen = document.getElementById('storeFilterOrigin');

        if (inputSearch) inputSearch.value = '';
        if (btnClear) btnClear.style.display = 'none';
        if (selSort) selSort.value = 'destacados';
        if (selDisp) selDisp.value = 'todos';
        if (selOrigen) selOrigen.value = 'todos';

        document.querySelectorAll('.store-cat-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cat') === 'Todos');
        });
        aplicarFiltrosYRenderizar();
    };

    window.abrirDetalleProducto = function (idProducto) {
        const prod = catalogoProductos.find(p => Number(p.IdProducto) === Number(idProducto));
        if (!prod) return;

        const modal = document.getElementById('storeProductModal');
        const content = document.getElementById('storeProductModalContent');
        if (!modal || !content) return;

        const agotado = Number(prod.Stock) <= 0;
        const enOferta = Boolean(prod.EnOferta) && Number(prod.Descuento) > 0;

        content.innerHTML = `
            <div class="store-detail-grid">
                <div class="store-detail-img-box">
                    <img src="${prod.ImagenUrl}" alt="${prod.NombreProducto}" onerror="this.src='/static/image/productos/default_suplemento.svg'">
                </div>
                <div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
                        <span class="store-card-category">${prod.CategoriaTienda || prod.Categoria}</span>
                        ${enOferta ? `<span class="store-offer-badge">OFERTA -${prod.Descuento}%</span>` : ''}
                        ${prod.EsDemo
                            ? `<span class="store-demo-badge">DEMOSTRACIÓN</span>`
                            : `<span class="store-official-badge">CATÁLOGO OFICIAL</span>`
                        }
                    </div>
                    <span class="store-card-brand" style="display: block; margin-bottom: 4px;">${prod.Marca}</span>
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #181D26;">${prod.NombreProducto}</h2>
                    <p style="margin: 0 0 12px 0; font-size: 13.5px; font-weight: 600; color: #F58220;">${prod.Presentacion}</p>
                    <p style="margin: 0 0 16px 0; font-size: 13.5px; color: #6E7785; line-height: 1.55;">${prod.Descripcion}</p>

                    <div class="store-stock-indicator ${prod.ClaseStock}" style="margin-bottom: 14px;">
                        <span class="store-stock-dot"></span>
                        <span>${prod.EstadoStock}</span>
                    </div>

                    <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px;">
                        <span style="font-size: 26px; font-weight: 900; color: #F58220;">${formatearCordobas(prod.Precio)}</span>
                        ${enOferta && Number(prod.PrecioAnterior) > Number(prod.Precio)
                            ? `<span style="font-size: 15px; color: #94A3B8; text-decoration: line-through; font-weight: 600;">${formatearCordobas(prod.PrecioAnterior)}</span>`
                            : ''
                        }
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="store-add-btn" style="height: 44px; font-size: 14px;"
                                onclick="agregarAlCarrito(${prod.IdProducto}, 1); cerrarModalProducto();"
                                ${agotado ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            <span>${agotado ? 'Producto Agotado' : 'Agregar al Carrito'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('open');
    };

    window.cerrarModalProducto = function () {
        document.getElementById('storeProductModal')?.classList.remove('open');
    };

    window.cerrarModalComprobante = function () {
        document.getElementById('storeReceiptModal')?.classList.remove('open');
    };

    window.confirmarCompraTienda = async function () {
        if (carrito.length === 0) return;

        const btn = document.getElementById('storeCheckoutBtn');
        const notasInput = document.getElementById('storeOrderNotes');
        const notas = notasInput ? notasInput.value.trim() : '';

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Procesando pedido...`;
        }

        try {
            const resp = await fetch('/api/tienda/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: carrito.map(i => ({ IdProducto: i.IdProducto, Cantidad: i.Cantidad })),
                    notas: notas
                })
            });
            const data = await resp.json();

            if (!data.success) {
                mostrarToastTienda(data.error || 'No se pudo procesar el pedido.', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fas fa-check-circle"></i> Confirmar Pedido en Gimnasio`;
                }
                return;
            }

            // Actualizar catálogo en memoria con el nuevo stock devuelto por el servidor
            if (Array.isArray(data.catalogo)) {
                catalogoProductos = data.catalogo;
            }
            carrito = [];
            if (notasInput) notasInput.value = '';
            guardarCarrito();
            aplicarFiltrosYRenderizar();
            cerrarCarrito();

            // Mostrar comprobante de pedido
            mostrarComprobantePedido(data.comprobante, data.mensaje);
        } catch (err) {
            console.error(err);
            mostrarToastTienda('Error de conexión al procesar el pedido.', 'error');
        } finally {
            if (btn) {
                btn.disabled = carrito.length === 0;
                btn.innerHTML = `<i class="fas fa-check-circle"></i> Confirmar Pedido en Gimnasio`;
            }
        }
    };

    function mostrarComprobantePedido(comp, mensaje) {
        const modal = document.getElementById('storeReceiptModal');
        const body = document.getElementById('storeReceiptContent');
        if (!modal || !body || !comp) return;

        const filasHtml = (comp.Items || []).map(item => `
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #E6E9EF; font-size: 13px;">
                    <strong>${item.NombreProducto}</strong>
                    <small style="display: block; color: #6E7785;">${item.Marca} ${item.EsDemo ? '(DEMO)' : ''}</small>
                </td>
                <td style="padding: 8px 8px; border-bottom: 1px solid #E6E9EF; text-align: center; font-weight: 700; font-size: 13px;">
                    x${item.Cantidad}
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid #E6E9EF; text-align: right; font-weight: 800; font-size: 13px;">
                    ${formatearCordobas(item.Subtotal)}
                </td>
            </tr>
        `).join('');

        body.innerHTML = `
            <div style="text-align: center; margin-bottom: 18px;">
                <div style="width: 54px; height: 54px; border-radius: 50%; background: #ECFDF3; color: #12B76A; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 10px;">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 900;">¡Pedido Confirmado!</h2>
                <p style="margin: 0; font-size: 13px; color: #6E7785;">${mensaje}</p>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E6E9EF; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #6E7785;">Folio de Pedido:</span>
                    <strong style="color: #181D26;">${comp.Folio}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="color: #6E7785;">Fecha y Hora:</span>
                    <strong>${comp.Fecha}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #6E7785;">Cliente:</span>
                    <strong>${comp.Cliente}</strong>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                    <tr style="border-bottom: 2px solid #E6E9EF; font-size: 11px; color: #6E7785; text-transform: uppercase;">
                        <th style="text-align: left; padding-bottom: 6px;">Producto</th>
                        <th style="text-align: center; padding-bottom: 6px;">Cant.</th>
                        <th style="text-align: right; padding-bottom: 6px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHtml}
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 900; padding-top: 8px; margin-bottom: 18px;">
                <span>Total a Pagar en Recepción:</span>
                <span style="color: #F58220;">${formatearCordobas(comp.Total)}</span>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button type="button" class="store-add-btn" onclick="cerrarModalComprobante()">
                    <i class="fas fa-check"></i> Entendido
                </button>
            </div>
        `;
        modal.classList.add('open');
    }

    document.addEventListener('DOMContentLoaded', function () {
        cargarCarrito();
        aplicarFiltrosYRenderizar();
        renderizarCarrito();

        const searchInput = document.getElementById('storeSearchInput');
        const clearBtn = document.getElementById('storeSearchClear');
        const sortSelect = document.getElementById('storeSortSelect');
        const availSelect = document.getElementById('storeFilterAvailability');
        const originSelect = document.getElementById('storeFilterOrigin');
        const userBtn = document.getElementById('storeUserBtn');
        const userDropdown = document.getElementById('storeUserDropdown');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                estadoFiltros.busqueda = this.value;
                if (clearBtn) clearBtn.style.display = this.value ? 'block' : 'none';
                aplicarFiltrosYRenderizar();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (searchInput) searchInput.value = '';
                this.style.display = 'none';
                estadoFiltros.busqueda = '';
                aplicarFiltrosYRenderizar();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                estadoFiltros.orden = this.value;
                aplicarFiltrosYRenderizar();
            });
        }

        if (availSelect) {
            availSelect.addEventListener('change', function () {
                estadoFiltros.disponibilidad = this.value;
                aplicarFiltrosYRenderizar();
            });
        }

        if (originSelect) {
            originSelect.addEventListener('change', function () {
                estadoFiltros.origen = this.value;
                aplicarFiltrosYRenderizar();
            });
        }

        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                userDropdown.classList.toggle('open');
            });
            document.addEventListener('click', function () {
                userDropdown.classList.remove('open');
            });
        }
    });
})();
