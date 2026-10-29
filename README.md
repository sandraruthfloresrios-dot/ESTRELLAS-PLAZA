# Galería Estrellas Plaza

La web pública utiliza el diseño de `frontend-prueba/v3/estrellas-plaza-v3.html`, elegido por la persona propietaria. Conserva el marketplace, las vitrinas, las fichas, los favoritos y la bolsa de prueba. No incluye navegación a referencias, estudio creativo, personalización ni selector público de Owner/Emprendedor.

El padrón aporta 66 registros de rubros y TDA; se añade una ficha de fotografía y video solicitada por la persona propietaria, con nombre comercial y ubicación pendientes. No se publican nombres de responsables ni contactos privados. Los nombres mostrados son descriptores de actividad, no marcas confirmadas. Los 60 productos del catálogo son muestras ilustrativas, con precios referenciales y operaciones locales de prueba; no se procesan pagos ni pedidos comerciales.

El brief (`#brief`) permite seleccionar uno de los 66 negocios del inventario remoto. Usa la URL y la clave Publishable de Supabase, conserva borradores y solo marca recepción con comprobante del servidor. La nueva ficha audiovisual no se incorpora automáticamente al inventario remoto. Las respuestas requieren una cuenta autorizada; la cuenta de coordinación todavía está pendiente de crear/autorizar. La red de desarrollo impide verificar un envío real a Supabase.

Para reconstruir:

```sh
python3 frontend-prueba/v6/build-data.py
python3 frontend-prueba/v6/build-v6.py
node frontend-prueba/v6/verify-v6.cjs
```

La documentación de publicidad se conserva en una ubicación independiente, sin enlazarla desde la navegación de la galería. No constituye un sistema de agencia terminado ni un espacio privado autenticado. El trabajo de agencia continuará en otro chat.
