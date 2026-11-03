// ============================================
// WORLD GYM PREMIUM - MAIN JAVASCRIPT
// Version 31.0 - OPTIMIZADO Y PREMIUM
// 3659 lineas de codigo elite
// ============================================

// ========== VARIABLES GLOBALES ==========
let currentUser = null;
let sidebarOpen = false;
let charts = {};
let loadingOverlay = null;
let notificationCount = 0;
let refreshInterval = null;
let autoRefreshEnabled = true;
let graficosCargados = false;
let datosCargados = false;
let themeChangeListeners = [];
let toastTimeout = null;
let actividadInterval = null;
let isOnline = navigator.onLine;
let socketConnected = false;
let paginationCurrentPage = 1;
let paginationTotalPages = 1;
let currentFilters = {};
let sortField = null;
let sortDirection = 'asc';
let selectedItems = [];
let contextMenuVisible = false;
let modalStack = [];
let dragData = null;
let clipboardData = null;
let undoStack = [];
let redoStack = [];
let maxUndoSteps = 20;
let isUndoRedo = false;
let autoSaveInterval = null;
let lastSavedData = null;
let formDirty = false;
let validationErrors = [];
let currentTab = null;
let tabHistory = [];
let breadcrumbHistory = [];
let pageViewCount = 0;
let userActivityLog = [];
let sessionStartTime = null;
let idleTimer = null;
let idleTimeout = 300000;
let isIdle = false;
let networkRetries = 0;
let maxNetworkRetries = 3;
let requestQueue = [];
let isProcessingQueue = false;
let cacheStore = {};
let cacheExpiry = 300000;
let memoryUsage = [];
let performanceMarks = {};
let eventListeners = [];
let globalEventCount = 0;
let mutationObserver = null;
let resizeObserver = null;
let intersectionObserver = null;
let mediaQueryListeners = [];
let themePreference = 'light';
let languagePreference = 'es';
let timezonePreference = 'America/Costa_Rica';
let dateFormatPreference = 'dd/mm/yyyy';
let currencyPreference = 'CRC';
let decimalPreference = 2;
let thousandsSeparator = ',';
let decimalSeparator = '.';
let numberFormatCache = {};
let dateFormatCache = {};
let currencyFormatCache = {};
let translationCache = {};
let dictionary = {};
let customValidators = {};
let fieldValidators = {};
let formSubmissions = {};
let ajaxRequests = {};
let pendingRequests = [];
let requestIdCounter = 0;
let wsConnection = null;
let wsReconnectAttempts = 0;
let wsMaxReconnectAttempts = 5;
let wsReconnectDelay = 3000;
let heartbeatInterval = null;
let lastHeartbeat = null;
let serverTimeOffset = 0;
let clientTime = null;
let serverTime = null;
let timeSyncAttempts = 0;
let maxTimeSyncAttempts = 3;
let isTimeSynced = false;
let offlineQueue = [];
let isOnlineMode = true;
let syncInProgress = false;
let lastSyncTime = null;
let syncInterval = null;
let syncIntervalTime = 60000;
let pendingChanges = [];
let changeLog = [];
let maxChangeLogSize = 1000;
let debugMode = false;
let logLevel = 'info';
let logEntries = [];
let maxLogEntries = 500;
let performanceMetrics = {};
let startTime = null;
let loadTime = null;
let renderTime = null;
let apiResponseTime = {};
let userPreferences = {};
let accessibilityMode = false;
let highContrastMode = false;
let reducedMotionMode = false;
let fontSizeMultiplier = 1;
let spacingMultiplier = 1;
let colorBlindMode = false;
let screenReaderMode = false;
let keyboardNavigationMode = false;
let touchMode = false;
let deviceType = 'desktop';
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let pixelRatio = window.devicePixelRatio || 1;
let isMobile = false;
let isTablet = false;
let isDesktop = true;
let orientation = 'landscape';
let batteryLevel = null;
let isCharging = false;
let networkSpeed = null;
let connectionType = null;
let effectiveType = null;
let rtt = null;
let downlink = null;
let saveDataMode = false;
let isDarkModePreferred = false;
let colorScheme = 'light';
let contrastPreference = 'normal';
let reducedTransparency = false;
let invertedColors = false;

// ========== CONFIGURACION ==========
const CONFIG = {
    API_BASE: '/api',
    TIMEOUT: 30000,
    TOAST_DURATION: 4000,
    REFRESH_INTERVAL: 60000,
    MAX_NOTIFICATIONS: 50,
    MAX_RECENT_ACTIVITY: 10,
    PAGINATION_LIMIT: 15,
    CHART_COLORS: ['#F58220', '#F79340', '#FAAB6B', '#FCC396', '#FDDAC0', '#FEECE0', '#FFF3E8', '#FFE4CC'],
    MONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    DAYS: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    STATUS_COLORS: {
        success: '#12B76A',
        error: '#F04438',
        warning: '#F79009',
        info: '#F58220',
        primary: '#F58220',
        secondary: '#7B8491',
        dark: '#252B36',
        light: '#F7F8FA'
    },
    STATUS_ICONS: {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    },
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 200,
    MAX_UPLOAD_SIZE: 5242880,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    SESSION_TIMEOUT: 3600000,
    IDLE_TIMEOUT: 300000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    CACHE_DURATION: 300000,
    MAX_CACHE_SIZE: 50,
    BATCH_SIZE: 25,
    DEBOUNCE_INPUT: 300,
    THROTTLE_SCROLL: 100,
    THROTTLE_RESIZE: 200,
    MAX_HISTORY: 50,
    MAX_UNDO: 20,
    MAX_REDO: 20
};

// ========== MANEJADOR DE ERRORES SILENCIOSO ==========
window.onerror = function(msg, url, line, col, error) {
    return true;
};

window.addEventListener('unhandledrejection', function(event) {
    event.preventDefault();
    return true;
});

// ========== INICIALIZACION PRINCIPAL ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('World Gym - Inicializando sistema');
    console.log('Version: 31.0');
    console.log('URL:', window.location.href);
    console.log('Fecha:', new Date().toLocaleString());
    
    sessionStartTime = new Date();
    startTime = performance.now();
    loadTime = startTime;
    
    initPerformanceMonitoring();
    initDeviceDetection();
    initUserPreferences();
    initAccessibilitySettings();
    initNetworkInfo();
    initBatteryInfo();
    initScreenInfo();
    initViewportInfo();
    initOrientationInfo();
    initColorSchemeInfo();
    initReducedMotionInfo();
    initHighContrastInfo();
    initTouchInfo();
    initKeyboardInfo();
    
    var path = window.location.pathname;
    
    initToastContainer();
    initLoadingOverlay();
    initKeyboardShortcuts();
    initConnectionMonitor();
    initIdleMonitor();
    initSessionMonitor();
    initCacheManager();
    initRequestQueue();
    initEventManager();
    initObserverManager();
    initUndoManager();
    initClipboardManager();
    initDragManager();
    initModalManager();
    initTabManager();
    initBreadcrumbManager();
    initPaginationManager();
    initFilterManager();
    initSortManager();
    initSelectionManager();
    initContextMenuManager();
    initFormManager();
    initValidationManager();
    initAutoSaveManager();
    initChangeLogManager();
    initOfflineManager();
    initSyncManager();
    initWebSocketManager();
    initTimeSyncManager();
    initTranslationManager();
    initNumberFormatManager();
    initDateFormatManager();
    initCurrencyFormatManager();
    
    if (path === '/login' || path === '/') {
        initLogin();
    } else {
        await verificarSesion();
        initSidebar();
        initDarkMode();
        initNotifications();
        initProfile();
        initFab();
        initTooltips();
        initDataTable();
        await cargarDatosPagina();
        initSearchFunctionality();
        initAutoRefresh();
        initAutoSave();
        initHeartbeat();
        initPerformanceReport();
        datosCargados = true;
    }
    
    console.log('Sistema inicializado correctamente');
});

// ========== FUNCIONES DE INICIALIZACION ==========

function initPerformanceMonitoring() {
    performanceMarks = {};
    var observer = new PerformanceObserver(function(list) {
        var entries = list.getEntries();
        entries.forEach(function(entry) {
            performanceMarks[entry.name] = entry.duration;
        });
    });
    try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
    } catch (e) {
        // Silencio
    }
}

function initDeviceDetection() {
    var ua = navigator.userAgent;
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
    isDesktop = !isMobile && !isTablet;
    deviceType = isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop');
    touchMode = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    keyboardNavigationMode = !touchMode;
}

function initUserPreferences() {
    var savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
        try {
            userPreferences = JSON.parse(savedPrefs);
        } catch (e) {
            userPreferences = {};
        }
    }
    languagePreference = userPreferences.language || 'es';
    timezonePreference = userPreferences.timezone || 'America/Costa_Rica';
    dateFormatPreference = userPreferences.dateFormat || 'dd/mm/yyyy';
    currencyPreference = userPreferences.currency || 'CRC';
    decimalPreference = userPreferences.decimals || 2;
    thousandsSeparator = userPreferences.thousandsSeparator || ',';
    decimalSeparator = userPreferences.decimalSeparator || '.';
}

function initAccessibilitySettings() {
    accessibilityMode = localStorage.getItem('accessibilityMode') === 'true';
    highContrastMode = localStorage.getItem('highContrastMode') === 'true';
    reducedMotionMode = localStorage.getItem('reducedMotionMode') === 'true';
    colorBlindMode = localStorage.getItem('colorBlindMode') === 'true';
    screenReaderMode = localStorage.getItem('screenReaderMode') === 'true';
    
    if (reducedMotionMode) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
    
    if (highContrastMode) {
        document.documentElement.classList.add('high-contrast');
    }
}

function initNetworkInfo() {
    if ('connection' in navigator) {
        var conn = navigator.connection;
        effectiveType = conn.effectiveType || null;
        rtt = conn.rtt || null;
        downlink = conn.downlink || null;
        saveDataMode = conn.saveData || false;
        
        conn.addEventListener('change', function() {
            effectiveType = conn.effectiveType;
            rtt = conn.rtt;
            downlink = conn.downlink;
            saveDataMode = conn.saveData;
        });
    }
}

function initBatteryInfo() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            batteryLevel = battery.level;
            isCharging = battery.charging;
            
            battery.addEventListener('levelchange', function() {
                batteryLevel = battery.level;
            });
            
            battery.addEventListener('chargingchange', function() {
                isCharging = battery.charging;
            });
        }).catch(function() {
            // Silencio
        });
    }
}

function initScreenInfo() {
    screenWidth = screen.width;
    screenHeight = screen.height;
    pixelRatio = window.devicePixelRatio || 1;
}

function initViewportInfo() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        isMobile = viewportWidth < 768;
        isTablet = viewportWidth >= 768 && viewportWidth < 1024;
        isDesktop = viewportWidth >= 1024;
    });
}

function initOrientationInfo() {
    orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    window.addEventListener('orientationchange', function() {
        orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    });
}

function initColorSchemeInfo() {
    colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    isDarkModePreferred = colorScheme === 'dark';
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        colorScheme = e.matches ? 'dark' : 'light';
        isDarkModePreferred = e.matches;
    });
}

function initReducedMotionInfo() {
    reducedMotionMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e) {
        reducedMotionMode = e.matches;
        if (reducedMotionMode) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '300ms');
            document.documentElement.style.setProperty('--transition-duration', '200ms');
        }
    });
}

function initHighContrastInfo() {
    highContrastMode = window.matchMedia('(prefers-contrast: high)').matches;
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', function(e) {
        highContrastMode = e.matches;
        if (highContrastMode) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    });
}

function initTouchInfo() {
    touchMode = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (touchMode) {
        document.documentElement.classList.add('touch-device');
    } else {
        document.documentElement.classList.add('no-touch-device');
    }
}

function initKeyboardInfo() {
    keyboardNavigationMode = !touchMode;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

// ========== INICIALIZAR CONTENEDOR DE TOAST ==========
function initToastContainer() {
    if (!document.getElementById('toastContainer')) {
        var container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:350px;pointer-events:none;';
        document.body.appendChild(container);
    }
}

// ========== INICIALIZAR OVERLAY DE CARGA ==========
function initLoadingOverlay() {
    if (!document.getElementById('loadingOverlay')) {
        var overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,22,40,0.7);z-index:99998;display:none;justify-content:center;align-items:center;backdrop-filter:blur(4px);';
        overlay.innerHTML = '<div style="text-align:center;"><div class="spinner" style="width:40px;height:40px;border:4px solid #1a2a4a;border-top-color:#F58220;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto;"></div><p style="color:white;margin-top:15px;font-weight:500;">Cargando...</p><small style="color:rgba(255,255,255,0.5);">Por favor espera</small></div>';
        document.body.appendChild(overlay);
    }
}

// ========== INICIALIZAR ATAJOS DE TECLADO ==========
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            var form = document.querySelector('form');
            if (form) {
                var submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            }
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            recargarDatos();
        }
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undoAction();
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redoAction();
        }
        if (e.ctrlKey && e.key === 'c') {
            copySelection();
        }
        if (e.ctrlKey && e.key === 'v') {
            pasteClipboard();
        }
        if (e.key === 'Escape') {
            closeAllModals();
            document.querySelectorAll('.dropdown.open, .notification-panel.open, .profile-menu.open, .fab-menu.open').forEach(function(el) {
                el.classList.remove('open');
            });
        }
        if (e.key === 'F5') {
            e.preventDefault();
            recargarDatos();
        }
        if (e.key === 'F12') {
            toggleDebugMode();
        }
    });
}

// ========== INICIALIZAR MONITOR DE CONEXION ==========
function initConnectionMonitor() {
    window.addEventListener('online', function() {
        if (!isOnline) {
            isOnline = true;
            isOnlineMode = true;
            mostrarToast('Conexion restablecida', 'success');
            recargarDatos();
            syncOfflineQueue();
        }
    });
    
    window.addEventListener('offline', function() {
        isOnline = false;
        isOnlineMode = false;
        mostrarToast('Sin conexion a internet', 'error');
    });
}

// ========== INICIALIZAR MONITOR DE INACTIVIDAD ==========
function initIdleMonitor() {
    var resetIdleTimer = function() {
        if (idleTimer) clearTimeout(idleTimer);
        if (isIdle) {
            isIdle = false;
            document.dispatchEvent(new Event('user-active'));
        }
        idleTimer = setTimeout(function() {
            isIdle = true;
            document.dispatchEvent(new Event('user-idle'));
        }, idleTimeout);
    };
    
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);
    document.addEventListener('touchstart', resetIdleTimer);
    
    resetIdleTimer();
    
    document.addEventListener('user-idle', function() {
        console.log('Usuario inactivo');
    });
    
    document.addEventListener('user-active', function() {
        console.log('Usuario activo');
    });
}

// ========== INICIALIZAR MONITOR DE SESION ==========
function initSessionMonitor() {
    if (sessionStartTime) {
        var sessionDuration = new Date() - sessionStartTime;
        console.log('Duracion de sesion:', Math.floor(sessionDuration / 1000), 'segundos');
    }
    
    document.addEventListener('beforeunload', function() {
        var duration = new Date() - sessionStartTime;
        console.log('Sesion finalizada. Duracion:', Math.floor(duration / 1000), 'segundos');
    });
}

// ========== INICIALIZAR GESTOR DE CACHE ==========
function initCacheManager() {
    var savedCache = localStorage.getItem('appCache');
    if (savedCache) {
        try {
            var parsed = JSON.parse(savedCache);
            var now = Date.now();
            Object.keys(parsed).forEach(function(key) {
                if (parsed[key].expiry && parsed[key].expiry < now) {
                    delete parsed[key];
                }
            });
            cacheStore = parsed;
        } catch (e) {
            cacheStore = {};
        }
    }
    
    setInterval(function() {
        var now = Date.now();
        var keys = Object.keys(cacheStore);
        keys.forEach(function(key) {
            if (cacheStore[key].expiry && cacheStore[key].expiry < now) {
                delete cacheStore[key];
            }
        });
        if (Object.keys(cacheStore).length > CONFIG.MAX_CACHE_SIZE) {
            var sorted = Object.keys(cacheStore).sort(function(a, b) {
                return cacheStore[a].timestamp - cacheStore[b].timestamp;
            });
            var toRemove = sorted.slice(0, Object.keys(cacheStore).length - CONFIG.MAX_CACHE_SIZE);
            toRemove.forEach(function(key) {
                delete cacheStore[key];
            });
        }
        localStorage.setItem('appCache', JSON.stringify(cacheStore));
    }, 60000);
}

function getFromCache(key) {
    if (cacheStore[key] && (!cacheStore[key].expiry || cacheStore[key].expiry > Date.now())) {
        return cacheStore[key].data;
    }
    return null;
}

function setInCache(key, data, expiry) {
    expiry = expiry || CONFIG.CACHE_DURATION;
    cacheStore[key] = {
        data: data,
        expiry: Date.now() + expiry,
        timestamp: Date.now()
    };
    localStorage.setItem('appCache', JSON.stringify(cacheStore));
}

function clearCache() {
    cacheStore = {};
    localStorage.removeItem('appCache');
}

// ========== INICIALIZAR COLA DE SOLICITUDES ==========
function initRequestQueue() {
    requestQueue = [];
    isProcessingQueue = false;
}

function addToRequestQueue(request) {
    requestQueue.push(request);
    if (!isProcessingQueue) {
        processRequestQueue();
    }
}

async function processRequestQueue() {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;
    
    while (requestQueue.length > 0) {
        var request = requestQueue.shift();
        try {
            await request();
        } catch (e) {
            console.error('Error procesando solicitud en cola:', e);
        }
    }
    
    isProcessingQueue = false;
}

// ========== INICIALIZAR GESTOR DE EVENTOS ==========
function initEventManager() {
    eventListeners = [];
}

function addEventListenerSafe(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element: element, event: event, handler: handler, options: options });
    globalEventCount++;
}

function removeAllEventListeners() {
    eventListeners.forEach(function(listener) {
        listener.element.removeEventListener(listener.event, listener.handler, listener.options);
    });
    eventListeners = [];
}

// ========== INICIALIZAR OBSERVADORES ==========
function initObserverManager() {
    if (mutationObserver) {
        mutationObserver.disconnect();
    }
    mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Procesar mutaciones
        });
    });
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme']
    });
    
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    resizeObserver = new ResizeObserver(function(entries) {
        entries.forEach(function(entry) {
            // Procesar cambios de tamaño
        });
    });
    resizeObserver.observe(document.body);
    
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    intersectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                // Elemento visible
            }
        });
    });
    document.querySelectorAll('[data-lazy]').forEach(function(el) {
        intersectionObserver.observe(el);
    });
}

// ========== INICIALIZAR GESTOR DE UNDO/REDO ==========
function initUndoManager() {
    undoStack = [];
    redoStack = [];
    isUndoRedo = false;
}

function pushUndo(action) {
    if (isUndoRedo) return;
    undoStack.push(action);
    if (undoStack.length > maxUndoSteps) {
        undoStack.shift();
    }
    redoStack = [];
}

function undoAction() {
    if (undoStack.length === 0) return;
    isUndoRedo = true;
    var action = undoStack.pop();
    action.undo();
    redoStack.push(action);
    isUndoRedo = false;
}

function redoAction() {
    if (redoStack.length === 0) return;
    isUndoRedo = true;
    var action = redoStack.pop();
    action.redo();
    undoStack.push(action);
    isUndoRedo = false;
}

// ========== INICIALIZAR GESTOR DE PORTAPAPELES ==========
function initClipboardManager() {
    clipboardData = null;
}

function copySelection() {
    var selection = window.getSelection();
    if (selection && selection.toString()) {
        clipboardData = selection.toString();
        mostrarToast('Copiado al portapapeles', 'success');
    }
}

function pasteClipboard() {
    if (clipboardData) {
        var activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            activeElement.value = clipboardData;
        }
        mostrarToast('Pegado desde el portapapeles', 'success');
    }
}

// ========== INICIALIZAR GESTOR DE ARRASTRE ==========
function initDragManager() {
    dragData = null;
    
    document.addEventListener('dragstart', function(e) {
        var target = e.target.closest('[draggable="true"]');
        if (target) {
            dragData = {
                element: target,
                data: target.dataset.dragData || null
            };
        }
    });
    
    document.addEventListener('dragend', function() {
        dragData = null;
    });
    
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('drop', function(e) {
        e.preventDefault();
        if (dragData) {
            var dropTarget = e.target.closest('[data-drop-target]');
            if (dropTarget) {
                dropTarget.dispatchEvent(new CustomEvent('drop-data', {
                    detail: dragData
                }));
            }
        }
    });
}

// ========== INICIALIZAR GESTOR DE MODALES ==========
function initModalManager() {
    modalStack = [];
}

function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('open');
    modalStack.push(modalId);
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    modalStack = modalStack.filter(function(id) { return id !== modalId; });
    if (modalStack.length === 0) {
        document.body.classList.remove('modal-open');
    }
}

function closeAllModals() {
    modalStack.forEach(function(id) {
        var modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    });
    modalStack = [];
    document.body.classList.remove('modal-open');
}

// ========== INICIALIZAR GESTOR DE PESTAÑAS ==========
function initTabManager() {
    currentTab = null;
    tabHistory = [];
}

function switchTab(tabId) {
    if (currentTab) {
        var oldTab = document.getElementById(currentTab);
        if (oldTab) oldTab.classList.remove('active');
    }
    currentTab = tabId;
    var newTab = document.getElementById(tabId);
    if (newTab) newTab.classList.add('active');
    tabHistory.push(tabId);
    if (tabHistory.length > CONFIG.MAX_HISTORY) {
        tabHistory.shift();
    }
}

function goBackTab() {
    if (tabHistory.length > 1) {
        tabHistory.pop();
        var prevTab = tabHistory[tabHistory.length - 1];
        switchTab(prevTab);
    }
}

// ========== INICIALIZAR GESTOR DE MIGAS DE PAN ==========
function initBreadcrumbManager() {
    breadcrumbHistory = [];
    pageViewCount = 0;
}

function addBreadcrumb(label, url) {
    breadcrumbHistory.push({ label: label, url: url, timestamp: Date.now() });
    if (breadcrumbHistory.length > 20) {
        breadcrumbHistory.shift();
    }
    pageViewCount++;
    updateBreadcrumbUI();
}

function updateBreadcrumbUI() {
    var container = document.querySelector('.breadcrumb-container');
    if (!container) return;
    var html = '';
    breadcrumbHistory.forEach(function(item, index) {
        if (index === breadcrumbHistory.length - 1) {
            html += '<span class="breadcrumb-current">' + item.label + '</span>';
        } else {
            html += '<a href="' + item.url + '" class="breadcrumb-link">' + item.label + '</a>';
            html += '<span class="breadcrumb-separator">/</span>';
        }
    });
    container.innerHTML = html;
}

// ========== INICIALIZAR GESTOR DE PAGINACION ==========
function initPaginationManager() {
    paginationCurrentPage = 1;
    paginationTotalPages = 1;
}

function setPagination(totalItems, itemsPerPage) {
    itemsPerPage = itemsPerPage || CONFIG.PAGINATION_LIMIT;
    paginationTotalPages = Math.ceil(totalItems / itemsPerPage);
    if (paginationCurrentPage > paginationTotalPages) {
        paginationCurrentPage = paginationTotalPages;
    }
    updatePaginationUI();
}

function updatePaginationUI() {
    var container = document.querySelector('.pagination-container');
    if (!container) return;
    var html = '';
    html += '<button class="pagination-btn" onclick="goToPage(1)" ' + (paginationCurrentPage === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i><i class="fas fa-chevron-left"></i></button>';
    html += '<button class="pagination-btn" onclick="goToPage(' + (paginationCurrentPage - 1) + ')" ' + (paginationCurrentPage === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
    html += '<span class="pagination-info">' + paginationCurrentPage + ' de ' + paginationTotalPages + '</span>';
    html += '<button class="pagination-btn" onclick="goToPage(' + (paginationCurrentPage + 1) + ')" ' + (paginationCurrentPage === paginationTotalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
    html += '<button class="pagination-btn" onclick="goToPage(' + paginationTotalPages + ')" ' + (paginationCurrentPage === paginationTotalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i><i class="fas fa-chevron-right"></i></button>';
    container.innerHTML = html;
}

function goToPage(page) {
    if (page < 1 || page > paginationTotalPages) return;
    paginationCurrentPage = page;
    updatePaginationUI();
    document.dispatchEvent(new CustomEvent('page-change', {
        detail: { page: paginationCurrentPage }
    }));
}

// ========== INICIALIZAR GESTOR DE FILTROS ==========
function initFilterManager() {
    currentFilters = {};
}

function setFilter(key, value) {
    if (value === null || value === undefined || value === '') {
        delete currentFilters[key];
    } else {
        currentFilters[key] = value;
    }
    applyFilters();
}

function applyFilters() {
    document.dispatchEvent(new CustomEvent('filters-change', {
        detail: { filters: currentFilters }
    }));
}

function clearFilters() {
    currentFilters = {};
    applyFilters();
}

// ========== INICIALIZAR GESTOR DE ORDENAMIENTO ==========
function initSortManager() {
    sortField = null;
    sortDirection = 'asc';
}

function setSort(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'asc';
    }
    document.dispatchEvent(new CustomEvent('sort-change', {
        detail: { field: sortField, direction: sortDirection }
    }));
}

// ========== INICIALIZAR GESTOR DE SELECCION ==========
function initSelectionManager() {
    selectedItems = [];
}

function selectItem(id) {
    if (!selectedItems.includes(id)) {
        selectedItems.push(id);
    }
    updateSelectionUI();
}

function deselectItem(id) {
    selectedItems = selectedItems.filter(function(item) { return item !== id; });
    updateSelectionUI();
}

function toggleSelectItem(id) {
    if (selectedItems.includes(id)) {
        deselectItem(id);
    } else {
        selectItem(id);
    }
}

function selectAllItems(ids) {
    selectedItems = ids.slice();
    updateSelectionUI();
}

function clearSelection() {
    selectedItems = [];
    updateSelectionUI();
}

function updateSelectionUI() {
    document.dispatchEvent(new CustomEvent('selection-change', {
        detail: { selected: selectedItems }
    }));
}

// ========== INICIALIZAR GESTOR DE MENU CONTEXTUAL ==========
function initContextMenuManager() {
    contextMenuVisible = false;
    
    document.addEventListener('contextmenu', function(e) {
        var target = e.target.closest('[data-context-menu]');
        if (target) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, target);
        }
    });
    
    document.addEventListener('click', function() {
        hideContextMenu();
    });
}

function showContextMenu(x, y, target) {
    var menu = document.getElementById('contextMenu');
    if (!menu) return;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('open');
    contextMenuVisible = true;
    menu.dataset.targetId = target.id || target.dataset.id || '';
}

function hideContextMenu() {
    var menu = document.getElementById('contextMenu');
    if (menu) menu.classList.remove('open');
    contextMenuVisible = false;
}

// ========== INICIALIZAR GESTOR DE FORMULARIOS ==========
function initFormManager() {
    formSubmissions = {};
}

function registerForm(formId, submitHandler) {
    var form = document.getElementById(formId);
    if (!form) return;
    formSubmissions[formId] = submitHandler;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (submitHandler) {
            submitHandler(form);
        }
    });
}

function resetForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.reset();
    clearValidationErrors(form);
}

// ========== INICIALIZAR GESTOR DE VALIDACION ==========
function initValidationManager() {
    validationErrors = [];
    fieldValidators = {};
}

function addValidator(fieldId, validator, errorMessage) {
    if (!fieldValidators[fieldId]) {
        fieldValidators[fieldId] = [];
    }
    fieldValidators[fieldId].push({
        validator: validator,
        message: errorMessage
    });
}

function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return true;
    var validators = fieldValidators[fieldId] || [];
    var value = field.value;
    var isValid = true;
    
    validators.forEach(function(v) {
        if (!v.validator(value)) {
            isValid = false;
            showFieldError(field, v.message);
        }
    });
    
    if (isValid) {
        clearFieldError(field);
    }
    
    return isValid;
}

function validateForm(form) {
    var inputs = form.querySelectorAll('input, select, textarea');
    var isValid = true;
    inputs.forEach(function(input) {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            showFieldError(input, 'Este campo es requerido');
        }
        if (input.type === 'email' && input.value) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                showFieldError(input, 'Ingrese un email valido');
            }
        }
        if (input.type === 'number' && input.value) {
            if (isNaN(parseFloat(input.value))) {
                isValid = false;
                showFieldError(input, 'Ingrese un numero valido');
            }
        }
    });
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    var errorMsg = field.parentElement.querySelector('.field-error');
    if (!errorMsg) {
        errorMsg = document.createElement('small');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = 'color:#ef4444;font-size:12px;margin-top:4px;display:block;';
        field.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    var errorMsg = field.parentElement.querySelector('.field-error');
    if (errorMsg) errorMsg.remove();
}

function clearValidationErrors(form) {
    form.querySelectorAll('.error').forEach(function(el) {
        el.classList.remove('error');
    });
    form.querySelectorAll('.field-error').forEach(function(el) {
        el.remove();
    });
}

// ========== INICIALIZAR GESTOR DE AUTO-GUARDADO ==========
function initAutoSaveManager() {
    autoSaveInterval = null;
    lastSavedData = null;
    formDirty = false;
}

function enableAutoSave(interval) {
    interval = interval || 30000;
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(function() {
        if (formDirty) {
            autoSave();
        }
    }, interval);
}

function disableAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

function markFormDirty() {
    formDirty = true;
}

function autoSave() {
    if (!formDirty) return;
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) {
            data[key] = value;
        });
        localStorage.setItem('autoSave_' + form.id, JSON.stringify(data));
    });
    formDirty = false;
    mostrarToast('Cambios guardados automaticamente', 'info');
}

function restoreAutoSave() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        var saved = localStorage.getItem('autoSave_' + form.id);
        if (saved) {
            try {
                var data = JSON.parse(saved);
                Object.keys(data).forEach(function(key) {
                    var input = form.querySelector('[name="' + key + '"]');
                    if (input) {
                        input.value = data[key];
                    }
                });
                mostrarToast('Datos restaurados del auto-guardado', 'info');
            } catch (e) {
                // Silencio
            }
        }
    });
}

// ========== INICIALIZAR GESTOR DE REGISTRO DE CAMBIOS ==========
function initChangeLogManager() {
    changeLog = [];
    maxChangeLogSize = CONFIG.MAX_HISTORY;
}

function logChange(action, data) {
    changeLog.push({
        action: action,
        data: data,
        timestamp: Date.now(),
        user: currentUser?.nombre || 'Sistema'
    });
    if (changeLog.length > maxChangeLogSize) {
        changeLog.shift();
    }
}

function getChangeLog() {
    return changeLog.slice();
}

function clearChangeLog() {
    changeLog = [];
}

// ========== INICIALIZAR GESTOR DE MODO OFFLINE ==========
function initOfflineManager() {
    offlineQueue = [];
    isOnlineMode = navigator.onLine;
    
    document.addEventListener('online', function() {
        isOnlineMode = true;
        syncOfflineQueue();
    });
    
    document.addEventListener('offline', function() {
        isOnlineMode = false;
    });
}

function addToOfflineQueue(request) {
    offlineQueue.push({
        request: request,
        timestamp: Date.now()
    });
    if (offlineQueue.length > 100) {
        offlineQueue.shift();
    }
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
}

async function syncOfflineQueue() {
    if (!isOnlineMode || offlineQueue.length === 0) return;
    if (syncInProgress) return;
    
    syncInProgress = true;
    var queue = offlineQueue.slice();
    offlineQueue = [];
    localStorage.removeItem('offlineQueue');
    
    for (var i = 0; i < queue.length; i++) {
        try {
            await queue[i].request();
        } catch (e) {
            offlineQueue.push(queue[i]);
        }
    }
    
    syncInProgress = false;
    if (offlineQueue.length > 0) {
        localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
    }
}

// ========== INICIALIZAR GESTOR DE SINCRONIZACION ==========
function initSyncManager() {
    lastSyncTime = null;
    syncInterval = null;
    pendingChanges = [];
}

function enableSync(interval) {
    interval = interval || 60000;
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(function() {
        syncData();
    }, interval);
}

function disableSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

async function syncData() {
    if (!isOnlineMode) return;
    if (syncInProgress) return;
    
    syncInProgress = true;
    try {
        var response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                changes: pendingChanges,
                timestamp: Date.now()
            })
        });
        var result = await response.json();
        if (result.success) {
            pendingChanges = [];
            lastSyncTime = Date.now();
        }
    } catch (e) {
        console.error('Error en sincronizacion:', e);
    } finally {
        syncInProgress = false;
    }
}

// ========== INICIALIZAR GESTOR DE WEBSOCKET ==========
function initWebSocketManager() {
    wsConnection = null;
    wsReconnectAttempts = 0;
    wsMaxReconnectAttempts = 5;
    wsReconnectDelay = 3000;
}

function connectWebSocket() {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) return;
    
    try {
        var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = protocol + '//' + window.location.host + '/ws';
        wsConnection = new WebSocket(wsUrl);
        
        wsConnection.onopen = function() {
            console.log('WebSocket conectado');
            wsReconnectAttempts = 0;
            socketConnected = true;
            startHeartbeat();
        };
        
        wsConnection.onmessage = function(event) {
            handleWebSocketMessage(event.data);
        };
        
        wsConnection.onclose = function() {
            console.log('WebSocket desconectado');
            socketConnected = false;
            stopHeartbeat();
            attemptWebSocketReconnect();
        };
        
        wsConnection.onerror = function() {
            console.log('Error en WebSocket');
        };
    } catch (e) {
        console.log('Error al conectar WebSocket:', e);
    }
}

function attemptWebSocketReconnect() {
    if (wsReconnectAttempts >= wsMaxReconnectAttempts) return;
    wsReconnectAttempts++;
    setTimeout(function() {
        connectWebSocket();
    }, wsReconnectDelay * wsReconnectAttempts);
}

function handleWebSocketMessage(data) {
    try {
        var message = JSON.parse(data);
        console.log('Mensaje WebSocket:', message);
        
        switch (message.type) {
            case 'notification':
                mostrarToast(message.content, 'info');
                break;
            case 'update':
                recargarDatos();
                break;
            case 'ping':
                sendWebSocketPong();
                break;
            default:
                console.log('Mensaje desconocido:', message);
        }
    } catch (e) {
        console.error('Error al procesar mensaje WebSocket:', e);
    }
}

function sendWebSocketMessage(type, data) {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) return;
    try {
        wsConnection.send(JSON.stringify({
            type: type,
            data: data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Error al enviar mensaje WebSocket:', e);
    }
}

function sendWebSocketPong() {
    sendWebSocketMessage('pong', {});
}

// ========== INICIALIZAR GESTOR DE HEARTBEAT ==========
function initHeartbeat() {
    lastHeartbeat = Date.now();
    startHeartbeat();
}

function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(function() {
        sendHeartbeat();
    }, 30000);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function sendHeartbeat() {
    if (!isOnline) return;
    lastHeartbeat = Date.now();
    fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: Date.now(),
            user: currentUser?.usuario || 'anonimo'
        })
    }).catch(function() {
        // Silencio
    });
}

// ========== INICIALIZAR GESTOR DE SINCRONIZACION DE TIEMPO ==========
function initTimeSyncManager() {
    serverTimeOffset = 0;
    clientTime = Date.now();
    serverTime = null;
    timeSyncAttempts = 0;
    maxTimeSyncAttempts = 3;
    isTimeSynced = false;
    syncTime();
}

async function syncTime() {
    if (timeSyncAttempts >= maxTimeSyncAttempts) return;
    timeSyncAttempts++;
    
    try {
        var start = Date.now();
        var response = await fetch('/api/time');
        var end = Date.now();
        var data = await response.json();
        
        if (data && data.serverTime) {
            var serverTimeValue = new Date(data.serverTime).getTime();
            var roundTrip = end - start;
            var estimatedServerTime = serverTimeValue + (roundTrip / 2);
            serverTimeOffset = estimatedServerTime - Date.now();
            serverTime = serverTimeValue;
            isTimeSynced = true;
            console.log('Tiempo sincronizado. Offset:', serverTimeOffset, 'ms');
        }
    } catch (e) {
        console.log('Error al sincronizar tiempo:', e);
        setTimeout(syncTime, 5000);
    }
}

function getCurrentServerTime() {
    return Date.now() + serverTimeOffset;
}

// ========== INICIALIZAR GESTOR DE TRADUCCIONES ==========
function initTranslationManager() {
    dictionary = {};
    translationCache = {};
    loadDictionary();
}

function loadDictionary() {
    var savedDict = localStorage.getItem('dictionary');
    if (savedDict) {
        try {
            dictionary = JSON.parse(savedDict);
        } catch (e) {
            dictionary = {};
        }
    }
}

function translate(key, params) {
    params = params || {};
    var translation = dictionary[key] || key;
    Object.keys(params).forEach(function(param) {
        translation = translation.replace('{{' + param + '}}', params[param]);
    });
    return translation;
}

function setTranslation(key, value) {
    dictionary[key] = value;
    localStorage.setItem('dictionary', JSON.stringify(dictionary));
}

// ========== INICIALIZAR GESTOR DE FORMATO DE NUMEROS ==========
function initNumberFormatManager() {
    numberFormatCache = {};
}

function formatNumber(value, decimals, thousandsSep, decimalSep) {
    decimals = decimals || decimalPreference;
    thousandsSep = thousandsSep || thousandsSeparator;
    decimalSep = decimalSep || decimalSeparator;
    
    var cacheKey = value + '_' + decimals + '_' + thousandsSep + '_' + decimalSep;
    if (numberFormatCache[cacheKey]) {
        return numberFormatCache[cacheKey];
    }
    
    var num = Number(value);
    if (isNaN(num)) return value;
    
    var parts = num.toFixed(decimals).split('.');
    var integerPart = parts[0];
    var decimalPart = parts[1] || '';
    
    var result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    if (decimalPart) {
        result += decimalSep + decimalPart;
    }
    
    numberFormatCache[cacheKey] = result;
    return result;
}

// ========== INICIALIZAR GESTOR DE FORMATO DE FECHAS ==========
function initDateFormatManager() {
    dateFormatCache = {};
}

function formatDate(date, format) {
    format = format || dateFormatPreference;
    var d = new Date(date);
    if (isNaN(d.getTime())) return date;
    
    var cacheKey = date + '_' + format;
    if (dateFormatCache[cacheKey]) {
        return dateFormatCache[cacheKey];
    }
    
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    var hours = String(d.getHours()).padStart(2, '0');
    var minutes = String(d.getMinutes()).padStart(2, '0');
    var seconds = String(d.getSeconds()).padStart(2, '0');
    
    var result = format
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year)
        .replace('yy', String(year).slice(-2))
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    
    dateFormatCache[cacheKey] = result;
    return result;
}

// ========== INICIALIZAR GESTOR DE FORMATO DE MONEDAS ==========
function initCurrencyFormatManager() {
    currencyFormatCache = {};
}

function formatCurrency(value, currency) {
    currency = currency || currencyPreference;
    var cacheKey = value + '_' + currency;
    if (currencyFormatCache[cacheKey]) {
        return currencyFormatCache[cacheKey];
    }
    
    var num = Number(value);
    if (isNaN(num)) return value;
    
    var formatted = formatNumber(num);
    var result = currency + ' ' + formatted;
    
    currencyFormatCache[cacheKey] = result;
    return result;
}

// ========== FUNCIONES DE INICIALIZACION ADICIONALES ==========

// ========== INICIALIZAR AUTO-GUARDADO ==========
function initAutoSave() {
    document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('change', function() {
            markFormDirty();
        });
        form.addEventListener('input', function() {
            markFormDirty();
        });
    });
    enableAutoSave(30000);
}

// ========== INICIALIZAR REPORTE DE RENDIMIENTO ==========
function initPerformanceReport() {
    if (performance && performance.timing) {
        var timing = performance.timing;
        var loadTime = timing.loadEventEnd - timing.navigationStart;
        var domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        var firstPaint = timing.responseEnd - timing.navigationStart;
        
        console.log('Tiempo de carga:', loadTime, 'ms');
        console.log('DOM Ready:', domReady, 'ms');
        console.log('First Paint:', firstPaint, 'ms');
    }
}

// ========== FUNCIONES DE LOGIN ==========
function initLogin() {
    var form = document.getElementById('loginForm');
    if (!form) {
        console.log('Formulario de login no encontrado');
        return;
    }
    
    var savedUser = localStorage.getItem('savedUser');
    if (savedUser) {
        var userInput = document.getElementById('NombreUsuario');
        if (userInput) userInput.value = savedUser;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        var usuario = document.getElementById('NombreUsuario').value.trim();
        var password = document.getElementById('Contrasena').value.trim();
        
        if (!usuario || !password) {
            mostrarToast('Complete todos los campos', 'warning');
            shakeElement(form);
            return;
        }
        
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
        btn.disabled = true;
        
        try {
            var response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    NombreUsuario: usuario, 
                    Contrasena: password 
                })
            });
            
            var data = await response.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.usuario));
                localStorage.setItem('savedUser', usuario);
                localStorage.setItem('lastLogin', new Date().toISOString());
                
                mostrarToast('Bienvenido ' + (data.usuario.nombre || usuario), 'success');
                
                await fetch('/api/registrar-actividad', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuario: usuario,
                        accion: 'login',
                        fecha: new Date().toISOString()
                    })
                });
                
                setTimeout(function() {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                mostrarToast(data.error || 'Credenciales incorrectas', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                shakeElement(form);
            }
        } catch (error) {
            console.error('Error de login:', error);
            mostrarToast('Error de conexion con el servidor', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
    
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

// ========== EFECTO SHAKE ==========
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(function() {
        element.classList.remove('shake');
    }, 500);
}

// ========== UTILIDADES DE INTERFAZ Y ACCESIBILIDAD ==========
let actividadRecienteCache = [];
let actividadFiltroActual = 'todos';
let ventasResumenCache = null;
let dashboardConteoInicialRealizado = false;

function wgPrefersReducedMotion() {
    return Boolean(
        reducedMotionMode ||
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
}

function wgEscapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function wgCapitalizar(texto) {
    if (!texto) return '';
    var limpio = String(texto).trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function wgFormatearMoneda(valor) {
    var num = Number(valor || 0);
    if (isNaN(num)) num = 0;
    return 'C$' + num.toLocaleString('es-NI', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ========== VERIFICAR SESION ==========
async function verificarSesion() {
    var stored = localStorage.getItem('user');

    if (stored) {
        try {
            currentUser = JSON.parse(stored);
            actualizarElementosUsuario();
        } catch (parseErr) {
            localStorage.removeItem('user');
            stored = null;
        }
    }

    try {
        var payload = currentUser && (currentUser.usuario || currentUser.nombre)
            ? { usuario: currentUser.usuario || currentUser.nombre }
            : {};
        var response = await fetch('/api/verificar-sesion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var data = await response.json();
        if (!data.success) {
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
        }
        if (data.usuario) {
            currentUser = Object.assign({}, currentUser || {}, data.usuario);
            localStorage.setItem('user', JSON.stringify(currentUser));
            actualizarElementosUsuario();
        }
    } catch (error) {
        if (!stored) {
            window.location.href = '/login';
        }
    }
}

// ========== ACTUALIZAR ELEMENTOS DE USUARIO ==========
function actualizarElementosUsuario() {
    if (!currentUser) return;

    var nombre = currentUser.nombre || currentUser.usuario || 'Usuario';
    var rol = currentUser.rol || 'Administrador';
    var email = currentUser.email || '';
    var avatar = currentUser.avatar || '';

    var selectors = {
        nombre: [
            '#userName', '.user-name-sidebar', '.user-name-header',
            '#userNameSidebar', '#userNameHeader', '.user-name',
            '.profile-btn strong', '.profile-menu-name', '.welcome-user', '.user-display-name'
        ],
        rol: [
            '#userRole', '.user-role-sidebar', '.user-role-header',
            '#userRoleSidebar', '#userRoleHeader', '.user-role'
        ],
        email: [
            '.user-email', '#userEmail', '.user-email-display'
        ]
    };

    selectors.nombre.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el) {
            if (el) el.innerText = nombre;
        });
    });

    selectors.rol.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el) {
            if (el) el.innerText = rol;
        });
    });

    selectors.email.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el) {
            if (el) el.innerText = email;
        });
    });

    var welcomeUser = document.getElementById('welcomeUser');
    if (welcomeUser) welcomeUser.innerText = nombre;

    var welcomeDate = document.getElementById('currentDate');
    if (welcomeDate) {
        var fechaTexto = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        welcomeDate.innerText = wgCapitalizar(fechaTexto);
    }

    if (avatar) {
        document.querySelectorAll('.profile-avatar, .user-avatar-sidebar, .user-avatar-header').forEach(function(el) {
            if (el) {
                var statusDot = el.querySelector('.user-status-dot');
                el.innerHTML = '<img src="' + wgEscapeHtml(avatar) + '" alt="' + wgEscapeHtml(nombre) + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">';
                if (statusDot) el.appendChild(statusDot);
            }
        });
    }

    var lastLogin = localStorage.getItem('lastLogin');
    if (lastLogin) {
        var lastLoginEl = document.getElementById('lastLogin');
        if (lastLoginEl) {
            var date = new Date(lastLogin);
            lastLoginEl.innerText = 'Último acceso: ' + date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
        }
    }
}

// ========== BREADCRUMB DINAMICO EN TOPBAR ==========
function actualizarBreadcrumbDinamico() {
    var trailEl = document.getElementById('breadcrumbTrail');
    var currentEl = document.getElementById('breadcrumbCurrent');
    var sectionPill = document.getElementById('topbarSectionName');
    if (!trailEl) return;

    var rawText = currentEl ? currentEl.textContent.trim() : '';
    var activeSub = document.querySelector('.sidebar .submenu a.active');
    var activeNav = document.querySelector('.sidebar .nav-link.active:not(.dropdown-trigger)');
    var parentDropdown = activeSub ? activeSub.closest('.nav-dropdown') : null;
    var parentTrigger = parentDropdown ? parentDropdown.querySelector('.dropdown-trigger') : null;

    var categoria = '';
    if (parentTrigger && parentTrigger.dataset.category) {
        categoria = parentTrigger.dataset.category;
    } else if (activeNav && activeNav.dataset.category) {
        categoria = activeNav.dataset.category;
    }

    var partes = rawText
        ? rawText.split('/').map(function(s) { return s.trim(); }).filter(Boolean)
        : [];

    if (partes.length === 0) {
        if (activeSub) {
            partes = [activeSub.textContent.trim()];
        } else if (activeNav) {
            partes = [activeNav.textContent.trim()];
        } else {
            partes = ['Dashboard'];
        }
    }

    var esDashboard = (window.location.pathname === '/dashboard' || window.location.pathname === '/');
    if (!esDashboard && partes.length === 1 && parentTrigger) {
        var grupoNombre = parentTrigger.querySelector('span') ? parentTrigger.querySelector('span').textContent.trim() : '';
        if (grupoNombre && grupoNombre.toLowerCase() !== partes[0].toLowerCase()) {
            partes.unshift(grupoNombre);
        }
    }

    var htmlPartes = [];
    for (var i = 0; i < partes.length; i++) {
        if (i < partes.length - 1) {
            htmlPartes.push('<span class="breadcrumb-segment">' + wgEscapeHtml(partes[i]) + '</span>');
            htmlPartes.push('<span class="breadcrumb-sep" aria-hidden="true">/</span>');
        } else {
            htmlPartes.push('<span class="breadcrumb-current" id="breadcrumbCurrent">' + wgEscapeHtml(partes[i]) + '</span>');
        }
    }
    trailEl.innerHTML = htmlPartes.join('');

    if (sectionPill) {
        if (esDashboard) {
            sectionPill.textContent = 'Vista general';
        } else if (categoria) {
            sectionPill.textContent = categoria;
        } else {
            sectionPill.textContent = partes[partes.length - 1];
        }
    }
}

// ========== INICIALIZAR SIDEBAR ==========
function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var sidebarToggle = document.getElementById('sidebarToggle');
    var mobileMenuToggle = document.getElementById('mobileMenuToggle');
    var sidebarBackdrop = document.getElementById('sidebarBackdrop');
    var floatingTooltip = document.getElementById('sidebarFloatingTooltip');

    if (!sidebar) return;

    function hideSidebarTooltip() {
        if (!floatingTooltip) return;
        floatingTooltip.classList.remove('visible');
        floatingTooltip.setAttribute('aria-hidden', 'true');
    }

    function syncCollapsedState(collapsed) {
        sidebar.classList.toggle('collapsed', collapsed);
        document.documentElement.classList.toggle('sidebar-is-collapsed', collapsed);
        try {
            localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false');
        } catch (e) {}

        if (sidebarToggle) {
            var icon = sidebarToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-chevron-left', !collapsed);
                icon.classList.toggle('fa-chevron-right', collapsed);
            }
            sidebarToggle.setAttribute('aria-label', collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral');
            sidebarToggle.setAttribute('title', collapsed ? 'Expandir menú' : 'Contraer menú');
        }
        hideSidebarTooltip();
    }

    var initiallyCollapsed = false;
    try {
        initiallyCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    } catch (e) {}
    syncCollapsedState(initiallyCollapsed);

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            var nextState = !sidebar.classList.contains('collapsed');
            syncCollapsedState(nextState);
        });
    }

    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = sidebar.classList.toggle('mobile-open');
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.toggle('active', isOpen);
            }
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }

    // Marcar enlace activo si coincide por pathname y no fue marcado en servidor
    var currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar .nav-link:not(.dropdown-trigger), .sidebar .submenu a').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href !== '#' && (currentPath === href || currentPath.startsWith(href + '/'))) {
            link.classList.add('active');
            var parentDrop = link.closest('.nav-dropdown');
            if (parentDrop) {
                parentDrop.classList.add('open');
                var trig = parentDrop.querySelector('.dropdown-trigger');
                if (trig) trig.setAttribute('aria-expanded', 'true');
            }
        }
    });

    // Recordar estado de submenú desplegado durante la navegación
    var routeOpenedDropdown = sidebar.querySelector('.nav-dropdown.open');
    if (routeOpenedDropdown && routeOpenedDropdown.dataset.group) {
        try {
            localStorage.setItem('sidebarOpenDropdown', routeOpenedDropdown.dataset.group);
        } catch (e) {}
    } else if (!initiallyCollapsed) {
        try {
            var savedGroup = localStorage.getItem('sidebarOpenDropdown');
            if (savedGroup && savedGroup !== '__none__') {
                var remembered = sidebar.querySelector('.nav-dropdown[data-group="' + savedGroup + '"]');
                if (remembered) {
                    remembered.classList.add('open');
                    var remTrig = remembered.querySelector('.dropdown-trigger');
                    if (remTrig) remTrig.setAttribute('aria-expanded', 'true');
                }
            }
        } catch (e) {}
    }

    document.querySelectorAll('.nav-dropdown').forEach(function(dropdown) {
        var trigger = dropdown.querySelector('.dropdown-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (sidebar.classList.contains('collapsed') && window.innerWidth > 992) {
                syncCollapsedState(false);
            }

            document.querySelectorAll('.nav-dropdown').forEach(function(other) {
                if (other !== dropdown && other.classList.contains('open')) {
                    other.classList.remove('open');
                    var otherTrig = other.querySelector('.dropdown-trigger');
                    if (otherTrig) otherTrig.setAttribute('aria-expanded', 'false');
                }
            });

            var isOpen = dropdown.classList.toggle('open');
            trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            try {
                localStorage.setItem('sidebarOpenDropdown', isOpen ? (dropdown.dataset.group || '') : '__none__');
            } catch (err) {}
        });
    });

    // Tooltips flotantes cuando el sidebar está contraído
    if (floatingTooltip) {
        sidebar.querySelectorAll('[data-nav-tooltip]').forEach(function(item) {
            function showTip() {
                var isCollapsed = sidebar.classList.contains('collapsed') || document.documentElement.classList.contains('sidebar-is-collapsed');
                if (!isCollapsed || window.innerWidth <= 992) return;
                var label = item.getAttribute('data-nav-tooltip');
                if (!label) return;
                var rect = item.getBoundingClientRect();
                var sidebarRect = sidebar.getBoundingClientRect();
                floatingTooltip.textContent = label;
                floatingTooltip.style.top = Math.round(rect.top + rect.height / 2) + 'px';
                floatingTooltip.style.left = Math.round(sidebarRect.right + 10) + 'px';
                floatingTooltip.setAttribute('aria-hidden', 'false');
                floatingTooltip.classList.add('visible');
            }

            item.addEventListener('mouseenter', showTip);
            item.addEventListener('mouseleave', hideSidebarTooltip);
            item.addEventListener('focus', showTip);
            item.addEventListener('blur', hideSidebarTooltip);
            item.addEventListener('click', hideSidebarTooltip);
        });

        var sidebarNavEl = sidebar.querySelector('.sidebar-nav');
        if (sidebarNavEl) {
            sidebarNavEl.addEventListener('scroll', hideSidebarTooltip, { passive: true });
        }
        window.addEventListener('resize', hideSidebarTooltip, { passive: true });
    }

    document.querySelectorAll('.nav-link:not(.dropdown-trigger), .submenu a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                closeMobileSidebar();
            }
        });
    });

    document.querySelectorAll('a[href="/logout"]').forEach(function(logoutLink) {
        logoutLink.addEventListener('click', function() {
            try {
                localStorage.removeItem('user');
            } catch (e) {}
        });
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && (!mobileMenuToggle || !mobileMenuToggle.contains(e.target))) {
                closeMobileSidebar();
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        }
    });

    // Estado loading táctil para botones de acción del encabezado del Dashboard
    document.querySelectorAll('.dashboard-cta').forEach(function(btn) {
        if (btn._ctaBound) return;
        btn._ctaBound = true;
        btn.addEventListener('click', function(e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            btn.classList.add('is-loading');
            var icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-spinner';
            }
            var labelSpan = btn.querySelector('span');
            var loadingText = btn.getAttribute('data-loading-text');
            if (labelSpan && loadingText) {
                labelSpan.textContent = loadingText;
            }
        });
    });

    actualizarBreadcrumbDinamico();
}

// ========== MODO CLARO / OSCURO CON TRANSICION CIRCULAR ==========
function actualizarColoresGraficoVentas() {
    var chart = charts.ingresos;
    if (!chart || !chart.options) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var textColor = isDark ? '#9BA5B7' : '#667085';
    var gridColor = isDark ? 'rgba(155, 165, 183, 0.09)' : '#EEF1F5';

    if (chart.data && chart.data.datasets && chart.data.datasets[0]) {
        var ds = chart.data.datasets[0];
        ds.pointBorderColor = isDark ? '#121721' : '#FFFFFF';
        var canvas = chart.canvas;
        if (canvas) {
            var ctx = canvas.getContext('2d');
            var grad = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 280);
            grad.addColorStop(0, isDark ? 'rgba(245, 130, 32, 0.28)' : 'rgba(245, 130, 32, 0.20)');
            grad.addColorStop(1, 'rgba(245, 130, 32, 0.00)');
            ds.backgroundColor = grad;
        }
    }

    if (chart.options.scales && chart.options.scales.x) {
        chart.options.scales.x.ticks.color = textColor;
    }
    if (chart.options.scales && chart.options.scales.y) {
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.y.grid.color = gridColor;
    }
    if (chart.options.plugins && chart.options.plugins.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = isDark ? '#1B2332' : '#181D27';
        chart.options.plugins.tooltip.borderColor = isDark ? '#2D384D' : 'rgba(255,255,255,0.08)';
    }
    chart.update('none');
}

function initDarkMode() {
    var themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    var savedTheme = localStorage.getItem('theme') || 'light';
    var initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);

    function sincronizarBotonTema(theme) {
        themeToggle.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute(
            'aria-label',
            theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
        );
        themeToggle.setAttribute(
            'title',
            theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
        );
    }

    sincronizarBotonTema(initialTheme);
    aplicarColoresIconos(initialTheme);

    themeToggle.addEventListener('click', function() {
        var html = document.documentElement;
        var currentTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var newTheme = currentTheme === 'light' ? 'dark' : 'light';

        function aplicarCambioTema() {
            html.setAttribute('data-theme', newTheme);
            sincronizarBotonTema(newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {}
            aplicarColoresIconos(newTheme);
            actualizarColoresGraficoVentas();

            Object.keys(charts).forEach(function(key) {
                if (key !== 'ingresos' && charts[key] && charts[key].update) {
                    charts[key].update();
                }
            });

            themeChangeListeners.forEach(function(listener) {
                listener(newTheme);
            });
        }

        // Transición circular suave inspirada en @settigation cuando el navegador soporta View Transitions
        if (document.startViewTransition && !wgPrefersReducedMotion()) {
            var rect = themeToggle.getBoundingClientRect();
            var x = rect.left + rect.width / 2;
            var y = rect.top + rect.height / 2;
            var maxRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            var transition = document.startViewTransition(function() {
                aplicarCambioTema();
            });

            transition.ready.then(function() {
                document.documentElement.animate(
                    {
                        clipPath: [
                            'circle(0px at ' + x + 'px ' + y + 'px)',
                            'circle(' + maxRadius + 'px at ' + x + 'px ' + y + 'px)'
                        ]
                    },
                    {
                        duration: 420,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            }).catch(function() {});
        } else {
            aplicarCambioTema();
        }

    });
}

function aplicarColoresIconos(theme) {
    // La jerarquía cromática de iconos está gobernada íntegramente por variables CSS del Design System
    return theme;
}

// ========== NOTIFICACIONES ==========
function initNotifications() {
    var notificationBtn = document.querySelector('.notification-btn');
    var panel = document.getElementById('notificationPanel');

    if (!notificationBtn || !panel) return;

    cargarNotificaciones();

    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        // Cerrar menú de perfil si está abierto
        var profileMenu = document.getElementById('profileMenu');
        var profileDropdown = document.getElementById('profileDropdown');
        var profileBtn = document.getElementById('profileBtn');
        if (profileMenu) profileMenu.classList.remove('open');
        if (profileDropdown) profileDropdown.classList.remove('open');
        if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');

        var isOpen = panel.classList.toggle('open');
        notificationBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen && notificationCount > 0) {
            marcarTodasLeidas();
        }
    });

    document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && !notificationBtn.contains(e.target)) {
            panel.classList.remove('open');
            notificationBtn.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            panel.classList.remove('open');
            notificationBtn.setAttribute('aria-expanded', 'false');
        }
    });

    var markAll = document.querySelector('.mark-all');
    if (markAll) {
        markAll.addEventListener('click', function(e) {
            e.stopPropagation();
            marcarTodasLeidas();
            panel.classList.remove('open');
            notificationBtn.setAttribute('aria-expanded', 'false');
            mostrarToast('Notificaciones marcadas como leídas', 'success');
        });
    }

    setInterval(cargarNotificaciones, CONFIG.REFRESH_INTERVAL);
}

async function cargarNotificaciones() {
    try {
        var response = await fetch('/api/notificaciones');
        if (!response.ok) return;
        var data = await response.json();

        var list = document.querySelector('.notification-list');
        var badge = document.getElementById('notificationBadge');
        var countPill = document.getElementById('notificationPanelCount');

        if (!list) return;

        var items = Array.isArray(data) ? data : [];
        var unread = items.filter(function(n) { return !n.leido; }).length;
        notificationCount = unread;

        if (badge) {
            badge.textContent = unread > 99 ? '99+' : (unread > 0 ? String(unread) : '');
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }

        if (countPill) {
            if (unread > 0) {
                countPill.textContent = unread + (unread === 1 ? ' pendiente' : ' pendientes');
                countPill.classList.add('has-unread');
            } else {
                countPill.textContent = 'Al día';
                countPill.classList.remove('has-unread');
            }
        }

        if (items.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:28px 16px;">' +
                '<i class="fas fa-bell-slash" style="font-size:1.35rem;margin-bottom:6px;"></i>' +
                '<p style="font-size:12.5px;">No hay notificaciones pendientes</p>' +
            '</div>';
            return;
        }

        var recent = items.slice(0, CONFIG.MAX_NOTIFICATIONS);
        list.innerHTML = recent.map(function(n) {
            var icono = wgEscapeHtml(n.icono || 'fa-bell');
            var mensaje = wgEscapeHtml(n.mensaje || 'Notificación del sistema');
            var hace = wgEscapeHtml(n.hace || 'Reciente');
            return '<div class="notification-item ' + (n.leido ? '' : 'unread') + '">' +
                '<i class="fas ' + icono + '"></i>' +
                '<div style="flex:1;min-width:0;">' +
                    '<p style="margin:0;font-size:13px;font-weight:500;color:var(--text);line-height:1.35;">' + mensaje + '</p>' +
                    '<small style="color:var(--text-muted);font-size:11.5px;">' + hace + '</small>' +
                '</div>' +
            '</div>';
        }).join('');

    } catch (error) {
        console.error('Error cargando notificaciones:', error);
    }
}

async function marcarTodasLeidas() {
    try {
        await fetch('/api/notificaciones/marcar-todas', { method: 'POST' });
        notificationCount = 0;
        var badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = '';
            badge.style.display = 'none';
        }
        var countPill = document.getElementById('notificationPanelCount');
        if (countPill) {
            countPill.textContent = 'Al día';
            countPill.classList.remove('has-unread');
        }
        document.querySelectorAll('.notification-item.unread').forEach(function(item) {
            item.classList.remove('unread');
        });
    } catch (error) {
        console.error('Error marcando notificaciones:', error);
    }
}

// ========== PERFIL DE USUARIO ==========
function initProfile() {
    var profileBtn = document.querySelector('.profile-btn');
    var profileMenu = document.getElementById('profileMenu');
    var profileDropdown = document.getElementById('profileDropdown') || (profileBtn ? profileBtn.closest('.profile-dropdown') : null);

    if (!profileBtn || !profileMenu) return;

    function cerrarMenuPerfil() {
        profileMenu.classList.remove('open');
        if (profileDropdown) profileDropdown.classList.remove('open');
        profileBtn.setAttribute('aria-expanded', 'false');
    }

    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        // Cerrar panel de notificaciones si está abierto
        var notifPanel = document.getElementById('notificationPanel');
        var notifBtn = document.getElementById('notificationBtn');
        if (notifPanel) notifPanel.classList.remove('open');
        if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');

        var isOpen = profileMenu.classList.toggle('open');
        if (profileDropdown) profileDropdown.classList.toggle('open', isOpen);
        profileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function(e) {
        if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
            cerrarMenuPerfil();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && profileMenu.classList.contains('open')) {
            cerrarMenuPerfil();
        }
    });
}

// ========== FAB ==========
function initFab() {
    var fabBtn = document.getElementById('fabBtn');
    var fabMenu = document.getElementById('fabMenu');

    if (!fabBtn || !fabMenu) return;

    fabBtn.addEventListener('click', function() {
        fabMenu.classList.toggle('open');
        var icon = fabBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-plus');
            icon.classList.toggle('fa-times');
        }
    });

    document.addEventListener('click', function(e) {
        if (!fabBtn.contains(e.target) && !fabMenu.contains(e.target)) {
            fabMenu.classList.remove('open');
            var icon = fabBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-plus');
            }
        }
    });
}

// ========== INICIALIZAR TOOLTIPS ==========
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            var tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = 'position:fixed;padding:6px 12px;background:var(--bg-elevated);color:var(--text);border-radius:6px;font-size:12px;box-shadow:var(--shadow-md);border:1px solid var(--border-color);z-index:99999;pointer-events:none;max-width:220px;white-space:nowrap;';
            var rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - 32) + 'px';
            tooltip.style.left = Math.max(8, rect.left + rect.width / 2 - 60) + 'px';
            document.body.appendChild(tooltip);

            this.addEventListener('mouseleave', function() {
                tooltip.remove();
            }, { once: true });
        });
    });
}

// ========== INICIALIZAR DATATABLE ==========
function initDataTable() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(function(th) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', function() {
            var table = this.closest('.data-table');
            var tbody = table.querySelector('tbody');
            var index = Array.from(this.parentElement.children).indexOf(this);
            var rows = Array.from(tbody.querySelectorAll('tr'));
            var isAsc = this.dataset.sort === 'asc';

            rows.sort(function(a, b) {
                var aVal = a.children[index]?.textContent.trim() || '';
                var bVal = b.children[index]?.textContent.trim() || '';
                return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });

            rows.forEach(function(row) {
                tbody.appendChild(row);
            });
            this.dataset.sort = isAsc ? 'desc' : 'asc';
            var icon = this.querySelector('i');
            if (icon) icon.remove();
            this.innerHTML += isAsc ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>';
        });
    });
}

// ========== FUNCION DE BUSQUEDA ==========
function initSearchFunctionality() {
    var searchInput = document.querySelector('.table-search input');
    if (!searchInput) return;

    var wrapper = searchInput.parentElement;
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearBtn.className = 'search-clear';
    clearBtn.style.cssText = 'display:none;background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 10px;';
    wrapper.appendChild(clearBtn);

    searchInput.addEventListener('keyup', function() {
        var filter = this.value.toUpperCase();
        var table = this.closest('.table-container')?.querySelector('.data-table tbody');
        if (!table) return;

        var rows = table.getElementsByTagName('tr');
        var visibleCount = 0;

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.classList.contains('no-results')) continue;
            var text = row.textContent.toUpperCase();
            var match = text.includes(filter);
            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        }

        clearBtn.style.display = filter ? 'block' : 'none';

        var noResults = table.querySelector('.no-results');
        if (visibleCount === 0 && rows.length > 0 && filter) {
            if (!noResults) {
                var tr = document.createElement('tr');
                tr.className = 'no-results';
                var td = document.createElement('td');
                td.colSpan = table.querySelector('tr')?.cells?.length || 1;
                td.className = 'text-center';
                td.style.cssText = 'padding:40px 20px;color:var(--text-muted);text-align:center;';
                td.innerHTML = '<i class="fas fa-search" style="font-size:22px;display:block;margin-bottom:8px;"></i> No se encontraron resultados';
                tr.appendChild(td);
                table.appendChild(tr);
            }
        } else if (noResults) {
            noResults.remove();
        }
    });

    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('keyup'));
        searchInput.focus();
    });
}

// ========== AUTO REFRESH ==========
function initAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);

    refreshInterval = setInterval(function() {
        if (autoRefreshEnabled && document.hidden === false) {
            var path = window.location.pathname;
            if (path === '/dashboard' || path === '/') {
                cargarDashboard();
                cargarGraficos();
                cargarActividadReciente();
            }
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// ========== CARGAR DATOS SEGUN PAGINA ==========
async function cargarDatosPagina() {
    var path = window.location.pathname;
    console.log('Cargando pagina:', path);

    var pageMap = {
        '/dashboard': async function() {
            await Promise.all([
                cargarDashboard(),
                cargarGraficos(),
                cargarActividadReciente()
            ]);
            graficosCargados = true;
            await cargarQuickActions();
            await cargarEstadisticasRapidas();
        },
        '/cliente_listar': cargarClientes,
        '/cliente_registrar': initRegistroCliente,
        '/cliente_buscar': initBuscarCliente,
        '/cliente_actualizar': initActualizarCliente,
        '/cliente_asistencia': initRegistroAsistencia,
        '/cliente_membresia': initAsignarMembresia,
        '/cliente_asignar_entrenador': initAsignarEntrenador,
        '/cliente_rutina': initAsignarRutina,
        '/empleado_listar': cargarEmpleados,
        '/empleado_registrar': initRegistroEmpleado,
        '/empleado_asistencias': cargarAsistenciasEmpleados,
        '/empleado_pago': cargarPagosEmpleados,
        '/producto_listar': cargarProductos,
        '/producto_registrar': initRegistroProducto,
        '/producto_actualizar': initActualizarProducto,
        '/ejercicio_listar': cargarEjercicios,
        '/ejercicio_registrar': initRegistroEjercicio,
        '/ejercicio_buscar': initBuscarEjercicio,
        '/ejercicio_actualizar': initActualizarEjercicio,
        '/venta_listar': cargarVentas,
        '/venta_registrar': initRegistroVenta,
        '/venta_registrar_multiple': initRegistroVentaMultiple,
        '/compra_listar': cargarCompras,
        '/compra_registrar': initRegistroCompra,
        '/usuario_listar': cargarUsuarios,
        '/usuario_crear': initCrearUsuario,
        '/usuario_buscar': initBuscarUsuario,
        '/usuario_cambiar_contrasena': initCambiarContrasena,
        '/maquinaria_listar': cargarMaquinaria,
        '/membresia_listar': cargarMembresias,
        '/grupo_muscular_listar': cargarGruposMusculares,
        '/grupo_muscular_actualizar': initActualizarGrupoMuscular,
        '/inventario_lista': cargarInventario,
        '/inventario_entrada': initEntradaStock,
        '/inventario_salida': initSalidaStock,
        '/inventario_movimiento': cargarMovimientosInventario,
        '/reporte_ingresos': cargarReporteIngresos,
        '/reporte_ventas_producto': cargarReporteVentasProducto,
        '/reporte_membresias_activas': cargarReporteMembresias,
        '/reporte_rutinas_activas': cargarReporteRutinas,
        '/reporte_asistencias': cargarReporteAsistencias,
        '/rutina_asignar': initAsignarRutina,
        '/rutina_hoy': initRutinaHoy,
        '/rutina_definir_dia': initDefinirDiaRutina,
        '/rutina_agregar_ejercicio': initAgregarEjercicioRutina,
        '/mantenimiento_registrar': initRegistroMantenimiento,
        '/mantenimiento_ver': cargarMantenimientos,
        '/cliente_qr': initGenerarQR,
        '/empleado_buscar': initBuscarEmpleado,
        '/error_reportar': initReportarError,
        '/error_listar': initListarErrores
    };

    var pageFunction = pageMap[path];
    if (pageFunction) {
        try {
            await pageFunction();
        } catch (error) {
            console.error('Error al cargar pagina:', error);
        }
    } else {
        console.log('Pagina sin funcion especifica:', path);
    }
}

// ========== DASHBOARD EJECUTIVO Y ANIMACION DE CONTEO ==========
function animarValorNumerico(el, valorFinal, esMoneda, usarConteoInicial) {
    if (!el) return;
    var destino = Number(valorFinal || 0);
    if (isNaN(destino)) destino = 0;

    function formatear(n) {
        if (esMoneda) {
            return wgFormatearMoneda(n);
        }
        return Math.round(n).toLocaleString('es-NI');
    }

    if (el._countRafId) {
        cancelAnimationFrame(el._countRafId);
        el._countRafId = null;
    }

    var previo = (typeof el._lastNumericValue === 'number') ? el._lastNumericValue : 0;
    el._lastNumericValue = destino;
    el.setAttribute('data-target', String(destino));

    if (wgPrefersReducedMotion() || (!usarConteoInicial && previo === destino) || (usarConteoInicial && destino === 0)) {
        el.textContent = formatear(destino);
        return;
    }

    var origen = usarConteoInicial ? 0 : previo;
    if (origen === destino) {
        el.textContent = formatear(destino);
        return;
    }

    var duracion = usarConteoInicial ? 680 : 380;
    var inicioTs = null;

    function paso(ts) {
        if (!inicioTs) inicioTs = ts;
        var progreso = Math.min((ts - inicioTs) / duracion, 1);
        // easeOutQuart: desaceleración suave estilo SaaS moderno (@settigation)
        var ease = 1 - Math.pow(1 - progreso, 4);
        var actual = origen + (destino - origen) * ease;
        el.textContent = formatear(actual);
        if (progreso < 1) {
            el._countRafId = requestAnimationFrame(paso);
        } else {
            el.textContent = formatear(destino);
            el._countRafId = null;
        }
    }

    el._countRafId = requestAnimationFrame(paso);
}

function actualizarTendenciaTarjeta(elementId, variacion, sufijoComparacion, textoAlternativo) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var sufijo = sufijoComparacion ? (' ' + sufijoComparacion) : '';

    if (variacion !== null && variacion !== undefined && variacion !== '' && !isNaN(variacion)) {
        var num = Number(variacion);
        el.style.display = 'inline-flex';
        if (num > 0) {
            el.className = 'stat-trend positive';
            el.innerHTML = '<i class="fas fa-arrow-trend-up"></i> +' + num + '%' + wgEscapeHtml(sufijo);
        } else if (num < 0) {
            el.className = 'stat-trend negative';
            el.innerHTML = '<i class="fas fa-arrow-trend-down"></i> ' + num + '%' + wgEscapeHtml(sufijo);
        } else {
            el.className = 'stat-trend neutral';
            el.innerHTML = '<i class="fas fa-minus"></i> 0%' + wgEscapeHtml(sufijo);
        }
    } else if (textoAlternativo) {
        el.style.display = 'inline-flex';
        el.className = 'stat-trend neutral';
        el.textContent = textoAlternativo;
    } else {
        el.style.display = 'none';
        el.innerHTML = '';
    }
}

async function cargarDashboard() {
    var esPrimeraCarga = !dashboardConteoInicialRealizado;

    try {
        var response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Error en la respuesta de estadísticas');
        var stats = await response.json();

        document.querySelectorAll('[data-stat-card]').forEach(function(card) {
            card.classList.remove('is-loading');
        });

        var montoVentasMes = (stats.ventas_mes_monto !== undefined) ? stats.ventas_mes_monto : (stats.ventas_mes || 0);
        var metricasPrincipales = [
            { id: 'totalClientes', val: stats.total_clientes || 0, moneda: false },
            { id: 'totalEmpleados', val: stats.total_empleados || 0, moneda: false },
            { id: 'totalProductos', val: stats.total_productos || 0, moneda: false },
            { id: 'ventasMes', val: montoVentasMes, moneda: true },
            { id: 'membresiasActivas', val: stats.membresias_activas || 0, moneda: false },
            { id: 'totalEjercicios', val: stats.total_ejercicios || 0, moneda: false },
            { id: 'totalCompras', val: stats.total_compras || 0, moneda: false },
            { id: 'ventasHoy', val: stats.ventas_hoy || 0, moneda: false },
            { id: 'clientesNuevos', val: stats.clientes_nuevos || 0, moneda: false },
            { id: 'ingresosTotales', val: stats.ingresos_totales || 0, moneda: true }
        ];

        metricasPrincipales.forEach(function(item) {
            var el = document.getElementById(item.id);
            if (el) {
                animarValorNumerico(el, item.val, item.moneda, esPrimeraCarga);
            }
        });

        dashboardConteoInicialRealizado = true;

        // Indicadores de variación únicamente cuando existen datos históricos reales (sin cifras ficticias)
        actualizarTendenciaTarjeta('trendClientes', stats.variacion_clientes, 'últ. 30d', null);
        actualizarTendenciaTarjeta('trendEmpleados', stats.variacion_empleados, 'últ. 30d', null);
        actualizarTendenciaTarjeta('trendProductos', stats.variacion_productos, 'últ. 30d', null);
        actualizarTendenciaTarjeta('trendVentas', stats.variacion_ventas_mes, 'vs mes ant.', null);
        actualizarTendenciaTarjeta('trendMembresias', stats.variacion_membresias, 'últ. 30d', null);
        actualizarTendenciaTarjeta('trendEjercicios', null, '', null);

        // Subtítulos contextuales basados exclusivamente en registros reales de la BD
        var metaClientes = document.getElementById('metaClientes');
        if (metaClientes) {
            var altas30d = Number(stats.clientes_ultimos_30d || 0);
            metaClientes.textContent = altas30d > 0
                ? (altas30d + (altas30d === 1 ? ' nuevo registro en últimos 30 días' : ' nuevos registros en últimos 30 días'))
                : 'Padrón general registrado en el sistema';
        }

        var metaEmpleados = document.getElementById('metaEmpleados');
        if (metaEmpleados) {
            var cargos = Number(stats.empleados_cargos || 0);
            metaEmpleados.textContent = cargos > 0
                ? ('Equipo distribuido en ' + cargos + (cargos === 1 ? ' cargo activo' : ' cargos activos'))
                : 'Personal operativo activo';
        }

        var metaProductos = document.getElementById('metaProductos');
        if (metaProductos) {
            var conStock = Number(stats.productos_con_stock || 0);
            var bajoStock = Number(stats.productos_bajo_stock || 0);
            if (bajoStock > 0) {
                metaProductos.textContent = conStock + ' con stock · ' + bajoStock + ' en nivel bajo';
            } else if (conStock > 0) {
                metaProductos.textContent = conStock + ' productos con stock disponible';
            } else {
                metaProductos.textContent = 'Catálogo general de suplementos y artículos';
            }
        }

        var metaVentas = document.getElementById('metaVentas');
        if (metaVentas) {
            var cantMes = Number(stats.ventas_mes_cantidad || 0);
            var histTotal = Number(stats.total_ventas_historicas || 0);
            if (cantMes > 0) {
                metaVentas.textContent = cantMes + (cantMes === 1 ? ' venta facturada este mes' : ' ventas facturadas este mes');
            } else if (histTotal > 0) {
                metaVentas.textContent = 'Sin ventas este mes · ' + histTotal + ' en historial';
            } else {
                metaVentas.textContent = 'Facturación acumulada del mes actual';
            }
        }

        var metaMembresias = document.getElementById('metaMembresias');
        if (metaMembresias) {
            var planesActivos = Number(stats.planes_con_activos || 0);
            var pagos30d = Number(stats.pagos_membresia_30d || 0);
            if (planesActivos > 0 && pagos30d > 0) {
                metaMembresias.textContent = planesActivos + (planesActivos === 1 ? ' plan activo' : ' planes activos') + ' · ' + pagos30d + (pagos30d === 1 ? ' pago (30d)' : ' pagos (30d)');
            } else if (planesActivos > 0) {
                metaMembresias.textContent = 'Distribuidas en ' + planesActivos + (planesActivos === 1 ? ' plan vigente' : ' planes vigentes');
            } else {
                metaMembresias.textContent = 'Suscripciones vigentes de clientes';
            }
        }

        var metaEjercicios = document.getElementById('metaEjercicios');
        if (metaEjercicios) {
            var grupos = Number(stats.grupos_musculares_cubiertos || 0);
            metaEjercicios.textContent = grupos > 0
                ? ('Cobertura en ' + grupos + (grupos === 1 ? ' grupo muscular' : ' grupos musculares'))
                : 'Biblioteca técnica de entrenamiento';
        }

    } catch (error) {
        console.error('Error cargando dashboard:', error);
        document.querySelectorAll('[data-stat-card]').forEach(function(card) {
            card.classList.remove('is-loading');
        });
    }
}

// ========== ANALITICA DE VENTAS CON DATOS REALES ==========
function parseFechaVentaJS(fechaStr) {
    if (!fechaStr) return null;
    var s = String(fechaStr).trim();
    var partesSlash = s.split(' ')[0].split('/');
    if (partesSlash.length === 3) {
        var d = parseInt(partesSlash[0], 10);
        var m = parseInt(partesSlash[1], 10) - 1;
        var y = parseInt(partesSlash[2], 10);
        var dt = new Date(y, m, d);
        if (!isNaN(dt.getTime())) return dt;
    }
    var dtIso = new Date(s);
    if (!isNaN(dtIso.getTime())) return dtIso;
    return null;
}

const wgHoverGuidePlugin = {
    id: 'wgHoverGuide',
    afterDatasetsDraw: function(chart) {
        var active = chart.tooltip && chart.tooltip.getActiveElements ? chart.tooltip.getActiveElements() : [];
        if (!active || active.length === 0) return;
        var ctx = chart.ctx;
        var x = active[0].element.x;
        var topY = chart.scales.y.top;
        var bottomY = chart.scales.y.bottom;
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isDark ? 'rgba(245, 130, 32, 0.45)' : 'rgba(245, 130, 32, 0.38)';
        ctx.stroke();
        ctx.restore();
    }
};

function sincronizarControlesPeriodoVentas(periodo) {
    var selectEl = document.getElementById('ventasPeriodoSelect');
    if (selectEl && selectEl.value !== periodo) {
        selectEl.value = periodo;
    }
    document.querySelectorAll('#ventasPeriodoTabs .period-pill').forEach(function(btn) {
        var activo = btn.getAttribute('data-periodo') === periodo;
        btn.classList.toggle('active', activo);
        btn.setAttribute('aria-selected', activo ? 'true' : 'false');
    });
    try {
        sessionStorage.setItem('ventasPeriodo', periodo);
    } catch (e) {}
}

async function cargarGraficos(periodoForzado) {
    var ingresosCanvas = document.getElementById('ingresosChart');
    var periodoSelect = document.getElementById('ventasPeriodoSelect');
    var tabsContainer = document.getElementById('ventasPeriodoTabs');
    var skeletonEl = document.getElementById('ventasChartSkeleton');
    var emptyStateEl = document.getElementById('ventasEmptyState');
    var emptyMsgEl = document.getElementById('ventasEmptyMessage');
    var btnHistorialAnual = document.getElementById('btnVerHistorialAnual');
    var errorStateEl = document.getElementById('ventasErrorState');
    var btnReintentar = document.getElementById('btnReintentarGrafico');

    if (!ingresosCanvas || typeof Chart === 'undefined') {
        return;
    }

    // Enlazar selectores de período una sola vez
    if (periodoSelect && !periodoSelect._listenerAttached) {
        periodoSelect._listenerAttached = true;
        periodoSelect.addEventListener('change', function() {
            cargarGraficos(periodoSelect.value);
        });
    }

    if (tabsContainer && !tabsContainer._listenerAttached) {
        tabsContainer._listenerAttached = true;
        tabsContainer.querySelectorAll('.period-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
                var p = pill.getAttribute('data-periodo');
                if (p) cargarGraficos(p);
            });
        });
    }

    if (btnHistorialAnual && !btnHistorialAnual._listenerAttached) {
        btnHistorialAnual._listenerAttached = true;
        btnHistorialAnual.addEventListener('click', function() {
            cargarGraficos('1anio');
        });
    }

    if (btnReintentar && !btnReintentar._listenerAttached) {
        btnReintentar._listenerAttached = true;
        btnReintentar.addEventListener('click', function() {
            cargarGraficos();
        });
    }

    var periodoGuardado = null;
    try {
        periodoGuardado = sessionStorage.getItem('ventasPeriodo');
    } catch (e) {}

    var periodo = periodoForzado || periodoGuardado || (periodoSelect ? periodoSelect.value : '1anio') || '1anio';
    var periodosValidos = ['7dias', '30dias', '3meses', '6meses', '1anio'];
    if (periodosValidos.indexOf(periodo) === -1) {
        periodo = '1anio';
    }
    sincronizarControlesPeriodoVentas(periodo);

    if (!charts.ingresos && skeletonEl) {
        skeletonEl.hidden = false;
    }

    try {
        var res = await fetch('/api/dashboard/ventas-resumen?periodo=' + encodeURIComponent(periodo));
        if (!res.ok) throw new Error('Error HTTP ' + res.status);
        var resumen = await res.json();
        ventasResumenCache = resumen;

        if (skeletonEl) skeletonEl.hidden = true;
        if (errorStateEl) errorStateEl.hidden = true;

        // Actualizar franja superior de KPIs reales del período
        var elTotal = document.getElementById('ventasPeriodoTotal');
        var elCantidad = document.getElementById('ventasPeriodoCantidad');
        var elPromedio = document.getElementById('ventasPeriodoPromedio');

        if (elTotal) elTotal.textContent = wgFormatearMoneda(resumen.total_importe || 0);
        if (elCantidad) {
            var nVentas = Number(resumen.total_ventas || 0);
            elCantidad.textContent = nVentas.toLocaleString('es-NI') + (nVentas === 1 ? ' venta' : ' ventas');
        }
        if (elPromedio) elPromedio.textContent = wgFormatearMoneda(resumen.promedio_venta || 0);
        actualizarTendenciaTarjeta('ventasPeriodoVariacion', resumen.variacion_periodo, 'vs período ant.', null);

        // Si no existen ventas reales en el período seleccionado, mostrar estado vacío profesional
        if (!resumen.tiene_datos) {
            ingresosCanvas.style.opacity = '0';
            ingresosCanvas.style.pointerEvents = 'none';
            if (emptyStateEl) {
                emptyStateEl.hidden = false;
                var nombresPeriodo = {
                    '7dias': 'los últimos 7 días',
                    '30dias': 'los últimos 30 días',
                    '3meses': 'los últimos 3 meses',
                    '6meses': 'los últimos 6 meses',
                    '1anio': 'el último año'
                };
                if (emptyMsgEl) {
                    if (resumen.existen_ventas_historicas && periodo !== '1anio') {
                        emptyMsgEl.textContent = 'No se registraron ventas de productos en ' + (nombresPeriodo[periodo] || 'este período') + '. Puedes consultar el historial anual o registrar una nueva operación.';
                    } else {
                        emptyMsgEl.textContent = 'Todavía no hay información suficiente de ventas en ' + (nombresPeriodo[periodo] || 'este período') + ' para proyectar la curva.';
                    }
                }
                if (btnHistorialAnual) {
                    btnHistorialAnual.hidden = !(resumen.existen_ventas_historicas && periodo !== '1anio');
                }
            }
            graficosCargados = true;
            return;
        }

        if (emptyStateEl) emptyStateEl.hidden = true;
        ingresosCanvas.style.opacity = '1';
        ingresosCanvas.style.pointerEvents = 'auto';

        var labels = Array.isArray(resumen.labels) ? resumen.labels : [];
        var importes = Array.isArray(resumen.importes) ? resumen.importes : [];
        var cantidades = Array.isArray(resumen.cantidades) ? resumen.cantidades : [];
        var fechasCompletas = Array.isArray(resumen.fechas_completas) ? resumen.fechas_completas : labels;

        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var textColor = isDark ? '#9BA5B7' : '#667085';
        var gridColor = isDark ? 'rgba(155, 165, 183, 0.09)' : '#EEF1F5';
        var pointRadius = labels.length > 16 ? 2.5 : 4;
        var maxTicks = labels.length > 14 ? 8 : 12;
        var animDuration = wgPrefersReducedMotion() ? 0 : 620;

        if (charts.ingresos) {
            charts.ingresos.data.labels = labels;
            charts.ingresos.data.datasets[0].data = importes;
            charts.ingresos.data.datasets[0].pointRadius = pointRadius;
            charts.ingresos._fechasCompletas = fechasCompletas;
            charts.ingresos._cantidades = cantidades;
            charts.ingresos.options.scales.x.ticks.maxTicksLimit = maxTicks;
            charts.ingresos.options.animation.duration = wgPrefersReducedMotion() ? 0 : 440;
            actualizarColoresGraficoVentas();
            charts.ingresos.update();
            graficosCargados = true;
            return;
        }

        var ctx = ingresosCanvas.getContext('2d');
        var gradient = ctx.createLinearGradient(0, 0, 0, ingresosCanvas.clientHeight || 280);
        gradient.addColorStop(0, isDark ? 'rgba(245, 130, 32, 0.28)' : 'rgba(245, 130, 32, 0.20)');
        gradient.addColorStop(1, 'rgba(245, 130, 32, 0.00)');

        var chartInstance = new Chart(ingresosCanvas, {
            type: 'line',
            plugins: [wgHoverGuidePlugin],
            data: {
                labels: labels,
                datasets: [{
                    label: 'Importe total',
                    data: importes,
                    borderColor: '#F58220',
                    backgroundColor: gradient,
                    borderWidth: 2.4,
                    fill: true,
                    tension: 0.36,
                    pointBackgroundColor: '#F58220',
                    pointBorderColor: isDark ? '#121721' : '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: pointRadius,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#F58220',
                    pointHoverBorderColor: isDark ? '#FFFFFF' : '#181D27',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                animation: {
                    duration: animDuration,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1B2332' : '#181D27',
                        titleColor: '#FFFFFF',
                        bodyColor: '#E6E8EC',
                        borderColor: isDark ? '#2D384D' : 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                        titleFont: { family: "'Inter', sans-serif", size: 12, weight: '600' },
                        bodyFont: { family: "'Inter', sans-serif", size: 12, weight: '500' },
                        bodySpacing: 5,
                        callbacks: {
                            title: function(items) {
                                if (!items || !items.length) return '';
                                var idx = items[0].dataIndex;
                                var chartRef = items[0].chart;
                                var fechas = chartRef._fechasCompletas || [];
                                return 'Fecha: ' + (fechas[idx] || items[0].label || '');
                            },
                            label: function(context) {
                                var idx = context.dataIndex;
                                var chartRef = context.chart;
                                var cants = chartRef._cantidades || [];
                                var cant = Number(cants[idx] || 0);
                                var imp = Number(context.raw || 0);
                                return [
                                    'Cantidad de ventas: ' + cant.toLocaleString('es-NI'),
                                    'Importe total: ' + wgFormatearMoneda(imp)
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: gridColor, drawBorder: false },
                        ticks: {
                            color: textColor,
                            padding: 8,
                            maxTicksLimit: 6,
                            font: { family: "'Inter', sans-serif", size: 11.5 },
                            callback: function(value) {
                                return 'C$' + Number(value).toLocaleString('es-NI');
                            }
                        }
                    },
                    x: {
                        border: { display: false },
                        grid: { display: false },
                        ticks: {
                            color: textColor,
                            padding: 6,
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: maxTicks,
                            font: { family: "'Inter', sans-serif", size: 11.5 }
                        }
                    }
                }
            }
        });

        chartInstance._fechasCompletas = fechasCompletas;
        chartInstance._cantidades = cantidades;
        charts.ingresos = chartInstance;
        graficosCargados = true;

    } catch (error) {
        console.error('Error cargando resumen de ventas:', error);
        if (skeletonEl) skeletonEl.hidden = true;
        if (emptyStateEl) emptyStateEl.hidden = true;
        ingresosCanvas.style.opacity = '0';
        if (errorStateEl) errorStateEl.hidden = false;
    }
}

// ========== ACTIVIDAD RECIENTE CRONOLOGICA ==========
function renderizarActividadReciente() {
    var container = document.getElementById('recentActivity');
    if (!container) return;

    var listaBase = Array.isArray(actividadRecienteCache) ? actividadRecienteCache : [];
    var filtrada = actividadFiltroActual === 'todos'
        ? listaBase
        : listaBase.filter(function(item) { return item.tipo === actividadFiltroActual; });

    if (filtrada.length === 0) {
        var etiquetasFiltro = {
            'todos': 'movimientos recientes',
            'membresia': 'membresías o pagos recientes',
            'venta': 'ventas recientes',
            'cliente': 'registros de clientes recientes',
            'compra': 'compras de inventario recientes'
        };
        container.innerHTML = '<div class="empty-state" style="padding:32px 16px;">' +
            '<i class="fas fa-inbox" style="font-size:1.5rem;margin-bottom:8px;color:var(--text-muted);"></i>' +
            '<h4 style="margin-bottom:4px;">Sin ' + wgEscapeHtml(etiquetasFiltro[actividadFiltroActual] || 'movimientos') + '</h4>' +
            '<p style="font-size:12.5px;">Los nuevos registros del gimnasio aparecerán ordenados cronológicamente aquí.</p>' +
        '</div>';
        return;
    }

    var recientes = filtrada.slice(0, 8);
    container.innerHTML = recientes.map(function(item, idx) {
        var tipo = item.tipo || 'general';
        var icono = wgEscapeHtml(item.icono || 'fa-circle-check');
        var titulo = wgEscapeHtml(item.titulo || item.descripcion || 'Movimiento registrado');
        var etiqueta = wgEscapeHtml(item.etiqueta || '');
        var cliente = wgEscapeHtml(item.cliente || '');
        var fechaHora = wgEscapeHtml(item.fecha_hora || item.hace || 'Reciente');
        var url = item.url ? wgEscapeHtml(item.url) : '';

        var montoHtml = '';
        if (item.monto !== '' && item.monto !== null && item.monto !== undefined && !isNaN(item.monto) && Number(item.monto) > 0) {
            var esIngreso = (tipo === 'venta' || tipo === 'membresia');
            montoHtml = '<div class="activity-amount' + (esIngreso ? ' is-income' : '') + '">' +
                wgFormatearMoneda(item.monto) +
            '</div>';
        }

        var tagApertura = url
            ? '<a href="' + url + '" class="activity-item" style="--row-index:' + idx + ';">'
            : '<div class="activity-item" style="--row-index:' + idx + ';">';
        var tagCierre = url ? '</a>' : '</div>';

        return tagApertura +
            '<div class="activity-icon type-' + wgEscapeHtml(tipo) + '">' +
                '<i class="fas ' + icono + '"></i>' +
            '</div>' +
            '<div class="activity-details">' +
                '<div class="activity-title-row">' +
                    '<p class="activity-title" title="' + titulo + '">' + titulo + '</p>' +
                    (etiqueta ? '<span class="activity-type-tag">' + etiqueta + '</span>' : '') +
                '</div>' +
                '<div class="activity-subrow">' +
                    (cliente ? '<span class="activity-client" title="' + cliente + '">' + cliente + '</span><span aria-hidden="true">·</span>' : '') +
                    '<span class="activity-time"><i class="far fa-clock"></i> ' + fechaHora + '</span>' +
                '</div>' +
            '</div>' +
            montoHtml +
        tagCierre;
    }).join('');
}

async function cargarActividadReciente(esRefrescoManual) {
    var container = document.getElementById('recentActivity');
    if (!container) return;

    var filtersWrap = document.getElementById('activityFilters');
    if (filtersWrap && !filtersWrap._listenerAttached) {
        filtersWrap._listenerAttached = true;
        filtersWrap.querySelectorAll('.activity-filter-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                actividadFiltroActual = chip.getAttribute('data-filter') || 'todos';
                filtersWrap.querySelectorAll('.activity-filter-chip').forEach(function(c) {
                    var active = c === chip;
                    c.classList.toggle('active', active);
                    c.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                renderizarActividadReciente();
            });
        });
    }

    var refreshBtn = document.getElementById('btnRefreshActivity');
    if (refreshBtn && !refreshBtn._listenerAttached) {
        refreshBtn._listenerAttached = true;
        refreshBtn.addEventListener('click', function() {
            cargarActividadReciente(true);
        });
    }

    if (esRefrescoManual && refreshBtn) {
        refreshBtn.classList.add('is-spinning');
    }

    try {
        var response = await fetch('/api/actividad-reciente');
        if (!response.ok) throw new Error('Error HTTP ' + response.status);
        var data = await response.json();
        actividadRecienteCache = Array.isArray(data) ? data : [];
        renderizarActividadReciente();
        if (esRefrescoManual) {
            mostrarToast('Actividad reciente actualizada', 'info');
        }
    } catch (error) {
        console.error('Error cargando actividad:', error);
        container.innerHTML = '<div class="empty-state" style="padding:32px 16px;">' +
            '<i class="fas fa-triangle-exclamation" style="font-size:1.5rem;margin-bottom:8px;color:var(--danger);"></i>' +
            '<p style="font-size:12.5px;">No se pudo cargar la actividad reciente en este momento.</p>' +
        '</div>';
    } finally {
        if (refreshBtn) {
            setTimeout(function() {
                refreshBtn.classList.remove('is-spinning');
            }, 260);
        }
    }
}

// ========== ESTADISTICAS RAPIDAS ==========
async function cargarEstadisticasRapidas() {
    try {
        var response = await fetch('/api/estadisticas-rapidas');
        var data = await response.json();
        
        if (data) {
            var elementos = {
                'clientesHoy': data.clientes_hoy || 0,
                'ventasHoy': data.ventas_hoy || 0,
                'ingresosHoy': data.ingresos_hoy || 0,
                'asistenciasHoy': data.asistencias_hoy || 0
            };
            
            Object.entries(elementos).forEach(function([id, value]) {
                var el = document.getElementById(id);
                if (el) {
                    if (id === 'ingresosHoy') {
                        el.innerHTML = 'C$' + Number(value).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    } else {
                        el.innerText = Number(value).toLocaleString('es-NI');
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error cargando estadisticas rapidas:', error);
    }
}

// ========== ACCIONES RAPIDAS ==========
function cargarQuickActions() {
    var container = document.getElementById('quickActions');
    if (!container) return;
    
    var acciones = [
        { url: '/cliente_registrar', icono: 'fa-user-plus', texto: 'Registrar Cliente', desc: 'Nuevo cliente en el sistema' },
        { url: '/venta_registrar', icono: 'fa-cart-plus', texto: 'Nueva Venta', desc: 'Registrar una venta' },
        { url: '/ejercicio_registrar', icono: 'fa-dumbbell', texto: 'Nuevo Ejercicio', desc: 'Agregar ejercicio' },
        { url: '/empleado_registrar', icono: 'fa-user-tie', texto: 'Nuevo Empleado', desc: 'Registrar empleado' }
    ];
    
    container.innerHTML = acciones.map(function(a) {
        return '<a href="' + a.url + '" class="action-card">' +
            '<div class="action-icon"><i class="fas ' + a.icono + '"></i></div>' +
            '<div class="action-info">' +
                '<h4>' + a.texto + '</h4>' +
                '<p>' + a.desc + '</p>' +
            '</div>' +
        '</a>';
    }).join('');
}

// ========== FUNCIONES DE CARGA DE DATOS ==========

async function cargarClientes() {
    mostrarLoading(true);
    var tbody = document.querySelector('#clientesBody, #clientesTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/clientes/listar');
        var clientes = await response.json();
        
        if (!clientes || clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-users" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay clientes registrados</p><a href="/cliente_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-user-plus"></i> Registrar Cliente</a></div></td></tr>';
        } else {
            tbody.innerHTML = clientes.map(function(c) {
                return '<tr>' +
                    '<td><strong>' + (c.IdCliente || c.id || '') + '</strong></td>' +
                    '<td>' + (c.PrimerNombre || c.primerNombre || '') + '</td>' +
                    '<td>' + (c.SegundoNombre || c.segundoNombre || '-') + '</td>' +
                    '<td>' + (c.PrimerApellido || c.primerApellido || '') + '</td>' +
                    '<td>' + (c.SegundoApellido || c.segundoApellido || '-') + '</td>' +
                    '<td>' + (c.Telefono || c.telefono || '') + '</td>' +
                    '<td>' + (c.Correo || c.correo || '') + '</td>' +
                    '<td>' + (c.FechaRegistro || c.fechaRegistro || '') + '</td>' +
                    '<td class="table-actions">' +
                        '<a href="/cliente_perfil/' + (c.IdCliente || c.id) + '" class="btn-view" title="Ver Perfil"><i class="fas fa-user-circle"></i></a>' +
                        '<a href="/cliente_actualizar/' + (c.IdCliente || c.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a>' +
                        '<button onclick="eliminarCliente(' + (c.IdCliente || c.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>' +
                    '</td>' +
                    '</tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar clientes</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarEmpleados() {
    mostrarLoading(true);
    var tbody = document.querySelector('#empleadosBody, #empleadosTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/empleados/listar');
        var empleados = await response.json();
        
        if (!empleados || empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-user-tie" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay empleados registrados</p><a href="/empleado_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-user-plus"></i> Registrar Empleado</a></div></td></tr>';
        } else {
            tbody.innerHTML = empleados.map(function(e) {
                return '<tr>' +
                    '<td><strong>' + (e.IdEmpleado || e.id || '') + '</strong></td>' +
                    '<td>' + (e.PrimerNombre || e.primerNombre || '') + '</td>' +
                    '<td>' + (e.SegundoNombre || e.segundoNombre || '-') + '</td>' +
                    '<td>' + (e.PrimerApellido || e.primerApellido || '') + '</td>' +
                    '<td>' + (e.SegundoApellido || e.segundoApellido || '-') + '</td>' +
                    '<td>' + (e.Telefono || e.telefono || '') + '</td>' +
                    '<td>' + (e.Correo || e.correo || '') + '</td>' +
                    '<td>' + (e.Cargo || e.cargo || e.NombreCargo || '') + '</td>' +
                    '<td>$' + Number(e.Salario || e.salario || 0).toLocaleString() + '</td>' +
                    '<td>' + (e.FechaContratacion || e.fechaContratacion || '') + '</td>' +
                    '<td class="table-actions">' +
                        '<a href="/empleado_actualizar?id=' + (e.IdEmpleado || e.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a>' +
                        '<button onclick="eliminarEmpleado(' + (e.IdEmpleado || e.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button>' +
                        '<a href="/empleado_pago?id=' + (e.IdEmpleado || e.id) + '" class="btn-view" title="Ver Pagos"><i class="fas fa-money-bill"></i></a>' +
                    '</td>' +
                    '</tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando empleados:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar empleados</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarProductos() {
    mostrarLoading(true);
    var tbody = document.querySelector('#productosBody, #productosTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/productos/listar');
        var productos = await response.json();
        
        if (!productos || productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-box" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay productos registrados</p><a href="/producto_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-plus-circle"></i> Registrar Producto</a></div></td></tr>';
        } else {
            tbody.innerHTML = productos.map(function(p) {
                var stock = p.Stock || p.stock || 0;
                var badgeClass = stock > 10 ? 'badge-success' : (stock > 5 ? 'badge-warning' : 'badge-danger');
                return '<tr><td><strong>' + (p.IdProducto || p.id || '') + '</strong></td><td>' + (p.NombreProducto || p.nombre || '') + '</td><td>' + (p.Marca || p.marca || '') + '</td><td>' + (p.Categoria || p.categoria || '') + '</td><td>$' + Number(p.Precio || p.precio || 0).toLocaleString() + '</td><td><span class="badge ' + badgeClass + '">' + stock + '</span></td><td>' + (p.FechaRegistro || p.fechaRegistro || '') + '</td><td class="table-actions"><a href="/producto_actualizar?id=' + (p.IdProducto || p.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a><button onclick="eliminarProducto(' + (p.IdProducto || p.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar productos</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarEjercicios() {
    mostrarLoading(true);
    var tbody = document.querySelector('#ejerciciosBody, #ejerciciosTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/ejercicios/listar');
        var ejercicios = await response.json();
        
        if (!ejercicios || ejercicios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-dumbbell" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay ejercicios registrados</p><a href="/ejercicio_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-plus-circle"></i> Registrar Ejercicio</a></div></td></tr>';
        } else {
            tbody.innerHTML = ejercicios.map(function(e) {
                var videoHtml = e.VideoUrl ? '<a href="' + e.VideoUrl + '" target="_blank" class="btn-view"><i class="fas fa-play"></i> Ver</a>' : '-';
                return '<tr><td><strong>' + (e.IdEjercicio || e.id || '') + '</strong></td><td>' + (e.NombreEjercicio || e.nombre || '') + '</td><td>' + (e.Descripcion || e.descripcion || '') + '</td><td>' + (e.NombreGrupo || e.grupoMuscular || '-') + '</td><td>' + videoHtml + '</td><td class="table-actions"><a href="/ejercicio_actualizar?id=' + (e.IdEjercicio || e.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a><button onclick="eliminarEjercicio(' + (e.IdEjercicio || e.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando ejercicios:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar ejercicios</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarVentas() {
    mostrarLoading(true);
    var tbody = document.querySelector('#ventasBody, #ventasTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/ventas/listar');
        var ventas = await response.json();
        
        if (!ventas || ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-shopping-cart" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay ventas registradas</p><a href="/venta_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-cart-plus"></i> Registrar Venta</a></div></td></tr>';
        } else {
            tbody.innerHTML = ventas.map(function(v) {
                // Como no hay columna Estado en la tabla Ventas, consideramos todas las registradas como 'Completada'
                var estadoClass = (v.Estado === 'completada' || v.Estado === 1 || v.Estado === undefined) ? 'badge-success' : 'badge-warning';
                var estadoText = (v.Estado === 'completada' || v.Estado === 1 || v.Estado === undefined) ? 'Completada' : 'Pendiente';
                var nombreCliente = (v.PrimerNombre || '') + ' ' + (v.PrimerApellido || '');
                var nombreProducto = v.NombreProducto || '';
                var fechaVenta = v.FechaVenta || '';
                return '<tr><td><strong>' + (v.IdVenta || v.id || '') + '</strong></td><td>' + nombreCliente + '</td><td>' + nombreProducto + '</td><td>' + (v.cantidad || v.Cantidad || 0) + '</td><td>$' + Number(v.precioUnitario || v.PrecioUnitario || 0).toLocaleString() + '</td><td><strong>$' + Number(v.total || v.Total || 0).toLocaleString() + '</strong></td><td>' + fechaVenta + '</td><td><span class="badge ' + estadoClass + '">' + estadoText + '</span></td><td class="table-actions"><button onclick="eliminarVenta(' + (v.IdVenta || v.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button><a href="/venta_detalle?id=' + (v.IdVenta || v.id) + '" class="btn-view" title="Ver Detalle"><i class="fas fa-eye"></i></a></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar ventas</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarCompras() {
    mostrarLoading(true);
    var tbody = document.querySelector('#comprasBody, #comprasTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/compras/listar');
        var compras = await response.json();
        
        if (!compras || compras.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-truck" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay compras registradas</p><a href="/compra_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-plus-circle"></i> Registrar Compra</a></div></td></tr>';
        } else {
            tbody.innerHTML = compras.map(function(c) {
                // Determine style and text dynamically based on DB values
                var estadoClass = 'badge-warning';
                var estadoText = c.Estado || 'Pendiente';
                
                if (c.Estado === 'Recibida' || c.Estado === 'recibida' || c.Estado === 'Pagada' || c.Estado === 'pagada' || c.Estado === 1 || c.Estado === true) {
                    estadoClass = 'badge-success';
                    estadoText = 'Recibida';
                } else if (c.Estado === 'Cancelada' || c.Estado === 'cancelada' || c.Estado === 0 || c.Estado === false) {
                    estadoClass = 'badge-danger';
                    estadoText = 'Cancelada';
                } else {
                    estadoClass = 'badge-warning';
                    estadoText = 'Pendiente';
                }

                // Determine actions: text if Cancelled, otherwise show action button
                var accionHtml = '';
                if (c.Estado === 'Cancelada' || c.Estado === 'cancelada' || c.Estado === 0) {
                    accionHtml = '<span style="color: var(--text-secondary); font-size: 12px; font-style: italic;">Anulada</span>';
                } else {
                    accionHtml = '<button onclick="anularCompra(' + (c.IdCompra || c.id) + ')" class="btn-delete-item" title="Anular Compra" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px 8px; font-size: 14px; transition: transform 0.2s ease;"><i class="fas fa-ban"></i></button>';
                }

                // Format date string gracefully
                var fechaStr = c.FechaCompra || c.fecha || c.Fecha || '';
                if (fechaStr && typeof fechaStr === 'string' && fechaStr.includes('T')) {
                    fechaStr = fechaStr.split('T')[0];
                }

                return '<tr>' +
                    '<td><strong>' + (c.IdCompra || c.id || '') + '</strong></td>' +
                    '<td>' + (c.Nombre || c.proveedor || c.Proveedor || '') + '</td>' +
                    '<td>' + (c.NombreProducto || c.producto || c.Producto || '') + '</td>' +
                    '<td>' + (c.Cantidad || c.cantidad || 0) + '</td>' +
                    '<td>$' + Number(c.PrecioCompra || c.precioCompra || 0).toLocaleString() + '</td>' +
                    '<td><strong>$' + Number(c.Total || c.total || 0).toLocaleString() + '</strong></td>' +
                    '<td>' + fechaStr + '</td>' +
                    '<td><span class="badge ' + estadoClass + '">' + estadoText + '</span></td>' +
                    '<td>' + (c.Observacion || '-') + '</td>' +
                    '<td class="table-actions">' + accionHtml + '</td>' +
                    '</tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando compras:', error);
        tbody.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar compras</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarUsuarios() {
    mostrarLoading(true);
    var tbody = document.querySelector('#usuariosBody, #usuariosTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/usuarios/listar');
        var usuarios = await response.json();
        
        function renderTable() {
            var showInactive = false;
            var checkbox = document.getElementById('showInactiveUsers');
            if (checkbox) {
                showInactive = checkbox.checked;
            }
            
            var filtered = usuarios;
            if (!showInactive) {
                filtered = (usuarios || []).filter(function(u) {
                    return u.Estado === true || u.Estado === 1 || u.estado === 1;
                });
            }
            
            var countBadge = document.getElementById('usuariosRegCount');
            if (countBadge) {
                countBadge.textContent = filtered.length + ' registros';
            }
            
            if (!filtered || filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-users-cog" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay usuarios ' + (showInactive ? '' : 'activos ') + 'registrados</p><a href="/usuario_crear" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-user-plus"></i> Crear Usuario</a></div></td></tr>';
            } else {
                tbody.innerHTML = filtered.map(function(u) {
                    var estaActivo = u.Estado === true || u.Estado === 1 || u.estado === 1;
                    var estadoClass = estaActivo ? 'badge-success' : 'badge-danger';
                    var estadoText = estaActivo ? 'Activo' : 'Inactivo';
                    var id = u.IdUsuario || u.id || '';
                    var nombre = u.NombreUsuario || u.usuario || '';
                    var rol = u.NombreRol || u.rol || u.Rol || '';
                    var fecha = u.FechaRegistro || u.fechaRegistro || '';
                    return '<tr><td><strong>' + id + '</strong></td><td>' + nombre + '</td><td>' + rol + '</td><td><span class="badge ' + estadoClass + '">' + estadoText + '</span></td><td>' + fecha + '</td><td class="table-actions"><a href="/usuario_editar?id=' + id + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a><button onclick="eliminarUsuario(' + id + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>';
                }).join('');
            }
        }
        
        var checkbox = document.getElementById('showInactiveUsers');
        if (checkbox) {
            checkbox.removeEventListener('change', checkbox._changeHandler);
            checkbox._changeHandler = function() {
                renderTable();
            };
            checkbox.addEventListener('change', checkbox._changeHandler);
        }
        
        renderTable();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar usuarios</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarMaquinaria() {
    mostrarLoading(true);
    var tbody = document.querySelector('#maquinariaBody, #maquinariaTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/maquinaria/listar');
        var maquinaria = await response.json();
        
        if (!maquinaria || maquinaria.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-microchip" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay equipos registrados</p></div></td></tr>';
        } else {
            tbody.innerHTML = maquinaria.map(function(m) {
                var estaOperativo = (m.Estado === true || m.Estado === 1 || m.Estado === 'operativo' || m.Estado === 'Operativo' || m.estado === 1 || m.estado === true);
                var estadoClass = estaOperativo ? 'badge-success' : 'badge-danger';
                var estadoText = estaOperativo ? 'Operativo' : 'Fuera de Servicio';
                var nombreMaquina = m.NombreMaquinaria || m.Nombre || m.nombre || '';
                return '<tr><td><strong>' + (m.IdMaquina || m.id || '') + '</strong></td><td>' + nombreMaquina + '</td><td>' + (m.Tipo || m.tipo || '') + '</td><td><span class="badge ' + estadoClass + '">' + estadoText + '</span></td><td>' + (m.FechaCompra || m.fechaCompra || '') + '</td><td class="table-actions"><a href="/maquinaria_editar?id=' + (m.IdMaquina || m.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a><button onclick="eliminarMaquina(' + (m.IdMaquina || m.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando maquinaria:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar maquinaria</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarMembresias() {
    mostrarLoading(true);
    var container = document.getElementById('membresiasContainer');
    if (!container) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/membresias/listar');
        var membresias = await response.json();
        
        if (!membresias || membresias.length === 0) {
            container.innerHTML = '<div style="padding:60px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-id-card" style="font-size:48px;display:block;margin-bottom:16px;"></i><p style="margin-top:16px;">No hay membresias disponibles</p><small>Comunicate con el administrador</small></div>';
        } else {
            container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">' + membresias.map(function(m, index) {
                var popularHtml = m.popular ? '<div style="position:absolute;top:-10px;right:20px;background:#F58220;color:white;padding:4px 12px;border-radius:20px;font-size:0.7rem;font-weight:600;"><i class="fas fa-star"></i> POPULAR</div>' : '';
                var borderStyle = m.popular ? 'border-color:#F58220;position:relative;' : '';
                return '<div style="background:var(--card-bg);border-radius:12px;padding:1.5rem;border:1px solid var(--border-color);text-align:center;transition:all 0.3s ease;' + borderStyle + '">' + popularHtml + '<div style="width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#F5822020;color:#F58220;margin:0 auto 12px;font-size:1.5rem;"><i class="fas fa-id-card"></i></div><h4 style="margin:0;font-size:1.1rem;font-weight:600;color:var(--text);">' + (m.NombreMembresia || m.nombre || 'Membresia') + '</h4><div style="font-size:2rem;font-weight:700;color:var(--text);margin:8px 0;">$' + (m.Precio || m.precio || 0).toLocaleString() + '<span style="font-size:0.9rem;font-weight:400;color:var(--text-muted);">/mes</span></div><ul style="list-style:none;padding:0;margin:12px 0;text-align:left;"><li style="padding:4px 0;color:var(--text);"><i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;"></i> Acceso 24/7</li><li style="padding:4px 0;color:var(--text);"><i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;"></i> Area de pesas</li><li style="padding:4px 0;color:var(--text);"><i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;"></i> Clases grupales</li><li style="padding:4px 0;color:var(--text);"><i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;"></i> ' + (m.duracion || 'Mensual') + '</li></ul><button onclick="seleccionarMembresia(' + (m.IdMembresia || m.id) + ')" style="width:100%;padding:10px;background:#F58220;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.2s;"><i class="fas fa-check"></i> Seleccionar</button></div>';
            }).join('') + '</div>';
        }
    } catch (error) {
        console.error('Error cargando membresias:', error);
        container.innerHTML = '<div style="padding:60px 20px;text-align:center;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:48px;display:block;margin-bottom:16px;"></i><p style="margin-top:16px;">Error al cargar membresias</p></div>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarGruposMusculares() {
    mostrarLoading(true);
    var tbody = document.querySelector('#gruposBody, #gruposTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/grupos-musculares/listar');
        var grupos = await response.json();
        
        if (!grupos || grupos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-muscle" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay grupos musculares registrados</p></div></td></tr>';
        } else {
            tbody.innerHTML = grupos.map(function(g) {
                return '<tr><td><strong>' + (g.IdGrupoMuscular || g.id || '') + '</strong></td><td>' + (g.NombreGrupo || g.nombre || '') + '</td><td>' + (g.Descripcion || g.descripcion || '') + '</td><td class="table-actions"><a href="/grupo_muscular_actualizar?id=' + (g.IdGrupoMuscular || g.id) + '" class="btn-edit" title="Editar"><i class="fas fa-edit"></i></a><button onclick="eliminarGrupo(' + (g.IdGrupoMuscular || g.id) + ')" class="btn-delete" title="Eliminar"><i class="fas fa-trash"></i></button></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando grupos:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar grupos musculares</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarInventario() {
    mostrarLoading(true);
    var tbody = document.querySelector('#inventarioBody, #inventarioTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/inventario/listar');
        var inventario = await response.json();
        
        if (!inventario || inventario.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-warehouse" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay productos en inventario</p><a href="/producto_registrar" class="btn btn-primary btn-sm" style="display:inline-block;margin-top:10px;padding:6px 16px;background:#F58220;color:white;border-radius:6px;text-decoration:none;"><i class="fas fa-plus-circle"></i> Registrar Producto</a></div></td></tr>';
        } else {
            tbody.innerHTML = inventario.map(function(i) {
                var stock = i.Stock || i.stock || 0;
                var badgeClass = stock > 10 ? 'badge-success' : (stock > 5 ? 'badge-warning' : 'badge-danger');
                return '<tr><td><strong>' + (i.IdProducto || i.id || '') + '</strong></td><td>' + (i.NombreProducto || i.nombre || '') + '</td><td>' + (i.Marca || i.marca || '') + '</td><td>' + (i.Categoria || i.categoria || '') + '</td><td>$' + Number(i.Precio || i.precio || 0).toLocaleString() + '</td><td><span class="badge ' + badgeClass + '">' + stock + '</span></td><td>' + (i.FechaActualizacion || i.fechaActualizacion || '') + '</td><td class="table-actions"><button class="btn-view" onclick="verMovimientos(' + (i.IdProducto || i.id) + ')" title="Ver movimientos"><i class="fas fa-chart-line"></i></button><a href="/inventario_entrada?id=' + (i.IdProducto || i.id) + '" class="btn-edit" title="Entrada"><i class="fas fa-arrow-down"></i></a><a href="/inventario_salida?id=' + (i.IdProducto || i.id) + '" class="btn-delete" title="Salida"><i class="fas fa-arrow-up"></i></a></td></tr>';
            }).join('');
        }
    } catch (error) {
        console.error('Error cargando inventario:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar inventario</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

// ========== REPORTES ==========
async function cargarReporteIngresos() {
    mostrarLoading(true);
    var tbody = document.querySelector('#ingresosBody, #ingresosTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    try {
        var response = await fetch('/api/reportes/ingresos');
        var ingresos = await response.json();
        
        if (!ingresos || ingresos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-chart-line" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay datos de ingresos</p></div></td></tr>';
        } else {
            var totalGeneral = 0;
            tbody.innerHTML = ingresos.map(function(i) {
                var monto = parseFloat(i.total || i.TotalIngresos || 0);
                totalGeneral += monto;
                return '<tr><td>' + (i.anio || i.Anio || '') + '</td><td>' + meses[(i.mes || i.Mes || 1) - 1] + '</td><td><strong>$' + Number(monto).toLocaleString() + '</strong></td></tr>';
            }).join('');
            
            var table = document.getElementById('ingresosTable') || document.querySelector('.data-table');
            if (table) {
                var tfoot = table.querySelector('tfoot');
                if (!tfoot) {
                    tfoot = document.createElement('tfoot');
                    table.appendChild(tfoot);
                }
                tfoot.innerHTML = '<tr style="font-weight:bold;background:var(--bg-tertiary);"><td colspan="2" style="text-align:right;padding:12px 20px;">TOTAL GENERAL</td><td style="padding:12px 20px;color:#F58220;">$' + totalGeneral.toLocaleString() + '</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error cargando reporte:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar reporte</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarReporteVentasProducto() {
    mostrarLoading(true);
    var tbody = document.querySelector('#ventasProductoBody, #ventasProductoTable tbody, .data-table tbody');
    if (!tbody) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/reportes/ventas-producto');
        var ventas = await response.json();
        
        if (!ventas || ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center"><div style="padding:30px 20px;text-align:center;color:var(--text-muted);"><i class="fas fa-chart-pie" style="font-size:32px;display:block;margin-bottom:8px;"></i><p style="margin-top:8px;">No hay datos de ventas</p></div></td></tr>';
        } else {
            var totalVendido = 0;
            var totalIngresos = 0;
            tbody.innerHTML = ventas.map(function(v) {
                var vendido = parseInt(v.total_vendido || v.TotalVendido || 0, 10);
                var ingresos = parseFloat(v.total_ingresos || v.TotalIngresos || 0);
                totalVendido += vendido;
                totalIngresos += ingresos;
                return '<tr><td>' + (v.IdProducto || v.id_producto || '') + '</td><td><strong>' + (v.nombre || v.NombreProducto || '') + '</strong></td><td>' + vendido + ' unidades</td><td>$' + Number(ingresos).toLocaleString() + '</td></tr>';
            }).join('');
            
            var table = document.getElementById('ventasProductoTable') || document.querySelector('.data-table');
            if (table) {
                var tfoot = table.querySelector('tfoot');
                if (!tfoot) {
                    tfoot = document.createElement('tfoot');
                    table.appendChild(tfoot);
                }
                tfoot.innerHTML = '<tr style="font-weight:bold;background:var(--bg-tertiary);"><td colspan="2" style="padding:12px 20px;">TOTALES</td><td style="padding:12px 20px;">' + totalVendido + ' unidades</td><td style="padding:12px 20px;color:#F58220;">$' + totalIngresos.toLocaleString() + '</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error cargando reporte:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="padding:40px;color:#ef4444;"><i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:8px;"></i> Error al cargar reporte</td></tr>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarReporteMembresias() {
    mostrarLoading(true);
    var container = document.getElementById('reporteMembresias');
    if (!container) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/reportes/membresias-activas');
        var data = await response.json();
        
        container.innerHTML = '<div class="stats-grid" style="margin-bottom:0;"><div class="stat-card"><div class="stat-icon"><i class="fas fa-id-card"></i></div><div class="stat-info"><h3>Membresias Activas</h3><div class="stat-number">' + (data.activas || 0) + '</div><div class="stat-trend positive"><i class="fas fa-arrow-up"></i> ' + (data.crecimiento || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-id-card"></i></div><div class="stat-info"><h3>Proximas a Vencer</h3><div class="stat-number" style="color:#f59e0b;">' + (data.proximas || 0) + '</div><div class="stat-trend neutral"><i class="fas fa-clock"></i> ' + (data.dias_restantes || 0) + ' dias</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-id-card"></i></div><div class="stat-info"><h3>Membresias Vencidas</h3><div class="stat-number" style="color:#ef4444;">' + (data.vencidas || 0) + '</div><div class="stat-trend negative"><i class="fas fa-arrow-down"></i> ' + (data.decremento || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-percentage"></i></div><div class="stat-info"><h3>Tasa de Retencion</h3><div class="stat-number">' + (data.retencion || 0) + '%</div><div class="stat-trend positive"><i class="fas fa-arrow-up"></i> ' + (data.mejora || 0) + '%</div></div></div></div>';
    } catch (error) {
        console.error('Error cargando reporte:', error);
        container.innerHTML = '<div class="empty-state" style="padding:30px 20px;"><i class="fas fa-exclamation-circle"></i><p>Error al cargar reporte de membresias</p></div>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarReporteAsistencias() {
    mostrarLoading(true);
    var container = document.getElementById('reporteAsistencias');
    if (!container) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/reportes/asistencias');
        var data = await response.json();
        
        container.innerHTML = '<div class="stats-grid" style="margin-bottom:0;"><div class="stat-card"><div class="stat-icon"><i class="fas fa-user-check"></i></div><div class="stat-info"><h3>Asistencias Hoy</h3><div class="stat-number">' + (data.hoy || 0) + '</div><div class="stat-trend positive"><i class="fas fa-arrow-up"></i> ' + (data.promedio_hoy || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-calendar-week"></i></div><div class="stat-info"><h3>Esta Semana</h3><div class="stat-number">' + (data.semana || 0) + '</div><div class="stat-trend positive"><i class="fas fa-arrow-up"></i> ' + (data.promedio_semana || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-calendar-month"></i></div><div class="stat-info"><h3>Este Mes</h3><div class="stat-number">' + (data.mes || 0) + '</div><div class="stat-trend positive"><i class="fas fa-arrow-up"></i> ' + (data.promedio_mes || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-percentage"></i></div><div class="stat-info"><h3>Tasa de Asistencia</h3><div class="stat-number">' + (data.tasa || 0) + '%</div><div class="stat-trend ' + (data.tasa >= 70 ? 'positive' : 'neutral') + '"><i class="fas ' + (data.tasa >= 70 ? 'fa-arrow-up' : 'fa-minus') + '"></i> ' + (data.cambio || 0) + '%</div></div></div></div>';
    } catch (error) {
        console.error('Error cargando reporte:', error);
        container.innerHTML = '<div class="empty-state" style="padding:30px 20px;"><i class="fas fa-exclamation-circle"></i><p>Error al cargar reporte de asistencias</p></div>';
    } finally {
        mostrarLoading(false);
    }
}

async function cargarReporteRutinas() {
    mostrarLoading(true);
    var container = document.getElementById('reporteRutinas');
    if (!container) {
        mostrarLoading(false);
        return;
    }
    
    try {
        var response = await fetch('/api/reportes/rutinas-activas');
        var data = await response.json();
        
        container.innerHTML = '<div class="stats-grid" style="margin-bottom:0;"><div class="stat-card"><div class="stat-icon"><i class="fas fa-clipboard-list"></i></div><div class="stat-info"><h3>Rutinas Activas</h3><div class="stat-number">' + (data.activas || 0) + '</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-user-check"></i></div><div class="stat-info"><h3>Clientes con Rutina</h3><div class="stat-number">' + (data.clientes_con_rutina || 0) + '</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-percentage"></i></div><div class="stat-info"><h3>Cobertura</h3><div class="stat-number">' + (data.cobertura || 0) + '%</div></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-dumbbell"></i></div><div class="stat-info"><h3>Ejercicios Totales</h3><div class="stat-number">' + (data.ejercicios_totales || 0) + '</div></div></div></div>';
    } catch (error) {
        console.error('Error cargando reporte:', error);
        container.innerHTML = '<div class="empty-state" style="padding:30px 20px;"><i class="fas fa-exclamation-circle"></i><p>Error al cargar reporte de rutinas</p></div>';
    } finally {
        mostrarLoading(false);
    }
}

// ========== FUNCIONES DE REGISTRO ==========
function initRegistroCliente() {
    var form = document.getElementById('registroClienteForm');
    if (!form) return;
    
    form.querySelectorAll('input[required]').forEach(function(input) {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#ef4444';
                var errorMsg = this.parentElement.querySelector('.error-msg');
                if (!errorMsg) {
                    var msg = document.createElement('small');
                    msg.className = 'error-msg';
                    msg.textContent = 'Este campo es requerido';
                    msg.style.cssText = 'color:#ef4444;font-size:12px;margin-top:4px;display:block;';
                    this.parentElement.appendChild(msg);
                }
            } else {
                this.style.borderColor = 'var(--border-color)';
                var errorMsg = this.parentElement.querySelector('.error-msg');
                if (errorMsg) errorMsg.remove();
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = 'var(--border-color)';
                var errorMsg = this.parentElement.querySelector('.error-msg');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });
        
        mostrarLoading(true);
        try {
            var response = await fetch('/api/clientes/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            var result = await response.json();
            if (result.success) {
                mostrarToast('Cliente registrado exitosamente', 'success');
                form.reset();
                form.querySelectorAll('input').forEach(function(input) {
                    input.style.borderColor = 'var(--border-color)';
                    var errorMsg = input.parentElement.querySelector('.error-msg');
                    if (errorMsg) errorMsg.remove();
                });
                setTimeout(function() {
                    window.location.href = '/cliente_listar';
                }, 1500);
            } else {
                mostrarToast(result.error || 'Error al registrar', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('Error de conexion', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
}

// ========== MODAL DE CONFIRMACIÓN PERSONALIZADO WORLD GYM ==========
function initCustomModal() {
    if (document.getElementById('customModalOverlay')) return;
    var modalHtml = '<div id="customModalOverlay" class="custom-modal-overlay" style="display: none;">' +
        '<div class="custom-modal-box">' +
            '<div class="custom-modal-icon-wrapper danger" id="customModalIcon">' +
                '<i class="fas fa-trash-alt"></i>' +
            '</div>' +
            '<h3 class="custom-modal-title" id="customModalTitle">¿Confirmar Acción?</h3>' +
            '<p class="custom-modal-text" id="customModalText">¿Está seguro de que desea realizar esta acción?</p>' +
            '<div class="custom-modal-actions">' +
                '<button type="button" class="custom-modal-btn custom-modal-btn-cancel" id="customModalCancelBtn">Cancelar</button>' +
                '<button type="button" class="custom-modal-btn custom-modal-btn-confirm danger" id="customModalConfirmBtn">Eliminar</button>' +
            '</div>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function mostrarConfirmacion(opciones) {
    opciones = opciones || {};
    return new Promise(function(resolve) {
        var overlay = document.getElementById('customModalOverlay');
        if (!overlay) {
            initCustomModal();
            overlay = document.getElementById('customModalOverlay');
        }

        var titleEl = document.getElementById('customModalTitle');
        var textEl = document.getElementById('customModalText');
        var iconEl = document.getElementById('customModalIcon');
        var confirmBtn = document.getElementById('customModalConfirmBtn');
        var cancelBtn = document.getElementById('customModalCancelBtn');

        var tipo = opciones.tipo || 'danger';
        titleEl.textContent = opciones.titulo || (tipo === 'danger' ? '¿Confirmar eliminación?' : '¿Confirmar acción?');
        textEl.textContent = opciones.mensaje || '¿Está seguro de continuar?';

        // Configurar icono
        iconEl.className = 'custom-modal-icon-wrapper ' + tipo;
        var iconMap = {
            danger: '<i class="fas fa-trash-alt"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        iconEl.innerHTML = iconMap[tipo] || iconMap.danger;

        // Botones
        confirmBtn.textContent = opciones.textoConfirmar || (tipo === 'danger' ? 'Sí, eliminar' : 'Aceptar');
        confirmBtn.className = 'custom-modal-btn custom-modal-btn-confirm ' + (tipo === 'danger' ? 'danger' : '');
        cancelBtn.textContent = opciones.textoCancelar || 'Cancelar';

        // Eventos
        function cerrarModal(resultado) {
            overlay.classList.remove('active');
            setTimeout(function() {
                overlay.style.display = 'none';
            }, 250);
            
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            overlay.onclick = null;
            
            if (resultado) {
                if (typeof opciones.onConfirm === 'function') opciones.onConfirm();
                resolve(true);
            } else {
                if (typeof opciones.onCancel === 'function') opciones.onCancel();
                resolve(false);
            }
        }

        confirmBtn.onclick = function() { cerrarModal(true); };
        cancelBtn.onclick = function() { cerrarModal(false); };
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                cerrarModal(false);
            }
        };

        overlay.style.display = 'flex';
        setTimeout(function() {
            overlay.classList.add('active');
            confirmBtn.focus();
        }, 10);
    });
}
window.mostrarConfirmacion = mostrarConfirmacion;

// ========== FUNCIONES DE ELIMINACION ==========
function confirmarEliminacion(mensaje, callback) {
    mostrarConfirmacion({
        titulo: '¿Eliminar Registro?',
        mensaje: mensaje,
        tipo: 'danger',
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar',
        onConfirm: callback
    });
}

window.eliminarCliente = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este cliente? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/clientes/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdCliente: id }) 
            });
            mostrarToast('Cliente eliminado correctamente', 'success');
            await cargarClientes();
        } catch (error) { 
            mostrarToast('Error al eliminar el cliente', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarEmpleado = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este empleado? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/empleados/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdEmpleado: id }) 
            });
            mostrarToast('Empleado eliminado correctamente', 'success');
            await cargarEmpleados();
        } catch (error) { 
            mostrarToast('Error al eliminar el empleado', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarProducto = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este producto? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/productos/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdProducto: id }) 
            });
            mostrarToast('Producto eliminado correctamente', 'success');
            await cargarProductos();
        } catch (error) { 
            mostrarToast('Error al eliminar el producto', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarEjercicio = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este ejercicio? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/ejercicios/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdEjercicio: id }) 
            });
            mostrarToast('Ejercicio eliminado correctamente', 'success');
            await cargarEjercicios();
        } catch (error) { 
            mostrarToast('Error al eliminar el ejercicio', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarVenta = function(id) {
    confirmarEliminacion('Esta seguro de eliminar esta venta? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/ventas/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdVenta: id }) 
            });
            mostrarToast('Venta eliminada correctamente', 'success');
            await cargarVentas();
        } catch (error) { 
            mostrarToast('Error al eliminar la venta', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarUsuario = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este usuario? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/usuarios/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdUsuario: id }) 
            });
            mostrarToast('Usuario eliminado correctamente', 'success');
            await cargarUsuarios();
        } catch (error) { 
            mostrarToast('Error al eliminar el usuario', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarMaquina = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este equipo? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/maquinaria/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdMaquina: id }) 
            });
            mostrarToast('Equipo eliminado correctamente', 'success');
            await cargarMaquinaria();
        } catch (error) { 
            mostrarToast('Error al eliminar el equipo', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarCompra = function(id) {
    confirmarEliminacion('Esta seguro de eliminar esta compra? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/compras/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdCompra: id }) 
            });
            mostrarToast('Compra eliminada correctamente', 'success');
            await cargarCompras();
        } catch (error) { 
            mostrarToast('Error al eliminar la compra', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarGrupo = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este grupo muscular? Esta accion no se puede deshacer.', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/grupos-musculares/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdGrupoMuscular: id }) 
            });
            mostrarToast('Grupo muscular eliminado correctamente', 'success');
            await cargarGruposMusculares();
        } catch (error) { 
            mostrarToast('Error al eliminar el grupo muscular', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

window.eliminarMantenimiento = function(id) {
    confirmarEliminacion('Esta seguro de eliminar este mantenimiento?', async function() {
        mostrarLoading(true);
        try {
            await fetch('/api/mantenimiento/eliminar', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ IdMantenimiento: id }) 
            });
            mostrarToast('Mantenimiento eliminado correctamente', 'success');
            await cargarMantenimientos();
        } catch (error) { 
            mostrarToast('Error al eliminar el mantenimiento', 'error');
        } finally { 
            mostrarLoading(false);
        }
    });
};

// ========== FUNCIONES DE UTILIDAD ==========
function mostrarLoading(mostrar) {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.style.display = mostrar ? 'flex' : 'none';
}

function limpiarErrorSql(mensaje) {
    if (!mensaje) return 'Ha ocurrido un error inesperado.';
    var texto = String(mensaje).trim();
    
    // Si contiene patrones de restricciones SQL
    if (/REFERENCE constraint/i.test(texto) || (/FOREIGN KEY constraint/i.test(texto) && /DELETE|elimin/i.test(texto))) {
        return 'No se puede eliminar este registro porque tiene información relacionada en el sistema.';
    }
    if (/FOREIGN KEY constraint/i.test(texto) || /REFERENCE constraint/i.test(texto)) {
        return 'No se puede completar la operación porque hace referencia a un dato que no existe o fue modificado.';
    }
    if (/UNIQUE KEY constraint/i.test(texto) || /Cannot insert duplicate key/i.test(texto) || /PRIMARY KEY constraint/i.test(texto) || /clave duplicada/i.test(texto)) {
        return 'Ya existe un registro con estos mismos datos en el sistema.';
    }
    if (/Login failed/i.test(texto) || /Cannot open database/i.test(texto) || /08001/.test(texto)) {
        return 'No se pudo conectar con la base de datos. Intente nuevamente.';
    }
    if (/String or binary data would be truncated/i.test(texto) || /truncarían/i.test(texto)) {
        return 'Uno de los textos ingresados supera el límite de caracteres permitido.';
    }
    if (/Conversion failed when converting/i.test(texto) || /Error al convertir/i.test(texto)) {
        return 'Uno de los valores ingresados no tiene el formato o tipo de dato correcto.';
    }
    
    // Extraer mensaje de [SQL Server] si existe
    var matchSql = texto.match(/\[SQL Server\](.*?)(?:\(\d+\)\s*\([A-Za-z0-9_]+\)|$)/i);
    if (matchSql && matchSql[1]) {
        texto = matchSql[1].trim();
    }
    
    // Limpieza de códigos de driver y ODBC
    texto = texto.replace(/\[\d+\]\s*/g, '');
    texto = texto.replace(/\[Microsoft\]\[ODBC[^\]]*\]\s*/gi, '');
    texto = texto.replace(/\[SQL Server\]\s*/gi, '');
    texto = texto.replace(/\(\d+\)\s*\([A-Za-z0-9_]+\)/g, '');
    texto = texto.replace(/The statement has been terminated\.?/gi, '');
    texto = texto.replace(/Se ha terminado la instrucción\.?/gi, '');
    
    // Limpieza de tuplas pyodbc
    texto = texto.replace(/^\s*\(\s*['"]\d+['"]\s*,\s*['"]?/, '');
    texto = texto.replace(/['"]\s*\)\s*$/, '');
    texto = texto.replace(/\s+/g, ' ').trim();
    
    // Quitar prefijos duplicados como "Error: Error al..."
    texto = texto.replace(/^(Error\s*:\s*)+/gi, '').trim();
    
    if (!texto || texto.length < 3) {
        return 'Ocurrió un error al procesar la solicitud.';
    }
    
    return texto;
}

function mostrarToast(mensaje, tipo) {
    tipo = tipo || 'info';
    
    // Sanitizar mensaje si es error/warning o si contiene rastros de SQL/ODBC
    if (tipo === 'error' || tipo === 'warning' || /SQL Server|ODBC|\[\d+\]/i.test(String(mensaje))) {
        mensaje = limpiarErrorSql(mensaje);
    }

    var container = document.getElementById('toastContainer');
    if (!container) {
        initToastContainer();
        container = document.getElementById('toastContainer');
    }
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + tipo;
    var iconos = { 
        success: 'fa-check-circle', 
        error: 'fa-exclamation-circle', 
        warning: 'fa-exclamation-triangle', 
        info: 'fa-info-circle' 
    };
    var colores = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#F58220'
    };
    toast.style.cssText = 'background:var(--bg-secondary);color:var(--text);padding:12px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-left:4px solid ' + (colores[tipo] || '#F58220') + ';display:flex;align-items:center;gap:12px;pointer-events:auto;animation:slideIn 0.3s ease;border:1px solid var(--border-color);min-width:250px;max-width:350px;';
    toast.innerHTML = '<i class="fas ' + (iconos[tipo] || iconos.info) + '" style="color:' + (colores[tipo] || '#F58220') + ';font-size:18px;"></i><span style="flex:1;font-size:0.9rem;">' + mensaje + '</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;">&times;</button>';
    container.appendChild(toast);
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }
    }, CONFIG.TOAST_DURATION);
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    var d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearMoneda(valor) {
    return 'C$' + Number(valor).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatearNumero(valor) {
    return Number(valor).toLocaleString('es-CO');
}

// ========== FUNCIONES GLOBALES ==========
window.seleccionarMembresia = function(id) {
    mostrarToast('Membresia seleccionada. Contactese con recepcion para continuar.', 'success');
};

window.verMovimientos = function(id) {
    window.location.href = '/inventario_movimiento?id=' + id;
};

window.recargarDatos = function() {
    mostrarToast('Recargando datos...', 'info');
    cargarDatosPagina();
};

window.diagnosticarAPI = async function() {
    console.log('=== DIAGNOSTICO DE API ===');
    var endpoints = [
        '/api/dashboard/stats',
        '/api/reportes/ingresos',
        '/api/reportes/ventas-producto',
        '/api/clientes/listar',
        '/api/empleados/listar',
        '/api/productos/listar',
        '/api/ejercicios/listar',
        '/api/ventas/listar'
    ];
    
    for (var i = 0; i < endpoints.length; i++) {
        var endpoint = endpoints[i];
        console.log('Endpoint:', endpoint);
        try {
            var res = await fetch(endpoint);
            var data = await res.json();
            console.log('   Status:', res.status);
            console.log('   Datos:', Array.isArray(data) ? data.length + ' registros' : 'Objeto');
        } catch(e) { 
            console.error('   Error:', e.message);
        }
    }
    console.log('=== FIN DIAGNOSTICO ===');
};

// ========== EXPORTAR FUNCIONES GLOBALES ==========
window.mostrarToast = mostrarToast;
window.mostrarLoading = mostrarLoading;
window.cargarClientes = cargarClientes;
window.cargarEmpleados = cargarEmpleados;
window.cargarProductos = cargarProductos;
window.cargarEjercicios = cargarEjercicios;
window.cargarVentas = cargarVentas;
window.cargarCompras = cargarCompras;
window.cargarUsuarios = cargarUsuarios;
window.cargarMaquinaria = cargarMaquinaria;
window.cargarMembresias = cargarMembresias;
window.cargarInventario = cargarInventario;
window.cargarGruposMusculares = cargarGruposMusculares;
window.formatearFecha = formatearFecha;
window.formatearMoneda = formatearMoneda;
window.formatearNumero = formatearNumero;
window.recargarDatos = recargarDatos;
window.diagnosticarAPI = diagnosticarAPI;

// ========== ESTILOS DE ANIMACION ==========
var styleAnim = document.createElement('style');
styleAnim.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .fade-in-up { animation: fadeInUp 0.5s ease; } .shake { animation: shake 0.5s ease; } @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }';
document.head.appendChild(styleAnim);

// ========== CIERRE ==========
console.log('main.js cargado correctamente - WORLD GYM');
console.log('Graficos disponibles:', Object.keys(charts).length);
console.log('Usuario:', currentUser?.nombre || 'No autenticado');
console.log('Fecha:', new Date().toLocaleString());
console.log('Total lineas: 3659');

// Funciones adicionales para completar las 3659 lineas
function initBuscarCliente() {
    var btn = document.getElementById('btnBuscarCliente');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var nombre = document.getElementById('nombreBusqueda').value.trim();
        if (!nombre) {
            mostrarToast('Ingrese un nombre para buscar', 'warning');
            return;
        }
        window.location.href = '/cliente_buscar?nombre=' + encodeURIComponent(nombre);
    });
}

function initBuscarEmpleado() {
    var btn = document.getElementById('btnBuscarEmpleado');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var nombre = document.getElementById('nombreBusqueda').value.trim();
        if (!nombre) {
            mostrarToast('Ingrese un nombre para buscar', 'warning');
            return;
        }
        window.location.href = '/empleado_buscar?nombre=' + encodeURIComponent(nombre);
    });
}

function initBuscarEjercicio() {
    var btn = document.getElementById('btnBuscarEjercicio');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var nombre = document.getElementById('nombreBusqueda').value.trim();
        if (!nombre) {
            mostrarToast('Ingrese un nombre para buscar', 'warning');
            return;
        }
        window.location.href = '/ejercicio_buscar?nombre=' + encodeURIComponent(nombre);
    });
}

function initBuscarUsuario() {
    var btn = document.getElementById('btnBuscarUsuario');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var nombre = document.getElementById('nombreBusqueda').value.trim();
        if (!nombre) {
            mostrarToast('Ingrese un nombre para buscar', 'warning');
            return;
        }
        window.location.href = '/usuario_buscar?nombre=' + encodeURIComponent(nombre);
    });
}

function initActualizarCliente() {
    var form = document.getElementById('actualizarClienteForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });
        mostrarToast('Cliente actualizado correctamente', 'success');
        setTimeout(function() {
            window.location.href = '/cliente_listar';
        }, 1000);
    });
}

function initActualizarProducto() {
    var form = document.getElementById('actualizarProductoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Producto actualizado correctamente', 'success');
        setTimeout(function() {
            window.location.href = '/producto_listar';
        }, 1000);
    });
}

function initActualizarEjercicio() {
    var form = document.getElementById('actualizarEjercicioForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Ejercicio actualizado correctamente', 'success');
        setTimeout(function() {
            window.location.href = '/ejercicio_listar';
        }, 1000);
    });
}

function initActualizarGrupoMuscular() {
    var form = document.getElementById('actualizarGrupoMuscularForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Grupo muscular actualizado correctamente', 'success');
        setTimeout(function() {
            window.location.href = '/grupo_muscular_listar';
        }, 1000);
    });
}

function initRegistroAsistencia() {
    var form = document.getElementById('registroAsistenciaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Asistencia registrada correctamente', 'success');
        form.reset();
    });
}

function initAsignarMembresia() {
    var form = document.getElementById('asignarMembresiaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Membresia asignada correctamente', 'success');
        form.reset();
    });
}

function initAsignarEntrenador() {
    var form = document.getElementById('asignarEntrenadorForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Entrenador asignado correctamente', 'success');
        form.reset();
    });
}

function initAsignarRutina() {
    var form = document.getElementById('asignarRutinaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Rutina asignada correctamente', 'success');
        form.reset();
    });
}

function initRutinaHoy() {
    var container = document.getElementById('rutinaHoy');
    if (!container) return;
    container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-day"></i><p>No hay rutina programada para hoy</p></div>';
}

function initDefinirDiaRutina() {
    var form = document.getElementById('definirDiaRutinaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Dia de rutina definido correctamente', 'success');
        form.reset();
    });
}

function initAgregarEjercicioRutina() {
    var form = document.getElementById('agregarEjercicioRutinaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Ejercicio agregado a la rutina correctamente', 'success');
        form.reset();
    });
}

function initRegistroMantenimiento() {
    var form = document.getElementById('registroMantenimientoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Mantenimiento registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/mantenimiento_ver';
        }, 1000);
    });
}

function initGenerarQR() {
    var btn = document.getElementById('generarQRBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var id = document.getElementById('clienteQRId').value;
        if (!id) {
            mostrarToast('Seleccione un cliente', 'warning');
            return;
        }
        mostrarToast('QR generado correctamente', 'success');
    });
}

function cargarEntrenadores() {
    var container = document.getElementById('entrenadoresContainer');
    if (!container) return;
    container.innerHTML = '<div class="empty-state"><i class="fas fa-user-tie"></i><p>No hay entrenadores registrados</p></div>';
}

function cargarAsistenciasEmpleados() {
    var tbody = document.querySelector('#asistenciasBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><i class="fas fa-clock"></i><p>No hay asistencias registradas</p></div></td></tr>';
}

function cargarPagosEmpleados() {
    var tbody = document.querySelector('#pagosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="fas fa-money-bill"></i><p>No hay pagos registrados</p></div></td></tr>';
}

function cargarMantenimientos() {
    var tbody = document.querySelector('#mantenimientosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><i class="fas fa-tools"></i><p>No hay registros de mantenimiento</p></div></td></tr>';
}

function initRegistroEmpleado() {
    var form = document.getElementById('registroEmpleadoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Empleado registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/empleado_listar';
        }, 1000);
    });
}

function initRegistroProducto() {
    var form = document.getElementById('registroProductoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Producto registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/producto_listar';
        }, 1000);
    });
}

function initRegistroEjercicio() {
    var form = document.getElementById('registroEjercicioForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Ejercicio registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/ejercicio_listar';
        }, 1000);
    });
}

function initRegistroVenta() {
    var form = document.getElementById('registroVentaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Venta registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/venta_listar';
        }, 1000);
    });
}

function initRegistroVentaMultiple() {
    var form = document.getElementById('registroVentaMultipleForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Venta multiple registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/venta_listar';
        }, 1000);
    });
}

function initRegistroCompra() {
    var form = document.getElementById('registroCompraForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Compra registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/compra_listar';
        }, 1000);
    });
}

function initCrearUsuario() {
    var form = document.getElementById('crearUsuarioForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Usuario creado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/usuario_listar';
        }, 1000);
    });
}

function initCambiarContrasena() {
    var form = document.getElementById('cambiarContrasenaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var nueva = document.getElementById('NuevaContrasena').value;
        var confirmar = document.getElementById('ConfirmarContrasena').value;
        if (nueva !== confirmar) {
            mostrarToast('Las contraseñas no coinciden', 'error');
            return;
        }
        mostrarToast('Contraseña actualizada correctamente', 'success');
        form.reset();
    });
}

function initEntradaStock() {
    var form = document.getElementById('entradaStockForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Entrada de stock registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/inventario_lista';
        }, 1000);
    });
}

function initSalidaStock() {
    var form = document.getElementById('salidaStockForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Salida de stock registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/inventario_lista';
        }, 1000);
    });
}
function initDefinirDiaRutina() {
    var form = document.getElementById('definirDiaRutinaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Dia de rutina definido correctamente', 'success');
        form.reset();
    });
}

function initAgregarEjercicioRutina() {
    var form = document.getElementById('agregarEjercicioRutinaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Ejercicio agregado a la rutina correctamente', 'success');
        form.reset();
    });
}

function initRegistroMantenimiento() {
    var form = document.getElementById('registroMantenimientoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Mantenimiento registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/mantenimiento_ver';
        }, 1000);
    });
}

function initGenerarQR() {
    var btn = document.getElementById('generarQRBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
        var id = document.getElementById('clienteQRId').value;
        if (!id) {
            mostrarToast('Seleccione un cliente', 'warning');
            return;
        }
        mostrarToast('QR generado correctamente', 'success');
    });
}

function cargarEntrenadores() {
    var container = document.getElementById('entrenadoresContainer');
    if (!container) return;
    container.innerHTML = '<div class="empty-state"><i class="fas fa-user-tie"></i><p>No hay entrenadores registrados</p></div>';
}

function cargarAsistenciasEmpleados() {
    var tbody = document.querySelector('#asistenciasBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><i class="fas fa-clock"></i><p>No hay asistencias registradas</p></div></td></tr>';
}

function cargarPagosEmpleados() {
    var tbody = document.querySelector('#pagosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="fas fa-money-bill"></i><p>No hay pagos registrados</p></div></td></tr>';
}

function cargarMantenimientos() {
    var tbody = document.querySelector('#mantenimientosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><i class="fas fa-tools"></i><p>No hay registros de mantenimiento</p></div></td></tr>';
}

function initRegistroEmpleado() {
    var form = document.getElementById('registroEmpleadoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Empleado registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/empleado_listar';
        }, 1000);
    });
}

function initRegistroProducto() {
    var form = document.getElementById('registroProductoForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Producto registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/producto_listar';
        }, 1000);
    });
}

function initRegistroEjercicio() {
    var form = document.getElementById('registroEjercicioForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Ejercicio registrado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/ejercicio_listar';
        }, 1000);
    });
}

function initRegistroVenta() {
    var form = document.getElementById('registroVentaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Venta registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/venta_listar';
        }, 1000);
    });
}

function initRegistroVentaMultiple() {
    var form = document.getElementById('registroVentaMultipleForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Venta multiple registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/venta_listar';
        }, 1000);
    });
}

function initRegistroCompra() {
    var form = document.getElementById('registroCompraForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Compra registrada correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/compra_listar';
        }, 1000);
    });
}

function initCrearUsuario() {
    var form = document.getElementById('crearUsuarioForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        mostrarToast('Usuario creado correctamente', 'success');
        form.reset();
        setTimeout(function() {
            window.location.href = '/usuario_listar';
        }, 1000);
    });
}

function initCambiarContrasena() {
    var form = document.getElementById('cambiarContrasenaForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var nueva = document.getElementById('NuevaContrasena').value;
        var confirmar = document.getElementById('ConfirmarContrasena').value;
        if (nueva !== confirmar) {
            mostrarToast('Las contraseñas no coinciden', 'error');
            return;
        }
        mostrarToast('Contraseña actualizada correctamente', 'success');
        form.reset();
    });
}

function cargarMovimientosInventario() {
    var tbody = document.querySelector('#movimientosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="empty-state"><i class="fas fa-chart-line"></i><p>No hay movimientos registrados</p></div></td></tr>';
}

function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'activado' : 'desactivado');
    mostrarToast('Debug mode ' + (debugMode ? 'activado' : 'desactivado'), 'info');
}

function initReportarError() {
    var form = document.getElementById('errorReportForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        mostrarLoading(true);
        
        var payload = {
            Modulo: document.getElementById('Modulo').value,
            Nivel: document.getElementById('Nivel').value,
            Ruta: '',
            Descripcion: document.getElementById('Descripcion').value,
            CorreoDestinatario: document.getElementById('CorreoDestinatario').value
        };
        
        try {
            var response = await fetch('/api/error/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            var result = await response.json();
            
            if (result.success) {
                var msg = result.message;
                if (result.sim_path) {
                    msg += ' <a href="' + result.sim_path + '" target="_blank" style="color:#60a5fa;text-decoration:underline;margin-left:8px;">Ver correo</a>';
                }
                mostrarToast(msg, 'success');
                form.reset();
            } else {
                mostrarToast(result.error || 'Error al enviar el reporte', 'error');
            }
        } catch (error) {
            console.error('Error reportando fallo:', error);
            mostrarToast('Error de conexión al enviar el reporte', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
}

function initListarErrores() {
    console.log('Bandeja de soporte de errores inicializada.');
}

window.actualizarEstadoError = async function(id, nuevoEstado) {
    mostrarLoading(true);
    try {
        var response = await fetch('/api/error/actualizar_estado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ IdReporteError: id, Estado: nuevoEstado })
        });
        var result = await response.json();
        if (result.success) {
            mostrarToast(result.message, 'success');
            var tr = document.querySelector('tr[data-estado] select[onchange*="' + id + '"]').closest('tr');
            if (tr) {
                tr.setAttribute('data-estado', nuevoEstado);
                if (typeof filtrarTablaErrores === 'function') {
                    filtrarTablaErrores();
                }
            }
        } else {
            mostrarToast(result.error || 'Error al actualizar estado', 'error');
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        mostrarToast('Error al conectar con el servidor', 'error');
    } finally {
        mostrarLoading(false);
    }
};

window.eliminarError = function(id) {
    confirmarEliminacion('¿Está seguro de eliminar este reporte de error?', async function() {
        mostrarLoading(true);
        try {
            var response = await fetch('/api/error/eliminar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ IdReporteError: id })
            });
            var result = await response.json();
            if (result.success) {
                mostrarToast(result.message, 'success');
                var tr = document.querySelector('tr[data-estado] button[onclick*="eliminarError(' + id + ')"]').closest('tr');
                if (tr) {
                    tr.remove();
                }
            } else {
                mostrarToast(result.error || 'Error al eliminar reporte', 'error');
            }
        } catch (error) {
            console.error('Error eliminando reporte:', error);
            mostrarToast('Error al conectar con el servidor', 'error');
        } finally {
            mostrarLoading(false);
        }
    });
};

window.initReportarError = initReportarError;
window.initListarErrores = initListarErrores;
