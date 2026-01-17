# 📋 INFORME EJECUTIVO - PÁGINA DE CONTACTO
## Mundo Homeopático

---

**Fecha de creación:** 2026-01-16  
**Propósito:** Documento de referencia para mantener contexto general sobre la estructura y funcionamiento de `contacto.html`

---

## 📌 RESUMEN EJECUTIVO

La página de contacto (`contacto.html`) es una página independiente del sitio web de Mundo Homeopático que proporciona información de contacto, distribuidores autorizados y preguntas frecuentes. Está diseñada con un enfoque responsive y moderno, utilizando Tailwind CSS para estilos y JavaScript vanilla para interactividad.

---

## 🏗️ ARQUITECTURA DEL ARCHIVO

### **Estructura HTML** (`contacto.html` - 491 líneas)

```
contacto.html
├── HEAD
│   ├── Meta tags (charset, viewport)
│   ├── Tailwind CSS (CDN)
│   ├── Configuración de colores personalizados
│   ├── Google Fonts (Inter)
│   ├── Lucide Icons
│   └── styles.css (enlazado)
│
├── HEADER (Líneas 28-62)
│   ├── Panel izquierdo: Botón "Volver al Catálogo"
│   └── Panel derecho: Logo + Botón "Lista de Precios"
│
├── MAIN (Líneas 64-373)
│   ├── Video Corporativo (YouTube con lazy loading)
│   ├── Título: "Puntos de Distribución"
│   ├── Sede Principal (Medellín)
│   │   ├── Dirección
│   │   ├── Horarios
│   │   └── 4 números de WhatsApp
│   ├── Distribuidores Autorizados (Grid 2 columnas)
│   │   ├── Costa Atlántica
│   │   ├── Eje Cafetero
│   │   ├── Montería
│   │   └── Norte de Santander
│   ├── Sección FAQ (Preguntas Frecuentes)
│   │   └── Carga dinámica desde Google Sheets
│   └── Link "Volver a Inicio"
│
└── SCRIPTS (Líneas 375-488)
    ├── main.js (enlazado)
    ├── Inicialización de Lucide Icons
    ├── loadYouTubeVideo() - Carga video al hacer clic
    ├── loadFAQFromGoogleSheets() - Carga FAQs dinámicas
    ├── toggleFaq() - Acordeón de FAQs
    └── toggleAccordion() - Acordeón de distribuidores (móvil)
```

---

## 🎨 ESTILOS CSS VINCULADOS

### **Archivo:** `css/styles.css` (459 líneas)

#### **Estilos específicos para contacto.html:**

| Selector | Líneas | Propósito |
|----------|--------|-----------|
| `.accordion-content` | 94-103 | Acordeones de distribuidores en móvil |
| `.distributor-card` | 116-125 | Efecto hover en tarjetas de distribuidores |
| `.max-w-3xl` | 177-180 | Ancho máximo para video (768px) |
| `.max-w-6xl` | 183-186 | Ancho máximo para sedes (1152px) |
| `.max-w-2xl` | 189-192 | Ancho máximo para FAQ (672px) |
| Media queries | 223-420 | Responsive design completo |

#### **Colores personalizados:**
```css
--color-farmacia: #10b981  /* Verde esmeralda */
--color-publico: #2563eb   /* Azul */
```

#### **Tipografía:**
```css
--font-base: 'Inter', system-ui, -apple-system, sans-serif
```

---

## ⚙️ FUNCIONALIDAD JAVASCRIPT

### **Archivo:** `js/main.js` (391 líneas)

#### **Funciones utilizadas en contacto.html:**

| Función | Líneas | Descripción |
|---------|--------|-------------|
| `lucide.createIcons()` | 6-8 | Inicializa iconos Lucide en toda la página |
| `toggleAccordion(button)` | 272-277 | Abre/cierra acordeones de distribuidores (móvil) |
| `toggleFaq(button)` | 283-303 | Abre/cierra FAQs (solo una abierta a la vez) |

#### **Funciones inline (dentro de contacto.html):**

| Función | Líneas HTML | Descripción |
|---------|-------------|-------------|
| `loadYouTubeVideo(element)` | 378-393 | Carga iframe de YouTube al hacer clic en la miniatura |
| `loadFAQFromGoogleSheets()` | 398-436 | Carga preguntas frecuentes desde Google Sheets CSV |

---

## 📊 INTEGRACIÓN CON GOOGLE SHEETS

### **FAQ (Preguntas Frecuentes)**

**URL del CSV:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vRuBTyqnC5oSy0leK7NCf-Bnde5BFfv4URIZckAI78TenSLVx-09IKjTEvO67SPK8DAsc8fdwVABGQC/pub?gid=1434563192&single=true&output=csv
```

**Estructura esperada:**
- Columna 1: Pregunta
- Columna 2: Respuesta

**Comportamiento:**
- Se carga automáticamente al cargar la página
- Reemplaza las 5 FAQs estáticas por defecto
- Muestra máximo 10 resultados en el dropdown de búsqueda

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints:**

| Dispositivo | Ancho | Cambios principales |
|-------------|-------|---------------------|
| **Desktop** | > 768px | Grid 2 columnas, acordeones siempre abiertos |
| **Tablet** | 768px | Grid 1 columna, acordeones con toggle |
| **Móvil** | < 480px | Solo iconos en botones, logo pequeño |

### **Características responsive:**

✅ Header adaptable con logo escalable  
✅ Grid de distribuidores: 2 columnas → 1 columna  
✅ Acordeones solo activos en móvil  
✅ Video con aspect-ratio responsive  
✅ Botones de WhatsApp apilados en móvil  
✅ FAQ compacto en móvil  

---

## 🌐 RECURSOS EXTERNOS

### **CDN y APIs:**

| Recurso | URL | Propósito |
|---------|-----|-----------|
| Tailwind CSS | `https://cdn.tailwindcss.com` | Framework CSS |
| Google Fonts | `fonts.googleapis.com` | Fuente Inter |
| Lucide Icons | `https://unpkg.com/lucide@latest` | Sistema de iconos |
| YouTube | `youtube.com/embed/` | Video corporativo |
| Google Sheets | `docs.google.com/spreadsheets/` | FAQs dinámicas |

---

## 📞 INFORMACIÓN DE CONTACTO

### **Sede Principal (Medellín)**

**Dirección:** Carrera 49 N° 64-06  
**Horario:**  
- L-V: 8am-12pm / 2pm-6pm  
- Sábados: 8am-12pm

**WhatsApp:**
- 318 289 9126
- 317 668 7050
- 301 747 4675
- 315 715 0929

### **Distribuidores Autorizados**

| Región | Contacto | WhatsApp |
|--------|----------|----------|
| **Costa Atlántica** | Calle 80 N° 49 C 15, Oficina 301 | 321 536 5720 |
| **Eje Cafetero** | Carlos Ramirez | 318 716 6230 |
| **Montería** | Eco Natural - Martha Elena Rivas | 314 553 2080 |
| **Norte de Santander** | Jhon Jairo Vallejo Rolón | 313 301 9777 |

---

## 🎥 VIDEO CORPORATIVO

**ID de YouTube:** `ZCkVmauoVVo`  
**URL completa:** `https://www.youtube.com/watch?v=ZCkVmauoVVo`

**Características:**
- Lazy loading con miniatura de YouTube
- Botón de play personalizado (verde farmacia)
- Se carga solo al hacer clic (optimización de rendimiento)
- Autoplay activado al cargar

---

## 🔧 FUNCIONALIDADES CLAVE

### **1. Acordeones de Distribuidores (Móvil)**
- Solo activos en pantallas < 768px
- Animación suave con `max-height` transition
- Icono chevron rota 180° al abrir

### **2. FAQ Dinámicas**
- Carga desde Google Sheets al iniciar
- Solo una FAQ abierta a la vez (comportamiento accordion)
- Icono chevron animado
- Fallback a 5 FAQs estáticas si falla la carga

### **3. Video con Lazy Loading**
- Miniatura de alta resolución de YouTube
- Overlay con botón de play
- Iframe se carga solo al hacer clic
- Ahorro de ancho de banda

---

## 🔗 NAVEGACIÓN

### **Enlaces internos:**

| Elemento | Destino | Ubicación |
|----------|---------|-----------|
| "Volver al Catálogo" | `index.html` | Header (izquierda) |
| "Lista de Precios" | `index.html` | Header (derecha) |
| Logo | `index.html` | Header (centro) |
| "Volver a Inicio" | `index.html` | Footer del main |

---

## 📝 NOTAS TÉCNICAS

### **Optimizaciones implementadas:**

✅ **Lazy loading** en video de YouTube  
✅ **Carga dinámica** de FAQs desde Google Sheets  
✅ **Responsive design** mobile-first  
✅ **Iconos SVG** con Lucide (ligeros y escalables)  
✅ **Transiciones CSS** suaves en acordeones  
✅ **Scrollbar personalizado** en sidebar  

### **Dependencias:**

- Tailwind CSS (CDN)
- Lucide Icons (CDN)
- Google Fonts - Inter (CDN)
- `css/styles.css` (local)
- `js/main.js` (local)
- `img/logo-mundo-homeopatico.webp` (local)

---

## 🎯 PRÓXIMAS MEJORAS SUGERIDAS

### **Posibles optimizaciones:**

1. **SEO:**
   - Agregar meta description
   - Implementar schema.org para LocalBusiness
   - Agregar Open Graph tags

2. **Performance:**
   - Minificar CSS y JS
   - Implementar service worker para cache
   - Optimizar imágenes con WebP

3. **Accesibilidad:**
   - Agregar aria-labels a botones
   - Mejorar contraste de colores
   - Implementar navegación por teclado

4. **Funcionalidad:**
   - Formulario de contacto funcional
   - Mapa interactivo de Google Maps
   - Chat en vivo con WhatsApp Business

---

## 📊 MÉTRICAS DEL ARCHIVO

| Métrica | Valor |
|---------|-------|
| **Líneas de código HTML** | 491 |
| **Tamaño del archivo** | ~36 KB |
| **Número de secciones** | 5 principales |
| **Distribuidores listados** | 4 regiones |
| **Números de WhatsApp** | 8 totales |
| **FAQs por defecto** | 5 (dinámicas desde Sheets) |
| **Dependencias externas** | 5 CDNs |

---

## 🔐 CONFIGURACIÓN DE COLORES

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                farmacia: '#10b981',  // Verde esmeralda
                publico: '#2563eb'    // Azul
            }
        }
    }
}
```

---

## 📂 ESTRUCTURA DE ARCHIVOS RELACIONADOS

```
proyecto reestructuracion/
├── contacto.html          ← Archivo principal
├── index.html             ← Página principal (enlazada)
├── css/
│   └── styles.css         ← Estilos compartidos
├── js/
│   └── main.js            ← JavaScript compartido
└── img/
    └── logo-mundo-homeopatico.webp  ← Logo
```

---

## ✅ CHECKLIST DE MANTENIMIENTO

### **Antes de modificar contacto.html:**

- [ ] Revisar este informe ejecutivo
- [ ] Verificar dependencias en `styles.css`
- [ ] Verificar funciones en `main.js`
- [ ] Probar en móvil, tablet y desktop
- [ ] Verificar carga de FAQs desde Google Sheets
- [ ] Validar enlaces a `index.html`
- [ ] Comprobar funcionamiento de acordeones
- [ ] Verificar carga de video de YouTube

---

## 🎨 PALETA DE COLORES

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Farmacia** | `#10b981` | Botones principales, bordes, iconos |
| **Público** | `#2563eb` | Precios públicos, enlaces secundarios |
| **Slate 50** | `#f8fafc` | Fondo general |
| **Slate 100** | `#f1f5f9` | Fondos de secciones |
| **Slate 700** | `#334155` | Textos principales |
| **Slate 500** | `#64748b` | Textos secundarios |
| **Verde WhatsApp** | `#25D366` | Botones de WhatsApp |

---

## 📱 COMPATIBILIDAD

### **Navegadores soportados:**

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Opera 76+  

### **Dispositivos probados:**

✅ Desktop (1920x1080)  
✅ Laptop (1366x768)  
✅ Tablet (768x1024)  
✅ Móvil (375x667)  

---

## 🚀 ESTADO ACTUAL

**Versión:** 1.0  
**Última actualización:** 2026-01-16  
**Estado:** ✅ Producción  
**Bugs conocidos:** Ninguno  

---

## 📞 SOPORTE

Para modificaciones o consultas sobre este archivo, contactar al equipo de desarrollo de Mundo Homeopático.

---

**Fin del Informe Ejecutivo**
