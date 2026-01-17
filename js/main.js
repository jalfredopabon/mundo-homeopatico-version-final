/**
 * MUNDO HOMEOPÁTICO - Configuración y Lógica Centralizada
 * 2026 - Refactorización Senior
 */

// 1. CONFIGURACIÓN GLOBAL
// Centralizamos IDs y URLs para fácil mantenimiento
const APP_CONFIG = {
    SHEETS: {
        PRICES_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1411473006&single=true&output=csv',
        FAQ_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1434563192&single=true&output=csv'
    },
    PROXY: 'https://api.allorigins.win/raw?url=',
    PASSWORD: "MH2024",
    SELECTORS: {
        PRICES_BODY: '#catalogBody',
        FAQ_CONTAINER: '.faq-container'
    }
};

// 2. ESTADO DE LA APLICACIÓN
const APP_STATE = {
    prices: [],
    faq: [],
    isLoading: false,
    error: null,
    professionalMode: localStorage.getItem('professionalMode') === 'true'
};

// 3. DATA SERVICE (Peticiones)
// Función core para fetch centralizada
const DataService = {
    async fetchCSV(url) {
        const fullUrl = APP_CONFIG.PROXY + encodeURIComponent(url);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        return this.parseCSV(csvText);
    },

    // Parser robusto que maneja comas dentro de comillas y campos vacíos
    parseCSV(csv) {
        const lines = csv.split(/\r?\n/);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = [];
            let current = '';
            let inQuotes = false;

            for (let char of line) {
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const row = {};
            headers.forEach((header, index) => {
                let val = values[index] || '';
                row[header] = val.replace(/^"|"$/g, '');
            });
            data.push(row);
        }
        return data;
    }
};

// 4. RENDERING ENGINE (UI)
const Renderers = {
    // Formatear precios
    formatPrice(price) {
        if (!price || price === '-') return '-';
        const numPrice = parseInt(price.replace(/\D/g, ''));
        return isNaN(numPrice) ? '-' : numPrice.toLocaleString('es-CO');
    },

    // Indicador de carga inteligente (Subtle & Non-intrusive)
    showLoading(containerSelector, show = true) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        let loader = container.querySelector('.loading-state');

        if (show) {
            // Solo mostrar el mensaje grande si el contenedor está casi vacío (ej: solo el título)
            const hasData = container.querySelectorAll('.item-row, .faq-content').length > 0;

            if (!loader) {
                loader = document.createElement('div');
                loader.className = 'loading-state flex items-center justify-center gap-3 p-4 bg-emerald-50/50 rounded-xl mb-6 text-emerald-700 border border-emerald-100 transition-all duration-300';
                loader.innerHTML = `
                    <div class="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <span class="text-xs font-semibold tracking-tight">Sincronizando con Google Sheets...</span>
                `;

                // Si ya hay datos, lo ponemos de forma muy sutil arriba
                if (hasData) {
                    loader.classList.add('opacity-80', 'mx-auto', 'max-w-xs');
                    container.prepend(loader);
                } else {
                    // Si no hay nada, centramos el loader de forma elegante
                    loader.className = 'loading-state flex flex-col items-center justify-center p-20 text-slate-400 animate-pulse';
                    loader.innerHTML = `
                        <div class="w-10 h-10 border-4 border-emerald-100 border-t-farmacia rounded-full animate-spin mb-4"></div>
                        <p class="text-sm font-medium">Cargando catálogo oficial...</p>
                    `;
                    container.append(loader);
                }
            }
        } else {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 300);
            }
        }
    },

    // Renderizar Tablas de Precios
    renderPrices(data) {
        const tableData = {};
        data.forEach(row => {
            const tableName = row.Tabla;
            if (!tableData[tableName]) tableData[tableName] = [];
            tableData[tableName].push(row);
        });

        const tableSelectors = {
            'Oficinales': '#oficinales tbody',
            'Multipotencias': '#multipotencias tbody',
            'Magistrales': '#magistrales tbody',
            'Esencias_Florales_Prep': '#esencias-prep tbody',
            'Oligoelementos': '#oligo-prep tbody',
            'Homeopaticos_Esenciales': '#esenciales-d4 tbody',
            'Homeopaticos_Especiales': '#especiales tbody',
            'Cuidado_Capilar': '#capilar tbody',
            'Capsulas': '#capsulas tbody',
            'Cremas': '#cremas tbody',
            'Geles': '#geles tbody',
            'Unguentos': '#unguentos tbody',
            'Elixires': '#elixires tbody',
            'Esencias_Florales_MH': '#esencias-mh tbody',
            'Oligoelementos_K7': '#oligo-k7 tbody',
            'Alimentos_Funcionales': '#alimentos-funcionales tbody',
            'CBD': '#cbd tbody',
            'Aceites_Esenciales': '#aceites-esenciales tbody'
        };

        Object.entries(tableSelectors).forEach(([tableName, selector]) => {
            const tbody = document.querySelector(selector);
            if (!tbody || !tableData[tableName]) return;

            const fragment = document.createDocumentFragment();
            tableData[tableName].forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'item-row hover-row';

                // Construcción eficiente de celdas
                const isSpecial = (tableName === 'Homeopaticos_Especiales' || tableName === 'Aceites_Esenciales');
                const productText = isSpecial ? row.Producto : (row.Presentacion ? `${row.Producto} - ${row.Presentacion}` : row.Producto);

                let cellsHTML = `<td class="px-6 py-4 font-bold" data-label="Producto">${productText}</td>`;

                if (isSpecial) {
                    cellsHTML += `<td class="px-6 py-4" data-label="Presentación">${row.Presentacion || ''}</td>`;
                }

                cellsHTML += `
                    <td class="px-6 py-4 text-right text-farmacia professional-only" data-label="Precio Farmacia">${this.formatPrice(row.Precio_Farmacia)}</td>
                    <td class="px-6 py-4 text-right text-publico" data-label="Precio Público">${this.formatPrice(row.Precio_Publico)}</td>
                `;

                tr.innerHTML = cellsHTML;
                fragment.appendChild(tr);
            });

            tbody.innerHTML = '';
            tbody.appendChild(fragment);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // Renderizar FAQ
    renderFAQ(data) {
        const container = document.querySelector(APP_CONFIG.SELECTORS.FAQ_CONTAINER);
        if (!container) return;

        const fragment = document.createDocumentFragment();
        data.forEach(item => {
            const question = item.Pregunta || item.pregunta;
            const answer = item.Respuesta || item.respuesta;

            const div = document.createElement('div');
            div.className = 'bg-white rounded-xl border border-slate-200 overflow-hidden mb-3';
            div.innerHTML = `
                <button onclick="UIHandlers.toggleFaq(this)"
                    class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                    <span class="font-semibold text-slate-700">${question}</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform"></i>
                </button>
                <div class="faq-content px-6 pb-4 hidden">
                    <p class="text-slate-600 text-sm leading-relaxed">${answer}</p>
                </div>
            `;
            fragment.appendChild(div);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// 5. EVENT HANDLERS & LOGIC
const UIHandlers = {
    // Inicializar la App
    async init() {
        this.setupEventListeners();
        this.checkAuth();

        // Cargar Precios si estamos en el catálogo
        if (document.querySelector(APP_CONFIG.SELECTORS.PRICES_BODY)) {
            await this.loadPrices();
        }

        // Cargar FAQ si estamos en contacto (o si existe el contenedor)
        if (document.querySelector(APP_CONFIG.SELECTORS.FAQ_CONTAINER)) {
            await this.loadFAQ();
        }
    },

    async loadPrices() {
        try {
            // 1. Cargar desde caché para inmediatez absoluta
            const cached = localStorage.getItem('mh_prices_cache');
            if (cached) {
                try {
                    APP_STATE.prices = JSON.parse(cached);
                    Renderers.renderPrices(APP_STATE.prices);
                } catch (e) { console.error('Error parseando caché precios'); }
            }

            // 2. Mostrar indicador sutil
            Renderers.showLoading(APP_CONFIG.SELECTORS.PRICES_BODY, true);

            // 3. Fetch real
            const freshData = await DataService.fetchCSV(APP_CONFIG.SHEETS.PRICES_URL);

            // 4. Solo actualizar si obtuvimos datos válidos
            if (freshData && freshData.length > 0) {
                APP_STATE.prices = freshData;
                localStorage.setItem('mh_prices_cache', JSON.stringify(APP_STATE.prices));
                Renderers.renderPrices(APP_STATE.prices);
                console.log(`✅ ${APP_STATE.prices.length} precios sincronizados`);
            }

            Renderers.showLoading(APP_CONFIG.SELECTORS.PRICES_BODY, false);
        } catch (error) {
            console.error('❌ Error Sincronización Precios:', error);
            Renderers.showLoading(APP_CONFIG.SELECTORS.PRICES_BODY, false);

            // SOLO mostramos el mensaje de error "rojo" si la página está TOTALMENTE VACÍA
            if (APP_STATE.prices.length === 0) {
                this.handleError(APP_CONFIG.SELECTORS.PRICES_BODY, 'No se pudo conectar con el servidor de precios.');
            }
        }
    },

    async loadFAQ() {
        try {
            // 1. Cargar desde caché para inmediatez absoluta
            const cached = localStorage.getItem('mh_faq_cache');
            if (cached) {
                try {
                    APP_STATE.faq = JSON.parse(cached);
                    Renderers.renderFAQ(APP_STATE.faq);
                } catch (e) { console.error('Cache FAQ corrupto'); }
            }

            // 2. Mostrar indicador sutil
            Renderers.showLoading(APP_CONFIG.SELECTORS.FAQ_CONTAINER, true);

            // 3. Fetch real
            const freshFAQ = await DataService.fetchCSV(APP_CONFIG.SHEETS.FAQ_URL);

            // 4. Solo actualizar si obtuvimos datos válidos
            if (freshFAQ && freshFAQ.length > 0) {
                APP_STATE.faq = freshFAQ;
                localStorage.setItem('mh_faq_cache', JSON.stringify(APP_STATE.faq));
                Renderers.renderFAQ(APP_STATE.faq);
                console.log(`✅ ${APP_STATE.faq.length} FAQ sincronizadas`);
            }

            Renderers.showLoading(APP_CONFIG.SELECTORS.FAQ_CONTAINER, false);
        } catch (error) {
            console.error('❌ Error Sincronización FAQ:', error);
            Renderers.showLoading(APP_CONFIG.SELECTORS.FAQ_CONTAINER, false);

            // SOLO mostramos mensaje si no hay nada en absoluto
            if (APP_STATE.faq.length === 0) {
                const container = document.querySelector(APP_CONFIG.SELECTORS.FAQ_CONTAINER);
                if (container) container.innerHTML = '<p class="text-center text-slate-500 py-8">Cargando preguntas frecuentes...</p>';
            }
        }
    },

    handleError(selector, message) {
        const container = document.querySelector(selector);
        if (!container) return;
        container.innerHTML = `
            <div class="p-8 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600">
                <i data-lucide="alert-circle" class="w-10 h-10 mx-auto mb-3"></i>
                <p class="font-bold">${message}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reintentar</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    setupEventListeners() {
        // Lucide inicial
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Búsqueda
        const searchInput = document.getElementById('mainSearch');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => this.filterItems());
            searchInput.addEventListener('focus', () => this.filterItems());
        }

        // Acceso Profesional
        document.getElementById('submitPassword')?.addEventListener('click', () => this.validatePassword());
        document.getElementById('cancelPassword')?.addEventListener('click', () => this.closePasswordModal());
        document.getElementById('professionalPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.validatePassword();
        });

        // Cerrar dropdown al clickear fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('searchDropdown');
            const searchContainer = searchInput?.parentElement;
            if (dropdown && searchContainer && !searchContainer.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    },

    checkAuth() {
        if (APP_STATE.professionalMode) {
            document.body.classList.add('professional-mode');
        }
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'true') {
            this.showPasswordModal();
        }
    },

    // Búsqueda (Lógica refactorizada)
    filterItems() {
        const searchInput = document.getElementById('mainSearch');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('.item-row');
        const sectionGroups = document.querySelectorAll('.section-group');
        const feedback = document.getElementById('searchFeedback');
        const feedbackText = document.getElementById('feedbackText');
        const dropdown = document.getElementById('searchDropdown');
        const dropdownResults = document.getElementById('dropdownResults');
        const clearButton = document.getElementById('clearSearch');

        if (clearButton) {
            query === "" ? clearButton.classList.add('hidden') : clearButton.classList.remove('hidden');
        }

        let visibleCount = 0;
        let matchedRows = [];

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const isVisible = text.includes(query);
            row.style.display = isVisible ? "" : "none";
            if (isVisible) {
                visibleCount++;
                matchedRows.push(row);
            }
        });

        sectionGroups.forEach(section => {
            const visible = section.querySelectorAll('.item-row:not([style*="display: none"])').length;
            section.style.display = (visible > 0 || query === "") ? "" : "none";
        });

        // Dropdown y Feedback
        if (query === "") {
            dropdown?.classList.add('hidden');
            feedback?.classList.add('opacity-0', 'hidden');
        } else if (visibleCount === 0) {
            dropdown?.classList.add('hidden');
            if (feedback) {
                feedback.classList.remove('opacity-0', 'hidden');
                feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700';
                feedbackText.innerHTML = `<strong>No se encontraron resultados</strong> para "${query}"`;
            }
        } else {
            feedback?.classList.remove('opacity-0', 'hidden');
            if (feedback) {
                feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-farmacia';
                feedbackText.innerHTML = `Se ${visibleCount === 1 ? 'encontró <strong>1 resultado</strong>' : `encontraron <strong>${visibleCount} resultados</strong>`}`;
            }

            if (dropdownResults) {
                dropdownResults.innerHTML = '';
                matchedRows.slice(0, 10).forEach(row => {
                    const productName = row.querySelector('td:first-child')?.innerText || 'Producto';
                    const sectionTitle = row.closest('.section-group')?.querySelector('h3, h4, h5')?.innerText || 'Sección';

                    const item = document.createElement('div');
                    item.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors';
                    item.innerHTML = `
                        <div class="font-medium text-slate-800 text-sm">${productName}</div>
                        <div class="text-xs text-slate-500 mt-0.5">${sectionTitle}</div>
                    `;
                    item.onclick = () => {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.classList.add('bg-emerald-50');
                        setTimeout(() => row.classList.remove('bg-emerald-50'), 2000);
                        dropdown.classList.add('hidden');
                    };
                    dropdownResults.appendChild(item);
                });
                dropdown.classList.remove('hidden');
            }
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    clearSearch() {
        const input = document.getElementById('mainSearch');
        if (input) {
            input.value = '';
            this.filterItems();
            input.focus();
        }
    },

    // UI Modals
    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('errorMessage')?.classList.add('hidden');
            const input = document.getElementById('professionalPassword');
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 100);
            }
        }
    },

    closePasswordModal() {
        document.getElementById('passwordModal')?.classList.add('hidden');
    },

    validatePassword() {
        const input = document.getElementById('professionalPassword');
        if (input?.value === APP_CONFIG.PASSWORD) {
            document.body.classList.add('professional-mode');
            localStorage.setItem('professionalMode', 'true');
            APP_STATE.professionalMode = true;
            this.closePasswordModal();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            document.getElementById('errorMessage')?.classList.remove('hidden');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    },

    // Acordeones y FAQs
    toggleFaq(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('[data-lucide="chevron-down"]');
        const isHidden = content.classList.contains('hidden');

        // Cerrar otros
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-container i').forEach(i => i.style.transform = '');

        if (isHidden) {
            content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    },

    toggleAccordion(button) {
        const content = button.parentElement.querySelector('.accordion-content');
        const icon = button.querySelector('[data-lucide="chevron-down"]');
        if (!content) return;

        content.classList.toggle('active');
        const isActive = content.classList.contains('active');

        if (icon) icon.style.transform = isActive ? 'rotate(180deg)' : '';

        // Animación suave si se prefiere vía JS o CSS
        if (isActive) {
            content.style.maxHeight = content.scrollHeight + "px";
        } else {
            content.style.maxHeight = "0";
        }
    },

    loadYouTubeVideo(element) {
        const videoId = element.getAttribute('data-video-id');
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = 'Mundo Homeopático - Proceso';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        element.innerHTML = '';
        element.appendChild(iframe);
        element.onclick = null;
    }
};

// 6. LANZAMIENTO
window.addEventListener('DOMContentLoaded', () => UIHandlers.init());