# Verificación de FORMA

## Automatizada

- Dominio: importes en centavos, descuento, umbral de envío, cantidades inválidas, reparación del estado, búsqueda con acentos y validación de productos.
- Navegador (Edge con Playwright): imágenes locales, filtros en URL, favoritos, comparación, galería, bolsa, cupón, pedido, ausencia de datos personales en el almacenamiento, CRUD de inventario, REST simulado con éxito/error, recarga y anchos 390/768/1440.
- Revisión visual de capturas de escritorio y móvil.
- Descarga real de los dos endpoints DummyJSON al preparar los datos y las imágenes. Las pruebas de error y aplicación de stock se ejecutan con respuestas controladas para ser reproducibles.

## Recorrido manual

1. Extraer la carpeta completa y abrir `index.html`.
2. Filtrar por nombre, categoría y precio. Probar una búsqueda sin resultados y restablecer.
3. Seleccionar dos o tres productos, compararlos y cerrar con Escape.
4. Abrir un producto, cambiar de imagen y guardar en favoritos.
5. Añadir una pieza a la bolsa, aumentar y reducir cantidades, y probar el límite de stock.
6. Aplicar un cupón inválido y después `FORMA10`.
7. Completar el pedido con datos ficticios. Comprobar el historial y el inventario.
8. En Estudio, crear, editar y eliminar un producto. Cancelar primero la confirmación de eliminación.
9. Consultar el proveedor, revisar el mensaje y aplicar las existencias. Desconectar la red y repetir para ver el error.
10. Recargar y comprobar bolsa, favoritos, productos y pedidos.
11. Navegar con Tab y verificar que los controles tienen foco visible.

## Límites de validación

No se ha realizado una auditoría WCAG completa ni una matriz de todos los navegadores. WebMCP no se pudo verificar en un navegador con implementación nativa; no es necesario para usar la aplicación. La app de archivos locales y GitHub Pages no ofrece transacciones entre varios usuarios.
