MuebleCasa — PROTOTIPO DE ALTA FIDELIDAD APE 04
CASO 11: Muebles para vivienda

DESCRIPCIÓN
Prototipo web y PWA instalable desarrollado con HTML semántico, CSS propio, Bootstrap 5.3 y JavaScript.
Prioriza dimensiones, material, acabado y espacio disponible para personas que equipan hogares.

REQUISITOS Y EJECUCIÓN LOCAL
1. Abrir la carpeta 11_MuebleCasa en Visual Studio Code.
2. Iniciar un servidor local (necesario para Service Worker / PWA):
   - Con Python: python -m http.server 8000
   - O con la extensión Live Server de VS Code.
3. Abrir en el navegador: http://localhost:8000

VISTAS INCLUIDAS
- Acceso (#acceso): inicio de sesión y registro simulados con validación y aviso explícito.
- Inicio (#inicio): presentación orientada al hogar y accesos directos a Productos, Venta e Historial.
- Productos (#productos): catálogo con búsqueda, filtros por material/acabado y especificaciones visibles.
- Detalle de medidas (#detalle): ficha ampliada de dimensiones y guía de espacio recomendado.
- Venta (#venta): gestión de carrito con cantidades enteras >= 1, prevención de venta vacía/duplicada y confirmación simulada.
- Historial (#historial): consulta detallada en localStorage (ID, fecha, artículos, cantidades, especificaciones y total).

LIMITACIONES DE SIMULACIÓN
- No incluye backend, base de datos remota, autenticación segura ni pasarela de pagos reales.
- El funcionamiento offline de la PWA cachea los recursos estáticos locales del prototipo.
