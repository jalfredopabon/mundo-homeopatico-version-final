/**
 * MUNDO HOMEOPÁTICO - Configuración y Lógica Centralizada
 * 2026 - Refactorización Senior (High Performance & Clean Code)
 */

// 1. CONFIGURACIÓN GLOBAL
const APP_CONFIG = {
    SHEETS: {
        PRICES_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1411473006&single=true&output=csv',
        FAQ_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1434563192&single=true&output=csv',
        PASSWORDS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1372762576&single=true&output=csv',
        VIDEO_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1360742312&single=true&output=csv',
        DISTRIBUTORS_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=486540156&single=true&output=csv'
    },
    PROXY: 'https://api.allorigins.win/raw?url=',
    PROXY_BACKUP: 'https://corsproxy.io/?',
    DEFAULT_PASSWORD: "MH2026",

    STORAGE_KEYS: {
        USER_NAME: 'userName',
        PROFESSIONAL_MODE: 'professionalMode',
        PRICES_CACHE: 'mh_prices_cache',
        FAQ_CACHE: 'mh_faq_cache',
        BANNER_CLOSED: 'prescriptionBannerClosed'
    },

    SELECTORS: {
        PRICES_BODY: '#catalogBody',
        FAQ_CONTAINER: '.faq-container'
    }
};

// 2. ESTADO DE LA APLICACIÓN
const APP_STATE = {
    prices: [],
    faq: [],
    validPasswords: [],
    userMap: new Map(),
    userName: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_NAME) || '',
    professionalMode: localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROFESSIONAL_MODE) === 'true',
    search: {
        timeout: null,
        rows: [],
        sections: []
    }
};

// 3. TEXTOS DE INTERFAZ (MENSAJES)
const UI_MESSAGES = {
    errors: {
        loadDataFailed: 'No se pudieron cargar los datos. Por favor, intente nuevamente.',
        networkError: 'Error de conexión. Verifique su internet.',
        invalidPassword: 'Contraseña incorrecta. Intente nuevamente.',
        noResults: 'No se encontraron resultados para su búsqueda.',
        cacheCorrupted: 'Caché corrupto',
        syncFailed: 'Fallo en sincronización'
    },
    success: {
        loginSuccess: '¡Acceso concedido!',
        dataLoaded: 'Datos cargados correctamente',
        sessionActive: 'Sesión activa'
    },
    greetings: {
        morning: 'Buenos días',
        afternoon: 'Buenas tardes',
        evening: 'Buenas noches'
    },
    sheets: {
        retrying: 'Reintentando carga',
        retriesRemaining: 'restantes',
        proxySwitch: '⚡ Cambiando a proxy de respaldo (CORSProxy)...',
        proxyFailed: 'Proxy de respaldo falló',
        passwordsLoading: '🔐 Sincronizando lista de acceso...',
        passwordsSuccess: '✅ Accesos autorizados cargados exitosamente.',
        passwordsError: '❌ Error cargando lista de acceso'
    },
    ui: {
        retry: 'Reintentar',
        defaultAdminName: 'Administrador',
        section: 'Sección',
        loading: 'Cargando datos...',
        loadingVideo: 'Cargando Video...'
    }
};

// 4. FORMATEADORES
const Formatters = {
    price(price) {
        if (!price || price === '-') return '-';
        const numPrice = parseInt(String(price).replace(/\D/g, ''));
        return isNaN(numPrice) ? '-' : numPrice.toLocaleString('es-CO');
    },

    phoneDisplay(phone) {
        if (!phone) return '';
        const cleaned = String(phone).replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        return String(phone);
    },

    whatsapp(phone) {
        if (!phone) return '';
        const cleaned = String(phone).replace(/\D/g, '');
        if (cleaned.startsWith('57')) return cleaned;
        if (cleaned.length === 10) return '57' + cleaned;
        return cleaned;
    }
};

// 5. CACHÉ DEL DOM
const DOM_CACHE = {
    init() {
        this.progressBar = document.getElementById('topProgressBar');
        this.searchInput = document.getElementById('mainSearch');
        this.searchDropdown = document.getElementById('searchDropdown');
        this.searchFeedback = document.getElementById('searchFeedback');
        this.feedbackText = document.getElementById('feedbackText');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.dropdownResults = document.getElementById('dropdownResults');
        this.userGreeting = document.getElementById('userGreeting');
        this.greetingText = document.getElementById('greetingText');
        this.passwordModal = document.getElementById('passwordModal');
        this.professionalPassword = document.getElementById('professionalPassword');
        this.submitPasswordBtn = document.getElementById('submitPassword');
        this.cancelPasswordBtn = document.getElementById('cancelPassword');
        this.errorMessage = document.getElementById('errorMessage');
        this.catalogBody = document.getElementById('catalogBody');
        this.prescriptionBanner = document.getElementById('prescriptionBanner');
        this.faqContainer = document.querySelector('.faq-container');
        this.distributorsGrid = document.getElementById('distributors-grid');
        this.sedePrincipalContainer = document.getElementById('sede-principal-container');
    },

    progressBar: null,
    searchInput: null,
    searchDropdown: null,
    searchFeedback: null,
    feedbackText: null,
    clearSearchBtn: null,
    dropdownResults: null,
    userGreeting: null,
    greetingText: null,
    passwordModal: null,
    professionalPassword: null,
    submitPasswordBtn: null,
    cancelPasswordBtn: null,
    errorMessage: null,
    catalogBody: null,
    prescriptionBanner: null,
    faqContainer: null,
    distributorsGrid: null,
    sedePrincipalContainer: null
};

// 6. SERVICIO DE DATOS (API/CSV)
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
                console.warn(`${UI_MESSAGES.sheets.retrying} (${retries} ${UI_MESSAGES.sheets.retriesRemaining})...`);
                if (retries === 1) {
                    const backupUrl = APP_CONFIG.PROXY_BACKUP + encodeURIComponent(url);
                    try {
                        const resp = await fetch(backupUrl);
                        if (resp.ok) return this.parseCSV(await resp.text());
                    } catch (e) { console.error(UI_MESSAGES.sheets.proxyFailed, e); }
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

// 7. MOTOR DE RENDERIZADO (UI)
const Renderers = {
    showLoading(containerSelector, show = true) {
        const progressBar = DOM_CACHE.progressBar;
        if (!progressBar) return;

        if (show) {
            progressBar.classList.remove('complete');
            progressBar.style.display = 'block';
            progressBar.classList.add('loading');
        } else {
            progressBar.classList.remove('loading');
            progressBar.classList.add('complete');
            setTimeout(() => {
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
                    <td class="px-6 py-4 text-right text-farmacia professional-only" data-label="Precio Farmacia">${Formatters.price(row.Precio_Farmacia)}</td>
                    <td class="px-6 py-4 text-right text-publico" data-label="Precio Público">${Formatters.price(row.Precio_Publico)}</td>
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
        const container = DOM_CACHE.faqContainer;
        if (!container) return;

        const fragment = document.createDocumentFragment();
        data.forEach(item => {
            const question = item.Pregunta || item.pregunta;
            const answer = item.Respuesta || item.respuesta;
            const div = document.createElement('div');
            div.className = 'faq-item';
            div.innerHTML = `
                <button onclick="UIHandlers.toggleFaq(this)"
                    class="faq-trigger">
                    <span class="faq-question">${question}</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 transition-transform"></i>
                </button>
                <div class="faq-content faq-answer-container hidden">
                    <p class="faq-answer-text">${answer}</p>
                </div>
            `;
            fragment.appendChild(div);
        });
        container.innerHTML = '';
        container.appendChild(fragment);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// 8. CONTROLADORES DE INTERFAZ (LOGIC)
const UIHandlers = {
    async init() {
        const progressBar = DOM_CACHE.progressBar;
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
                } catch (e) { console.error(`${UI_MESSAGES.errors.cacheCorrupted}: ${key}`); }
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
            console.error(`❌ ${UI_MESSAGES.errors.syncFailed} en ${stateKey}:`, error);
            Renderers.showLoading(container, false);
            if (APP_STATE[stateKey].length === 0) {
                this.handleError(container, `No se pudieron cargar las ${stateKey === 'faq' ? 'preguntas' : 'precios'}. Por favor, reintenta.`);
            }
        }
    },

    async loadPrices() {
        await this._sync({
            key: APP_CONFIG.STORAGE_KEYS.PRICES_CACHE,
            url: APP_CONFIG.SHEETS.PRICES_URL,
            container: APP_CONFIG.SELECTORS.PRICES_BODY,
            stateKey: 'prices',
            renderFn: (data) => Renderers.renderPrices(data)
        });
    },

    async loadFAQ() {
        await this._sync({
            key: APP_CONFIG.STORAGE_KEYS.FAQ_CACHE,
            url: APP_CONFIG.SHEETS.FAQ_URL,
            container: APP_CONFIG.SELECTORS.FAQ_CONTAINER,
            stateKey: 'faq',
            renderFn: (data) => Renderers.renderFAQ(data)
        });
    },

    async loadPasswords() {
        try {
            const freshData = await DataService.fetchCSV(APP_CONFIG.SHEETS.PASSWORDS_URL);
            if (freshData && freshData.length > 0) {
                APP_STATE.validPasswords = [];
                APP_STATE.userMap.clear();
                freshData.forEach(row => {
                    const values = Object.values(row);
                    const password = values[0]?.trim();
                    const name = values[1]?.trim();
                    if (password) {
                        APP_STATE.validPasswords.push(password);
                        if (name) APP_STATE.userMap.set(password, name);
                    }
                });
            }
        } catch (error) { console.error(UI_MESSAGES.sheets.passwordsError, error); }
    },

    handleError(selector, message) {
        const container = document.querySelector(selector);
        if (!container) return;
        container.innerHTML = `
            <div class="p-8 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600">
                <i data-lucide="alert-circle" class="w-10 h-10 mx-auto mb-3"></i>
                <p class="font-bold">${message}</p>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">${UI_MESSAGES.ui.retry}</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return UI_MESSAGES.greetings.morning;
        if (hour < 19) return UI_MESSAGES.greetings.afternoon;
        return UI_MESSAGES.greetings.evening;
    },

    showUserGreeting(userName) {
        const greetingElement = DOM_CACHE.userGreeting;
        const greetingText = DOM_CACHE.greetingText;
        if (greetingElement && greetingText && userName) {
            const greeting = this.getTimeBasedGreeting();
            greetingText.textContent = `${greeting}, ${userName}`;
            greetingElement.classList.remove('hidden');
            greetingElement.classList.add('flex');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    hideUserGreeting() {
        const greetingElement = DOM_CACHE.userGreeting;
        if (greetingElement) {
            greetingElement.classList.add('hidden');
            greetingElement.classList.remove('flex');
        }
    },

    setupEventListeners() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        const searchInput = DOM_CACHE.searchInput;
        if (searchInput) searchInput.addEventListener('input', () => this.filterItems());

        DOM_CACHE.submitPasswordBtn?.addEventListener('click', () => this.validatePassword());
        DOM_CACHE.cancelPasswordBtn?.addEventListener('click', () => this.closePasswordModal());
        DOM_CACHE.professionalPassword?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.validatePassword();
        });

        document.addEventListener('click', (e) => {
            const dropdown = DOM_CACHE.searchDropdown;
            const searchContainer = DOM_CACHE.searchInput?.parentElement;
            if (dropdown && searchContainer && !searchContainer.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    },

    checkAuth() {
        if (APP_STATE.professionalMode) document.body.classList.add('professional-mode');
        if (APP_STATE.userName) this.showUserGreeting(APP_STATE.userName);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'true') this.showPasswordModal();
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
        const searchInput = DOM_CACHE.searchInput;
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        const feedback = DOM_CACHE.searchFeedback;
        const feedbackText = DOM_CACHE.feedbackText;
        const dropdown = DOM_CACHE.searchDropdown;
        const dropdownResults = DOM_CACHE.dropdownResults;
        const clearButton = DOM_CACHE.clearSearchBtn;

        if (APP_STATE.search.rows.length === 0) this.cacheSearchElements();
        const rows = APP_STATE.search.rows;
        const sections = APP_STATE.search.sections;

        if (clearButton) query === "" ? clearButton.classList.add('hidden') : clearButton.classList.remove('hidden');

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
        const input = DOM_CACHE.searchInput;
        if (input) {
            input.value = '';
            this.filterItems();
            input.focus();
        }
    },

    showPasswordModal() {
        if (DOM_CACHE.passwordModal) {
            DOM_CACHE.passwordModal.classList.remove('hidden');
            DOM_CACHE.errorMessage?.classList.add('hidden');
            const input = DOM_CACHE.professionalPassword;
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 100);
            }
        }
    },

    closePasswordModal() { DOM_CACHE.passwordModal?.classList.add('hidden'); },

    validatePassword() {
        const input = DOM_CACHE.professionalPassword;
        const passwordValue = input?.value?.trim();
        const isValid = APP_STATE.validPasswords.includes(passwordValue) || passwordValue === APP_CONFIG.DEFAULT_PASSWORD;

        if (isValid) {
            document.body.classList.add('professional-mode');
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PROFESSIONAL_MODE, 'true');
            APP_STATE.professionalMode = true;
            let userName = APP_STATE.userMap.get(passwordValue) || (passwordValue === APP_CONFIG.DEFAULT_PASSWORD ? UI_MESSAGES.ui.defaultAdminName : '');
            if (userName) {
                APP_STATE.userName = userName;
                localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_NAME, userName);
                this.showUserGreeting(userName);
            }
            this.closePasswordModal();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            DOM_CACHE.errorMessage?.classList.remove('hidden');
            if (input) { input.value = ''; input.focus(); }
        }
    },

    toggleFaq(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('[data-lucide="chevron-down"]');
        const isHidden = content.classList.contains('hidden');
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-container [data-lucide="chevron-down"]').forEach(i => i.style.transform = '');
        if (isHidden) {
            content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    },

    logout() {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PROFESSIONAL_MODE);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_NAME);
        window.location.reload();
    },

    toggleAccordion(button) {
        const content = button.parentElement.querySelector('.accordion-content');
        const icon = button.querySelector('[data-lucide="chevron-down"]');
        if (!content) return;
        content.classList.toggle('active');
        const isActive = content.classList.contains('active');
        if (icon) icon.style.transform = isActive ? 'rotate(180deg)' : '';
        content.style.maxHeight = isActive ? content.scrollHeight + "px" : "0";
    },

    loadYouTubeVideo(element) {
        const videoId = element.getAttribute('data-video-id');
        element.innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white animate-pulse">
                <div class="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
                <span class="text-xs font-medium tracking-widest uppercase">${UI_MESSAGES.ui.loadingVideo}</span>
            </div>
        `;
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full relative z-10';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = 'Mundo Homeopático - Proceso';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.onload = () => { element.querySelector('.animate-pulse')?.remove(); };
        element.appendChild(iframe);
        element.onclick = null;
    },

    toggleSidebarAccordion(button) {
        const nav = button.nextElementSibling;
        const chevron = button.querySelector('[data-lucide="chevron-down"]');
        if (nav && nav.tagName === 'NAV') {
            const isCurrentlyHidden = nav.classList.contains('hidden');
            document.querySelectorAll('nav.ml-4').forEach(accordion => {
                accordion.classList.add('hidden');
                const btn = accordion.previousElementSibling;
                const chev = btn?.querySelector('[data-lucide="chevron-down"]');
                if (chev) chev.style.transform = '';
            });
            if (isCurrentlyHidden) {
                nav.classList.remove('hidden');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    showPrescriptionBanner() {
        const banner = DOM_CACHE.prescriptionBanner;
        const catalogBody = DOM_CACHE.catalogBody;
        const bannerClosed = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.BANNER_CLOSED);
        if (!bannerClosed && banner) {
            banner.classList.remove('hidden');
            requestAnimationFrame(() => {
                banner.classList.add('banner-visible');
                if (catalogBody) catalogBody.classList.add('banner-active');
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    closePrescriptionBanner() {
        const banner = DOM_CACHE.prescriptionBanner;
        const catalogBody = DOM_CACHE.catalogBody;
        if (banner) {
            banner.classList.remove('banner-visible');
            if (catalogBody) catalogBody.classList.remove('banner-active');
            setTimeout(() => banner.classList.add('hidden'), 500);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.BANNER_CLOSED, 'true');
        }
    }
};

// 9. SERVICIOS ADICIONALES
const VideoService = {
    extractYouTubeID(url) {
        if (!url) return null;
        url = url.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (watchMatch) return watchMatch[1];
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        return shortMatch ? shortMatch[1] : null;
    },

    async loadVideoURL() {
        try {
            const data = await DataService.fetchCSV(APP_CONFIG.SHEETS.VIDEO_URL);
            return (data && data.length >= 2) ? data[1][0] : null;
        } catch (e) { return null; }
    },

    async updateVideo() {
        const videoContainer = document.querySelector('[data-video-id]');
        if (!videoContainer) return;
        const videoURL = await this.loadVideoURL();
        const videoID = this.extractYouTubeID(videoURL);
        if (videoID) {
            videoContainer.setAttribute('data-video-id', videoID);
            const previewImg = videoContainer.querySelector('img');
            if (previewImg) previewImg.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
        }
    }
};

const DistributorsService = {
    async loadDistributors() {
        try {
            return await DataService.fetchCSV(APP_CONFIG.SHEETS.DISTRIBUTORS_URL);
        } catch (e) { return []; }
    },

    generateDistributorHTML(distributor, isSedePrincipal = false) {
        const { logo, sede, departamento, direccion, horarios, nombre_distribuidor, nombre_persona } = distributor;
        const whatsapps = [distributor.whatsapp_1, distributor.whatsapp_2, distributor.whatsapp_3, distributor.whatsapp_4].filter(w => w).map(String);
        const moviles = [distributor.movil_1, distributor.movil_2].filter(m => m).map(String);
        const fijos = [distributor.telefono_fijo_1, distributor.telefono_fijo_2].filter(f => f).map(String);

        const contactButtons = `
            <div class="flex flex-col md:flex-row flex-wrap gap-2 mt-4">
                ${whatsapps.map(wa => `<a href="https://wa.me/${Formatters.whatsapp(wa)}" target="_blank" class="dist-btn-whatsapp"><i data-lucide="message-circle" class="w-4 h-4"></i><span>${Formatters.phoneDisplay(wa)}</span></a>`).join('')}
                ${moviles.map(m => `<div class="dist-tag-phone"><i data-lucide="smartphone" class="w-4 h-4"></i>${Formatters.phoneDisplay(m)}</div>`).join('')}
                ${fijos.map(f => `<div class="dist-tag-phone"><i data-lucide="phone" class="w-4 h-4"></i>${f}</div>`).join('')}
            </div>
        `;

        if (isSedePrincipal) {
            return `
                <div class="dist-card-principal">
                    <div class="flex items-center gap-4 mb-6">
                        <img src="img/${logo}.webp" width="64" height="64" class="w-16 h-16 object-contain" alt="${sede}">
                        <div><h3 class="page-title mb-0">${sede}</h3><p class="text-farmacia font-bold uppercase tracking-wider text-xs">${departamento}</p></div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div class="space-y-4">
                            ${direccion ? `<p class="flex items-start gap-3"><i data-lucide="map-pin" class="text-farmacia mt-1 w-5 h-5"></i><span class="font-medium text-slate-700">${direccion}</span></p>` : ''}
                            ${horarios ? `<p class="flex items-start gap-3"><i data-lucide="clock" class="text-farmacia mt-1 w-5 h-5"></i><span class="text-slate-600">${horarios.replace(/\n/g, '<br>')}</span></p>` : ''}
                        </div>
                        <div><p class="text-xs font-black text-slate-400 uppercase mb-3">Contacto Directo:</p>${contactButtons}</div>
                    </div>
                </div>`;
        }
        return `
            <div class="dist-card">
                <div class="dist-card-header"><img src="img/${logo}.webp" width="40" height="40" class="w-10 h-10 object-contain" alt="${sede}"><h4 class="subsection-title mb-0">${sede}</h4></div>
                <div class="p-6">
                    ${nombre_distribuidor ? `<p class="font-bold text-slate-700 mb-2">${nombre_distribuidor}</p>` : ''}
                    ${nombre_persona ? `<p class="text-sm text-slate-600 mb-2">${nombre_persona}</p>` : ''}
                    <div class="space-y-2 text-sm text-slate-600 mb-3">
                        <p class="flex items-center gap-2"><i data-lucide="map" class="w-4 h-4 text-slate-400"></i>${departamento}</p>
                        ${direccion ? `<p class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>${direccion}</p>` : ''}
                    </div>
                    ${contactButtons}
                </div>
            </div>`;
    },

    async renderDistributors() {
        const distributors = await this.loadDistributors();
        if (distributors.length === 0) return;
        const sedePrincipalContainer = DOM_CACHE.sedePrincipalContainer;
        const distributorsGrid = DOM_CACHE.distributorsGrid;
        if (!sedePrincipalContainer || !distributorsGrid) return;

        sedePrincipalContainer.innerHTML = this.generateDistributorHTML(distributors[0], true);
        distributorsGrid.innerHTML = distributors.slice(1).filter(d => d.logo && d.sede).map(d => this.generateDistributorHTML(d, false)).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// 10. UTILIDADES DE NAVEGACIÓN
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id], div[id][class*="scroll-mt-"]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    const parentNav = activeLink.closest('nav');
                    if (parentNav && parentNav.classList.contains('ml-4')) {
                        document.querySelectorAll('nav.ml-4').forEach(accordion => {
                            const chevron = accordion.previousElementSibling?.querySelector('[data-lucide="chevron-down"]');
                            if (accordion === parentNav) {
                                accordion.classList.remove('hidden');
                                if (chevron) chevron.style.transform = 'rotate(180deg)';
                            } else {
                                accordion.classList.add('hidden');
                                if (chevron) chevron.style.transform = '';
                            }
                        });
                    } else {
                        document.querySelectorAll('nav.ml-4').forEach(acc => {
                            acc.classList.add('hidden');
                            const chev = acc.previousElementSibling?.querySelector('[data-lucide="chevron-down"]');
                            if (chev) chev.style.transform = '';
                        });
                    }
                }
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => observer.observe(s));
}

// 11. INICIALIZACIÓN
window.UIHandlers = UIHandlers;
document.addEventListener('DOMContentLoaded', () => {
    DOM_CACHE.init();
    UIHandlers.init();
    UIHandlers.showPrescriptionBanner();
    highlightActiveSection();

    if (window.location.pathname.includes('contacto.html')) {
        VideoService.updateVideo();
        DistributorsService.renderDistributors();
    }
});