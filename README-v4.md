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
- **Brief:** formulario guiado. Sin backend configurado, los borradores permanecen en el navegador y se pueden exportar para entregarlos por el canal indicado por coordinación.
- **Estudio creativo:** presentación de 10 diapositivas con ideas de comunicación.
- **Referencias:** 24 candidatas y seis conceptos visuales para evaluación. Son referencias de inspiración, no avales ni resultados verificados.
- **Personalizar:** ajustes locales del sitio. Los datos comerciales solo se incorporan al catálogo cuando se marcan como confirmados.
- **Tienda demo:** prototipo legado aislado, señalado como demostración con datos ficticios.

La configuración de V4 está sin activar para recepción central: el cliente no declara un backend operativo en la publicación actual. La organización ya preparó el proyecto y dispone de su clave pública, pero debe ejecutar y validar la migración SQL, crear las cuentas autorizadas de coordinación y terminar la configuración de acceso/red antes de generar una publicación con la URL y clave públicas. La contraseña de administración de la base de datos no forma parte del sitio ni del paquete. No incluyas claves privadas, `service_role`, archivos `supabase-config.pending.json`, respuestas de briefs ni registros de coordinación en una publicación.

La migración y el procedimiento se documentan en `frontend-prueba/v4/backend/README.md` dentro del repositorio. Estos pasos no se ejecutan al generar el paquete estático.

## Privacidad de la distribución

`package-v4.py` usa una lista cerrada de archivos de publicación y revisa el seed público: exige 66 filas con solo `id`, `local`, `rubro`, `category` y `name`, sin nombres comerciales en la build base. Rechaza un seed que declare Supabase configurado y no empaqueta JSON de configuración, borradores, trazas ni capturas de QA. El padrón interno no se abre ni se copia durante este proceso.
