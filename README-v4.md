# Estrellas Plaza V4

V4 presenta el directorio público de Estrellas Plaza y una propuesta visual para su sitio estático. El padrón publicado contiene 66 registros identificados por `NEG-###`, con TDA y rubro; actualmente no hay nombres comerciales confirmados. No incluye nombres de personas ni datos de contacto de los comerciantes.

## Ver y generar el sitio

Abre `publicacion/index.html` para revisar la publicación local. También puedes ejecutar desde la raíz del repositorio:

```sh
python frontend-prueba/v4/build-v4.py
node frontend-prueba/v4/verify-v4.cjs
python frontend-prueba/v4/package-v4.py
```

El empaquetador prepara `frontend-prueba/v4/dist/public/` y `frontend-prueba/v4/dist/estrellas-plaza-v4-publico.zip`. La distribución contiene el HTML, el video conceptual con su ruta relativa, este README y la tienda demo separada; añade la presentación visual PDF cuando está disponible. La demo usa datos ficticios y no representa los 66 locales del directorio. El archivo HTML descargado desde Personalizar incluye imágenes y fuentes; conserva `media/belleza.mp4` junto a él para reproducir el video. `marketplace-demo.html` es un archivo separado.

## Qué incluye

- **Inicio:** identidad, categorías y acceso al directorio.
- **Directorio:** los 66 registros públicos, búsqueda por TDA/rubro y fichas. Los negocios permanecen como “Marca por confirmar” mientras no se confirme un nombre.
- **Brief:** formulario guiado con envío al proyecto Supabase de la galería. Conserva el borrador local y solo declara recepción al recibir comprobante del servidor; si falla la conexión permite reintentar o exportar.
- **Estudio creativo:** presentación de 10 diapositivas con ideas de comunicación.
- **Referencias:** 24 candidatas y seis conceptos visuales para evaluación. Son referencias de inspiración, no avales ni resultados verificados.
- **Personalizar:** ajustes locales del sitio. Los datos comerciales solo se incorporan al catálogo cuando se marcan como confirmados.
- **Tienda demo:** prototipo legado aislado, señalado como demostración con datos ficticios.

La publicación incluye únicamente la URL y la clave Publishable del proyecto Supabase autorizado. El 29 de octubre de 2026, la persona propietaria ejecutó el SQL en Supabase y confirmó mediante captura el inventario de 66 filas. La recepción extremo a extremo y el acceso de coordinación todavía requieren verificación desde un navegador con acceso a Supabase: la red del entorno de desarrollo bloquea la API con CONNECT 403. La cuenta de coordinación debe existir en Supabase Auth y estar autorizada en `admin_users`; el acceso al panel de Supabase no crea esa cuenta automáticamente. No se han creado cuentas ni probado envíos reales desde este entorno. La contraseña de base de datos y el token de administración no forman parte del sitio ni del paquete. Nunca publiques claves privadas, respuestas de briefs ni registros privados de coordinación.

La migración y el procedimiento se documentan en `frontend-prueba/v4/backend/README.md` dentro del repositorio. Estos pasos no se ejecutan al generar el paquete estático.

## Privacidad de la distribución

`package-v4.py` usa una lista cerrada de archivos de publicación y revisa el seed público: exige 66 filas con solo `id`, `local`, `rubro`, `category` y `name`, sin nombres comerciales en la build base. Cuando se activa Supabase, comprueba el dominio del proyecto autorizado y admite únicamente una clave Publishable; no empaqueta JSON de configuración, borradores, trazas ni capturas de QA. El padrón interno no se abre ni se copia durante este proceso.
