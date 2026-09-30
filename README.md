# FORMA | Muebles y objetos

Segunda aplicación de portafolio de **Miguel Angel Ramirez Francisco**. Una tienda de demostración que conecta catálogo, comparación, favoritos, bolsa, pedidos e inventario editable.

## Abrir en tu computadora

1. Haz clic derecho en `forma-github.zip` y selecciona **Extraer todo**.
2. Abre la carpeta extraída `forma`.
3. Abre `index.html` con Edge, Chrome o Firefox.

**No abras el HTML desde dentro del ZIP.** Necesita las carpetas que lo acompañan. No requiere instalación, compilación ni servidor. También funciona con Live Server o cualquier servidor estático. Solo la consulta REST necesita Internet.

## Recorridos

### Colección

- Diez productos con fotografías y galerías locales.
- Búsqueda sin distinción de acentos, filtros combinados por espacio, precio y disponibilidad.
- Ordenación por precio, nombre y destacados.
- Filtros conservados en la URL para recargar o compartir una selección.
- Favoritos persistentes y comparación de hasta tres productos.
- Detalle de producto con galería y existencias.

### Bolsa y pedidos

- Cantidades limitadas por existencias, eliminación y persistencia de la bolsa.
- Código `FORMA10`: 10% de descuento sobre el subtotal.
- Envío simulado: $199 MXN; gratis a partir de $5,000 MXN de subtotal antes del descuento.
- Importes calculados en centavos enteros y descuento redondeado una sola vez.
- Formulario validado y confirmación de pedido de demostración.
- La confirmación descuenta existencias, registra el pedido y vacía la bolsa.
- Los datos de nombre, correo y dirección del formulario no se guardan ni se envían. Usa datos ficticios.

### Estudio

Abre el icono de ajustes del encabezado o **Administrar catálogo** en el pie de página.

- Crear, editar y eliminar productos locales, con fotografías del catálogo incluido.
- Indicadores de productos, unidades, stock bajo y ventas simuladas.
- Historial de actividad.
- Consulta REST a DummyJSON para obtener existencias: requiere confirmación explícita en **Aplicar disponibilidad** antes de modificar el inventario.
- Carga, tiempo límite, validación de respuesta, error y reintento.
- El historial conserva nombre y precio originales aunque después se edite o elimine el producto.

## Avance respecto a Órbita

| Área | Órbita | FORMA |
| --- | --- | --- |
| Organización | Lógica de interfaz en un archivo | Separación de datos, dominio, estado, API, vistas y eventos |
| Estado | Tareas locales | Catálogo, favoritos, bolsa y pedidos conectados |
| REST | Lectura de contactos | Consulta y aplicación explícita de inventario externo |
| Navegación | Vistas principales | Rutas de catálogo, producto y pedido; filtros en URL |
| Validación | Formularios básicos | Existencias, límites, datos persistidos y cálculos monetarios |
| Diseño | Panel operativo | Catálogo fotográfico, galerías, comparador y bolsa lateral |
| Calidad | Pruebas de recorrido | Pruebas unitarias de dominio y recorridos de compra e inventario |

## Estructura

```text
forma/
  index.html
  package.json
  README.md
  css/
    fonts.css
    styles.css
  js/
    catalog.js     # Catálogo de demostración incluido
    core.js        # Validación, filtros y cálculos sin DOM
    store.js       # Estado, transacciones locales y persistencia
    api.js         # Consulta REST, cancelación y validación
    views.js       # Plantillas y escape de texto
    app.js         # Rutas, eventos y coordinación de vistas
  assets/
    products/      # Fotografías locales por producto
    fonts/         # Tipografías y licencias
    vendor/        # Bootstrap y Lucide con licencias
  docs/
    caso-de-estudio.html
    PRUEBAS.md
    FUENTES.md
  tests/
    core.test.cjs
    store.test.cjs
```

Se usan scripts encapsulados con interfaces explícitas para que el proyecto funcione por doble clic, incluyendo bajo `file://`. No requiere un bundler ni módulos ES que obliguen a iniciar un servidor. `core.js` también se puede importar desde Node para probarlo.

## Pruebas

Con Node.js instalado:

```bash
node --test tests/*.test.cjs
```

O ejecuta `npm test`. No hace falta `npm install` para esas pruebas. Los recorridos manuales y las verificaciones realizadas están en `docs/PRUEBAS.md`.

## GitHub y GitHub Pages

Sube **el contenido de la carpeta**, con `index.html` en la raíz del repositorio. No subas solo el ZIP. Desde una terminal dentro de `forma`:

```bash
git init
git add .
git commit -m "Agregar FORMA: catalogo e inventario"
git branch -M main
git remote add origin https://github.com/miguelramirez-dev/forma-frontend.git
git push -u origin main
```

Crea primero ese repositorio vacío en tu cuenta. No se ha creado ni publicado un repositorio automáticamente. Para alojarlo, configura GitHub Pages con la rama `main` y la carpeta raíz. Todas las rutas de archivos son relativas.

## Alcance y honestidad del proyecto

Es un prototipo de frontend, no una tienda real. No hay pagos, autenticación, backend propio, sincronización multiusuario ni envíos. El panel Estudio no está protegido y existe para demostrar las operaciones de inventario. La validación del navegador no reemplaza la validación de un servidor en un producto real.

Datos guardados solo en este navegador: inventario, favoritos, bolsa y hasta 100 pedidos. Borrar los datos del sitio borra esa información. Los filtros están en la URL; el comparador y el cupón duran la sesión. El código usa escape de texto para los datos dinámicos y valida la estructura del catálogo local.

Incluye navegación por teclado, foco visible, etiquetas, mensajes de estado, modales nativos y respeto a movimiento reducido. No constituye una certificación WCAG. La integración WebMCP de lectura es opcional y solo se registra en navegadores compatibles.

Las imágenes provienen del catálogo de pruebas de DummyJSON. Los nombres en español, descripciones y precios en MXN se adaptaron con fines demostrativos; no representan ofertas comerciales ni una conversión vigente. Las especificaciones técnicas de los muebles no se verificaron. Consulta `docs/FUENTES.md` antes de reutilizarlas comercialmente.


Autor del portafolio: [Miguel Angel Ramirez Francisco](https://github.com/miguelramirez-dev).
