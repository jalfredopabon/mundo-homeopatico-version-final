/**
 * MUNDO HOMEOPÁTICO - Configuración y Lógica Centralizada
 * 2026 - Refactorización Senior (High Performance & Clean Code)
 */

// 1. CONFIGURACIÓN GLOBAL
const APP_CONFIG = {
    SHEETS: {
        PRICES_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1411473006&single=true&output=csv',
        FAQ_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1434563192&single=true&output=csv',
        PASSWORDS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1372762576&single=true&output=csv'
    },
    PROXY: 'https://api.allorigins.win/raw?url=',
    PROXY_BACKUP: 'https://corsproxy.io/?',
    DEFAULT_PASSWORD: "MH2026", // Contraseña de respaldo por defecto
    SELECTORS: {
        PRICES_BODY: '#catalogBody',
        FAQ_CONTAINER: '.faq-container'
    }
};

// 2. ESTADO DE LA APLICACIÓN
const APP_STATE = {
    prices: [],
    faq: [],
    validPasswords: [], // Lista de contraseñas autorizadas
    userMap: new Map(), // Mapa de contraseña -> nombre de usuario
    userName: localStorage.getItem('userName') || '', // Nombre del usuario actual
    professionalMode: localStorage.getItem('professionalMode') === 'true',
    search: {
        timeout: null,
        rows: [],
        sections: []
    }
};

// 3. DATA SERVICE (Peticiones)
const DataService = {
    async fetchCSV(url, retries = 2) {
        const fullUrl = APP_CONFIG.PROXY + encodeURIComponent(url);
        try {
            const response = await fetch(fullUrl, { signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            if (retries > 0) {
                console.warn(`Reintentando carga (${retries} restantes)...`);
                // En el último reintento probamos el proxy de respaldo
                if (retries === 1) {
                    console.info("⚡ Cambiando a proxy de respaldo (CORSProxy)...");
                    const backupUrl = APP_CONFIG.PROXY_BACKUP + encodeURIComponent(url);
                    try {
                        const resp = await fetch(backupUrl);
                        if (resp.ok) return this.parseCSV(await resp.text());
                    } catch (e) { console.error("Proxy de respaldo falló", e); }
                }
                return this.fetchCSV(url, retries - 1);
            }
            throw error;
        }
    },

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
    formatPrice(price) {
        if (!price || price === '-') return '-';
        const numPrice = parseInt(price.replace(/\D/g, ''));
        return isNaN(numPrice) ? '-' : numPrice.toLocaleString('es-CO');
    },

    showLoading(containerSelector, show = true) {
        const progressBar = document.getElementById('topProgressBar');
        if (!progressBar) return;

        if (show) {
            // Resetear completamente antes de mostrar
            progressBar.classList.remove('complete');
            progressBar.style.display = 'block';
            progressBar.classList.add('loading');
        } else {
            progressBar.classList.remove('loading');
            progressBar.classList.add('complete');

            setTimeout(() => {
                // Ocultar y limpiar completamente
                progressBar.classList.remove('complete', 'loading');
                progressBar.style.display = 'none';
                progressBar.style.width = '0';
            }, 700);
        }
    },

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

                const isSpecial = (tableName === 'Homeopaticos_Especiales' || tableName === 'Aceites_Esenciales');
                const productText = isSpecial ? row.Producto : (row.Presentacion ? `${row.Producto} - ${row.Presentacion}` : row.Producto);

                let cellsHTML = `<td class="px-6 py-4 font-bold" data-label="Producto">${productText}</td>`;
                if (isSpecial) cellsHTML += `<td class="px-6 py-4" data-label="Presentación">${row.Presentacion || ''}</td>`;

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
        UIHandlers.cacheSearchElements();
    },

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
    async init() {
        // Asegurar que la barra de progreso esté oculta al inicio
        const progressBar = document.getElementById('topProgressBar');
        if (progressBar) {
            progressBar.classList.remove('loading', 'complete');
            progressBar.style.display = 'none';
            progressBar.style.width = '0';
        }

        this.setupEventListeners();
        this.checkAuth();

        const tasks = [];
        if (document.querySelector(APP_CONFIG.SELECTORS.PRICES_BODY)) tasks.push(this.loadPrices());
        if (document.querySelector(APP_CONFIG.SELECTORS.FAQ_CONTAINER)) tasks.push(this.loadFAQ());

        // Cargamos las contraseñas siempre para que estén listas
        tasks.push(this.loadPasswords());

        await Promise.all(tasks);
    },

    async _sync({ key, url, container, stateKey, renderFn }) {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                try {
                    APP_STATE[stateKey] = JSON.parse(cached);
                    renderFn(APP_STATE[stateKey]);
                } catch (e) { console.error(`Caché corrupto: ${key}`); }
            }

            Renderers.showLoading(container, true);
            const freshData = await DataService.fetchCSV(url);

            if (freshData && freshData.length > 0) {
                APP_STATE[stateKey] = freshData;
                localStorage.setItem(key, JSON.stringify(freshData));
                renderFn(freshData);
            }

            Renderers.showLoading(container, false);
        } catch (error) {
            console.error(`❌ Fallo en ${stateKey}:`, error);
            Renderers.showLoading(container, false);

            // Si no hay datos (primera carga), mostramos error real
            if (APP_STATE[stateKey].length === 0) {
                this.handleError(container, `No se pudieron cargar las ${stateKey === 'faq' ? 'preguntas' : 'precios'}. Por favor, reintenta.`);
            }
        }
    },

    async loadPrices() {
        await this._sync({
            key: 'mh_prices_cache',
            url: APP_CONFIG.SHEETS.PRICES_URL,
            container: APP_CONFIG.SELECTORS.PRICES_BODY,
            stateKey: 'prices',
            renderFn: (data) => Renderers.renderPrices(data)
        });
    },

    async loadFAQ() {
        await this._sync({
            key: 'mh_faq_cache',
            url: APP_CONFIG.SHEETS.FAQ_URL,
            container: APP_CONFIG.SELECTORS.FAQ_CONTAINER,
            stateKey: 'faq',
            renderFn: (data) => Renderers.renderFAQ(data)
        });
    },

    async loadPasswords() {
        try {
            console.log("🔐 Sincronizando lista de acceso...");
            const freshData = await DataService.fetchCSV(APP_CONFIG.SHEETS.PASSWORDS_URL);
            if (freshData && freshData.length > 0) {
                // Leer columna A (contraseñas) y columna B (nombres)
                APP_STATE.validPasswords = [];
                APP_STATE.userMap.clear();

                freshData.forEach(row => {
                    const values = Object.values(row);
                    const password = values[0]?.trim(); // Columna A
                    const name = values[1]?.trim(); // Columna B

                    if (password) {
                        APP_STATE.validPasswords.push(password);
                        if (name) {
                            APP_STATE.userMap.set(password, name);
                        }
                    }
                });

                console.log("✅ Accesos autorizados cargados exitosamente.");
            }
        } catch (error) {
            console.error("❌ Error cargando lista de acceso:", error);
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

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    },

    showUserGreeting(userName) {
        const greetingElement = document.getElementById('userGreeting');
        const greetingText = document.getElementById('greetingText');

        if (greetingElement && greetingText && userName) {
            const greeting = this.getTimeBasedGreeting();
            greetingText.textContent = `${greeting}, ${userName}`;
            greetingElement.classList.remove('hidden');
            greetingElement.classList.add('flex');

            // Actualizar iconos de Lucide
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    hideUserGreeting() {
        const greetingElement = document.getElementById('userGreeting');
        if (greetingElement) {
            greetingElement.classList.add('hidden');
            greetingElement.classList.remove('flex');
        }
    },

    setupEventListeners() {
        if (typeof lucide !== 'undefined') lucide.createIcons();

        const searchInput = document.getElementById('mainSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterItems());
        }

        document.getElementById('submitPassword')?.addEventListener('click', () => this.validatePassword());
        document.getElementById('cancelPassword')?.addEventListener('click', () => this.closePasswordModal());
        document.getElementById('professionalPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.validatePassword();
        });

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

        // Mostrar saludo si hay usuario logueado
        if (APP_STATE.userName) {
            this.showUserGreeting(APP_STATE.userName);
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'true') {
            this.showPasswordModal();
        }
    },

    cacheSearchElements() {
        APP_STATE.search.rows = Array.from(document.querySelectorAll('.item-row'));
        APP_STATE.search.sections = Array.from(document.querySelectorAll('.section-group'));
    },

    filterItems() {
        clearTimeout(APP_STATE.search.timeout);
        APP_STATE.search.timeout = setTimeout(() => this._performSearch(), 100);
    },

    _performSearch() {
        const searchInput = document.getElementById('mainSearch');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();
        const feedback = document.getElementById('searchFeedback');
        const feedbackText = document.getElementById('feedbackText');
        const dropdown = document.getElementById('searchDropdown');
        const dropdownResults = document.getElementById('dropdownResults');
        const clearButton = document.getElementById('clearSearch');

        if (APP_STATE.search.rows.length === 0) this.cacheSearchElements();

        const rows = APP_STATE.search.rows;
        const sections = APP_STATE.search.sections;

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

        sections.forEach(section => {
            const hasVisible = section.querySelectorAll('.item-row:not([style*="display: none"])').length > 0;
            section.style.display = (hasVisible || query === "") ? "" : "none";
        });

        if (query === "") {
            dropdown?.classList.add('hidden');
            feedback?.classList.add('opacity-0', 'hidden');
        } else if (visibleCount === 0) {
            dropdown?.classList.add('hidden');
            if (feedback) {
                feedback.classList.remove('opacity-0', 'hidden');
                feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700';
                feedbackText.innerHTML = `No se encontraron resultados para <strong>"${query}"</strong>`;
            }
        } else {
            feedback?.classList.remove('opacity-0', 'hidden');
            if (feedback) {
                feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-farmacia';
                feedbackText.innerHTML = visibleCount === 1 ? '¡Encontrado! <strong>1 producto</strong>' : `Se encontraron <strong>${visibleCount} productos</strong>`;
            }

            if (dropdownResults) {
                dropdownResults.innerHTML = '';
                matchedRows.slice(0, 10).forEach(row => {
                    const productName = row.querySelector('td:first-child')?.innerText || 'Producto';
                    const sectionTitle = row.closest('.section-group')?.querySelector('h3, h4, h5')?.innerText || 'Sección';

                    const item = document.createElement('div');
                    item.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0';
                    item.innerHTML = `
                        <div class="font-bold text-slate-800 text-[13px]">${productName}</div>
                        <div class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">${sectionTitle}</div>
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
        const passwordValue = input?.value?.trim();

        // Verificamos contra la lista de Google Sheets O la contraseña por defecto
        const isValid = APP_STATE.validPasswords.includes(passwordValue) ||
            passwordValue === APP_CONFIG.DEFAULT_PASSWORD;

        if (isValid) {
            document.body.classList.add('professional-mode');
            localStorage.setItem('professionalMode', 'true');
            APP_STATE.professionalMode = true;

            // Obtener y guardar el nombre del usuario
            let userName = APP_STATE.userMap.get(passwordValue);
            if (!userName && passwordValue === APP_CONFIG.DEFAULT_PASSWORD) {
                userName = 'Administrador'; // Nombre por defecto para la contraseña maestra
            }

            if (userName) {
                APP_STATE.userName = userName;
                localStorage.setItem('userName', userName);
                this.showUserGreeting(userName);
            }

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

    toggleFaq(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('[data-lucide="chevron-down"]');
        const isHidden = content.classList.contains('hidden');

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

        if (isActive) {
            content.style.maxHeight = content.scrollHeight + "px";
        } else {
            content.style.maxHeight = "0";
        }
    },

    loadYouTubeVideo(element) {
        const videoId = element.getAttribute('data-video-id');

        // Loader temporal dentro del contenedor
        element.innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white animate-pulse">
                <div class="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                <span class="text-xs font-medium tracking-widest uppercase">Cargando Video...</span>
            </div>
        `;

        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full relative z-10';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = 'Mundo Homeopático - Proceso';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        // Cuando cargue, eliminamos el loader
        iframe.onload = () => {
            const loader = element.querySelector('.animate-pulse');
            if (loader) loader.remove();
        };

        element.appendChild(iframe);
        element.onclick = null;
    }
};

window.addEventListener('DOMContentLoaded', () => UIHandlers.init());