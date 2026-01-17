/* ============================================
   MUNDO HOMEOPÁTICO - JAVASCRIPT COMPARTIDO
   ============================================ */

// Inicializar iconos Lucide
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();
});

// ============================================
// FUNCIONES DE BÚSQUEDA (página principal)
// ============================================

function filterItems() {
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

    // Mostrar/ocultar botón de limpiar
    if (query === "") {
        clearButton.classList.add('hidden');
    } else {
        clearButton.classList.remove('hidden');
        lucide.createIcons();
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

    // Mostrar/ocultar dropdown con resultados
    if (query === "") {
        dropdown.classList.add('hidden');
        feedback.classList.add('opacity-0', 'hidden');
    } else if (visibleCount === 0) {
        dropdown.classList.add('hidden');
        feedback.classList.remove('opacity-0', 'hidden');
        feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700';
        feedbackText.innerHTML = '<strong>No se encontraron resultados</strong> para "' + query + '"';
        lucide.createIcons();
    } else {
        feedback.classList.remove('opacity-0', 'hidden');
        feedback.querySelector('div').className = 'flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-farmacia';
        feedbackText.innerHTML = 'Se ' + (visibleCount === 1 ? 'encontró <strong>1 resultado</strong>' : 'encontraron <strong>' + visibleCount + ' resultados</strong>');
        lucide.createIcons();

        // Poblar dropdown
        dropdownResults.innerHTML = '';
        const maxResults = Math.min(matchedRows.length, 10);

        for (let i = 0; i < maxResults; i++) {
            const row = matchedRows[i];
            const productName = row.querySelector('td:first-child')?.innerText || 'Producto';
            const section = row.closest('.section-group');
            const sectionTitle = section?.querySelector('h3')?.innerText || 'Sección';

            const resultItem = document.createElement('div');
            resultItem.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors';
            resultItem.innerHTML = `
                <div class="font-medium text-slate-800 text-sm">${productName}</div>
                <div class="text-xs text-slate-500 mt-0.5">${sectionTitle}</div>
            `;

            resultItem.onclick = function () {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.classList.add('bg-emerald-50');
                setTimeout(() => row.classList.remove('bg-emerald-50'), 2000);
                dropdown.classList.add('hidden');
            };

            dropdownResults.appendChild(resultItem);
        }

        if (visibleCount > 10) {
            const moreResults = document.createElement('div');
            moreResults.className = 'px-4 py-3 text-xs text-slate-400 text-center border-t border-slate-100';
            moreResults.innerHTML = `Y ${visibleCount - 10} resultados más...`;
            dropdownResults.appendChild(moreResults);
        }

        dropdown.classList.remove('hidden');
    }
}

function clearSearchInput() {
    const searchInput = document.getElementById('mainSearch');
    if (searchInput) {
        searchInput.value = '';
        filterItems();
        searchInput.focus();
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function (event) {
    const searchContainer = document.querySelector('.relative.group');
    const dropdown = document.getElementById('searchDropdown');
    if (searchContainer && dropdown && !searchContainer.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// ============================================
// NAVEGACIÓN LATERAL (página principal)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length === 0) return;

    const navIds = Array.from(navLinks).map(link => link.getAttribute('href').substring(1));
    const allSections = navIds.map(id => document.getElementById(id)).filter(el => el !== null);

    window.addEventListener('scroll', () => {
        let current = "";
        allSections.forEach(section => {
            if (pageYOffset >= (section.offsetTop - 300)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('sidebar-active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('sidebar-active');
            }
        });
    });
});

// ============================================
// INTEGRACIÓN CON GOOGLE SHEETS
// ============================================

const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?output=csv';
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const FULL_URL = PROXY_URL + encodeURIComponent(GOOGLE_SHEETS_CSV_URL);

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    return data;
}

function formatPrice(price) {
    if (!price || price === '-') return '-';
    const numPrice = parseInt(price.replace(/\D/g, ''));
    return numPrice.toLocaleString('es-CO');
}

async function loadPricesFromGoogleSheets() {
    try {
        const response = await fetch(FULL_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        updateTables(data);
        console.log('✅ Precios cargados desde Google Sheets');
    } catch (error) {
        console.error('❌ Error al cargar precios:', error);
    }
}

function updateTables(data) {
    const tableData = {};
    data.forEach(row => {
        const tableName = row.Tabla;
        if (!tableData[tableName]) tableData[tableName] = [];
        tableData[tableName].push(row);
    });

    Object.keys(tableData).forEach(tableName => {
        updateSpecificTable(tableName, tableData[tableName]);
    });
}

function updateSpecificTable(tableName, rows) {
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

    const selector = tableSelectors[tableName];
    if (!selector) return;

    const tbody = document.querySelector(selector);
    if (!tbody) return;

    tbody.innerHTML = '';

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'item-row hover-row';

        if (tableName === 'Homeopaticos_Especiales' || tableName === 'Aceites_Esenciales') {
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold">${row.Producto}</td>
                <td class="px-6 py-4">${row.Presentacion || ''}</td>
                <td class="px-6 py-4 text-right text-farmacia professional-only">${formatPrice(row.Precio_Farmacia)}</td>
                <td class="px-6 py-4 text-right text-publico">${formatPrice(row.Precio_Publico)}</td>
            `;
        } else {
            const productText = row.Presentacion ? `${row.Producto} - ${row.Presentacion}` : row.Producto;
            tr.innerHTML = `
                <td class="px-6 py-4 font-bold">${productText}</td>
                <td class="px-6 py-4 text-right text-farmacia professional-only">${formatPrice(row.Precio_Farmacia)}</td>
                <td class="px-6 py-4 text-right text-publico">${formatPrice(row.Precio_Publico)}</td>
            `;
        }
        tbody.appendChild(tr);
    });
}

// Cargar datos al iniciar
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('catalogBody')) {
        loadPricesFromGoogleSheets();
    }
});

// ============================================
// ACORDEÓN PARA DISTRIBUIDORES (contacto)
// ============================================

function toggleAccordion(button) {
    const content = button.nextElementSibling.nextElementSibling || button.parentElement.querySelector('.accordion-content');
    const icon = button.querySelector('[data-lucide="chevron-down"]');
    content.classList.toggle('active');
    if (icon) icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : '';
}

// ============================================
// FAQ (contacto)
// ============================================

function toggleFaq(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('[data-lucide="chevron-down"]');
    const isHidden = content.classList.contains('hidden');

    // Cerrar todas las FAQ abiertas
    document.querySelectorAll('.faq-content').forEach(faq => {
        faq.classList.add('hidden');
    });
    document.querySelectorAll('.faq-content').forEach((faq) => {
        const btn = faq.previousElementSibling;
        const ico = btn.querySelector('[data-lucide="chevron-down"]');
        if (ico) ico.style.transform = '';
    });

    // Abrir la FAQ clickeada si estaba cerrada
    if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    }
}

// ============================================
// SISTEMA DE ACCESO PROFESIONAL
// ============================================

const PROFESSIONAL_PASSWORD = "MH2024";

// Verificar si ya está en modo profesional al cargar
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('professionalMode') === 'true') {
        document.body.classList.add('professional-mode');
    }

    // Botón de acceso profesional
    const accessBtn = document.getElementById('professionalAccessBtn');
    if (accessBtn) {
        accessBtn.addEventListener('click', showPasswordModal);
    }

    // Botón submit
    const submitBtn = document.getElementById('submitPassword');
    if (submitBtn) {
        submitBtn.addEventListener('click', validatePassword);
    }

    // Botón cancelar
    const cancelBtn = document.getElementById('cancelPassword');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePasswordModal);
    }

    // Enter en el input
    const passwordInput = document.getElementById('professionalPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validatePassword();
            }
        });
    }
});

function showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    const errorMsg = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('professionalPassword');

    if (modal) {
        modal.classList.remove('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');
        if (passwordInput) {
            passwordInput.value = '';
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function validatePassword() {
    const input = document.getElementById('professionalPassword');
    const errorMsg = document.getElementById('errorMessage');

    if (!input) return;

    if (input.value === PROFESSIONAL_PASSWORD) {
        document.body.classList.add('professional-mode');
        localStorage.setItem('professionalMode', 'true');
        closePasswordModal();

        // Reinicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } else {
        if (errorMsg) {
            errorMsg.classList.remove('hidden');
        }
        input.value = '';
        input.focus();
    }
}
