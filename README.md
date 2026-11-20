# Simulador de Factura Electrónica (DTE) - Ministerio de Hacienda de El Salvador
### Listo para GitHub Pages (100% HTML, CSS y JavaScript)

Esta es una réplica visual y funcional exacta del portal oficial de **Consulta Pública de Documentos Tributarios Electrónicos (DTE)** del Ministerio de Hacienda de El Salvador (`admin.factura.gob.sv/consultaPublica`), desarrollada con tecnologías web estándar (**HTML5, CSS3 y JavaScript moderno**), sin PHP ni dependencias de servidor.

Está diseñada específicamente para alojarse **gratis 24/7 en GitHub Pages**, permitiendo que cualquier persona que escanee el código QR desde su teléfono móvil (con datos móviles o Wi-Fi) pueda consultar la factura en cualquier momento.

---

## 📁 Archivos del Proyecto

| Archivo | Descripción |
|---|---|
| `index.html` | Página principal de consulta DTE. Renderiza con fidelidad 1:1 el diseño oficial. |
| `404.html` | Manejador de rutas para GitHub Pages (permite que rutas como `/consultaPublica` redirijan automáticamente al `index.html` con todos sus parámetros). |
| `assets/js/app.js` | Lógica en JavaScript que extrae los parámetros de la URL, autocalcula el 13% de IVA y actualiza los campos dinámicamente. |
| `assets/css/` | Estilos con Bootstrap, SB Admin y personalizaciones para el diseño exacto. |
| `assets/img/` | Logotipos oficiales vectoriales SVG (`LogoHacienda.svg`, `LogoGOES.svg`, `icono-factura-azul.svg`, `listo.png`). |
| `assets/vendor/` | Fuentes e iconos FontAwesome locales. |

---

## 🚀 Cómo publicarlo en GitHub Pages en 3 pasos

1. **Crear repositorio en GitHub:**
   - Entra a [github.com/new](https://github.com/new) y crea un repositorio (ejemplo: `factura-electronica`).

2. **Subir los archivos:**
   - Sube todos los archivos y carpetas de este proyecto a la rama principal (`main`).

3. **Activar GitHub Pages:**
   - Ve a **Settings** (Configuración del repositorio) -> **Pages**.
   - En **Branch**, selecciona `main` y la carpeta `/ (root)`.
   - Haz clic en **Save**.

En unos segundos tendrás tu enlace público mundial con HTTPS gratis:  
`https://TU_USUARIO.github.io/factura-electronica/`

---

## 📲 ¿Cómo conectar este sitio a tu sistema o ticket QR?

Tu sistema de ventas, tienda web o software de facturación solo debe generar la URL pasando los parámetros que desees en la consulta:

### 1. Enlace para tu código QR impreso:
```text
https://TU_USUARIO.github.io/factura-electronica/?monto=25.50&codGen=F6D2C3D7-47BF-41FB-8A2F-777E76A316A1&tipoDte=FACTURA
```

### 2. Generar el enlace desde JavaScript:
```javascript
const baseUrl = "https://TU_USUARIO.github.io/factura-electronica/";
const urlFactura = baseUrl + "?" + new URLSearchParams({
    monto: 15.00,
    codGen: "F6D2C3D7-47BF-41FB-8A2F-777E76A316A1",
    numeroControl: "DTE-01-M001P003-000000000012940",
    tipoDte: "FACTURA"
}).toString();

console.log(urlFactura);
```

### 3. Generar el enlace desde PHP (si tu otro sitio está en PHP):
```php
<?php
$baseUrl = "https://TU_USUARIO.github.io/factura-electronica/?";
$urlFactura = $baseUrl . http_build_query([
    'monto' => 25.50,
    'codGen' => 'F6D2C3D7-47BF-41FB-8A2F-777E76A316A1',
    'tipoDte' => 'FACTURA',
    'fechaEmi' => date('Y-m-d H:i:s')
]);

echo '<a href="' . htmlspecialchars($urlFactura) . '" target="_blank">Ver Factura Electrónica</a>';
?>
```

> **Cálculo automático de IVA:** Si solo envías `monto`, el script en JavaScript calcula automáticamente el **13% de IVA** salvadoreño incluido (`monto / 1.13 * 0.13`).

---

## 📋 Parámetros soportados en la URL

| Parámetro | Parámetros alternativos | Descripción | Valor por defecto |
|---|---|---|---|
| `monto` | `montoTotal`, `total` | Monto total de la venta | `$9.00` |
| `iva` | `iva_operaciones` | Monto de IVA | Calculado al 13% incluido |
| `tipoDte` | `tipo_dte`, `tipo` | Tipo de DTE (`FACTURA`, `COMPROBANTE DE CRÉDITO FISCAL`, etc.) | `FACTURA` |
| `codGen` | `codigo_generacion` | UUID de 36 caracteres del DTE | `F6D2C3D7-47BF-41FB-8A2F-777E76A316A1` |
| `numeroControl`| `numero_control` | Número de control DGII | `DTE-01-M001P003-000000000012935` |
| `sello` | `selloVal`, `sello_recepcion`| Sello de recepción oficial (40 caracteres) | `2026B612F466D7C8493F8B596D97F56ADF1FJWDU` |
| `fechaEmi` | `fecha_generacion` | Fecha y hora de generación | `2026-11-19 12:42:09` |
| `estadoDoc` | `estado_dte` | Estado del documento | `Transmitido Satisfactoriamente` |
| `descripcion` | `descripcion_dte` | Detalle del estado | `DTE transmitido y registrado satisfactoriamente en la DGII.` |
| `clean` | `prod` | Oculta el botón flotante del asistente de pruebas | Inactivo por defecto |
