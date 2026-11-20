/**
 * Gestor de datos y parámetros para el simulador de Consulta Pública DTE
 * Ministerio de Hacienda de El Salvador - Pure JS / GitHub Pages
 */

// Valores por defecto exactos de las capturas originales
const DEFAULT_DTE = {
    estado_dte: "Transmitido Satisfactoriamente",
    descripcion_dte: "DTE transmitido y registrado satisfactoriamente en la DGII.",
    tipo_dte: "FACTURA",
    fecha_generacion: "2026-11-19 12:42:09",
    fecha_transmision: "2026-11-19 12:42:09",
    codigo_generacion: "F6D2C3D7-47BF-41FB-8A2F-777E76A316A1",
    sello_recepcion: "2026B612F466D7C8493F8B596D97F56ADF1FJWDU",
    numero_control: "DTE-01-M001P003-000000000012935",
    monto_total: "$9.00",
    iva_operaciones: "$1.04",
    iva_percibido: "$0.00",
    iva_retenido: "$0.00",
    retencion_renta: "$0.00",
    valores_no_afectos: "$0.00",
    total_operacion: "$9.00",
    documento_ajustado: "El documento no ha sido ajustado",
    evento_aplicado: "NO",
    version: "v202611120833",
    ambiente: "01"
};

/**
 * Formatear montos a formato moneda ($0.00)
 */
function formatMoney(val) {
    if (typeof val === 'string') {
        const cleaned = val.replace(/[$, ]/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
            return '$' + num.toFixed(2);
        }
        return val;
    }
    if (typeof val === 'number') {
        return '$' + val.toFixed(2);
    }
    return '$0.00';
}

/**
 * Calcular el 13% de IVA salvadoreño incluido (Factura consumidor final)
 */
function calcIva13(montoNum) {
    const base = montoNum / 1.13;
    const iva = base * 0.13;
    return Math.round(iva * 100) / 100;
}

/**
 * Generar un UUID v4 en mayúsculas (Código de Generación)
 */
function generateUUID() {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
    });
}

/**
 * Generar un Sello de Recepción oficial de 40 caracteres
 */
function generateSello() {
    const year = new Date().getFullYear().toString();
    const hex = '0123456789ABCDEF';
    let sello = year;
    for (let i = 0; i < 32; i++) {
        sello += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    sello += 'JWDU';
    return sello;
}

/**
 * Obtener los datos del DTE a partir de los parámetros URL
 */
function getDteData() {
    const urlParams = new URLSearchParams(window.location.search);
    let data = { ...DEFAULT_DTE };

    // Soporte para payload en Base64 (?d=eyJ...)
    const base64Data = urlParams.get('d');
    if (base64Data) {
        try {
            const decoded = JSON.parse(atob(base64Data));
            Object.assign(data, decoded);
        } catch (e) {
            console.warn("No se pudo decodificar el parámetro base64:", e);
        }
    }

    // Código de generación
    const codGen = urlParams.get('codGen') || urlParams.get('codigo_generacion') || urlParams.get('codigoGeneracion');
    if (codGen) data.codigo_generacion = codGen.toUpperCase().trim();

    // Sello de recepción
    const sello = urlParams.get('sello') || urlParams.get('selloVal') || urlParams.get('sello_recepcion');
    if (sello) data.sello_recepcion = sello.toUpperCase().trim();

    // Número de control
    const control = urlParams.get('numeroControl') || urlParams.get('numero_control') || urlParams.get('control');
    if (control) data.numero_control = control.trim();

    // Tipo de DTE
    const tipo = urlParams.get('tipoDte') || urlParams.get('tipo_dte') || urlParams.get('tipo');
    if (tipo) data.tipo_dte = tipo.toUpperCase().trim();

    // Estado del DTE
    const estado = urlParams.get('estadoDoc') || urlParams.get('estado_dte') || urlParams.get('estado');
    if (estado) data.estado_dte = estado.trim();

    // Descripción del estado
    const desc = urlParams.get('descripcion') || urlParams.get('descripcion_dte');
    if (desc) data.descripcion_dte = desc.trim();

    // Monto y cálculo automático de IVA
    const montoParam = urlParams.get('monto') || urlParams.get('montoTotal') || urlParams.get('monto_total') || urlParams.get('total');
    if (montoParam !== null) {
        const montoNum = parseFloat(montoParam.replace(/[$, ]/g, ''));
        if (!isNaN(montoNum)) {
            data.monto_total = formatMoney(montoNum);
            data.total_operacion = formatMoney(montoNum);

            // Si no se pasó IVA explícito, calcular 13% incluido
            const ivaParam = urlParams.get('iva') || urlParams.get('iva_operaciones');
            if (ivaParam !== null) {
                data.iva_operaciones = formatMoney(ivaParam);
            } else {
                data.iva_operaciones = formatMoney(calcIva13(montoNum));
            }
        }
    } else if (urlParams.get('iva') || urlParams.get('iva_operaciones')) {
        data.iva_operaciones = formatMoney(urlParams.get('iva') || urlParams.get('iva_operaciones'));
    }

    // Impuestos y retenciones adicionales
    if (urlParams.get('iva_percibido')) data.iva_percibido = formatMoney(urlParams.get('iva_percibido'));
    if (urlParams.get('iva_retenido')) data.iva_retenido = formatMoney(urlParams.get('iva_retenido'));
    if (urlParams.get('retencion_renta')) data.retencion_renta = formatMoney(urlParams.get('retencion_renta'));
    if (urlParams.get('valores_no_afectos')) data.valores_no_afectos = formatMoney(urlParams.get('valores_no_afectos'));

    // Fechas
    const fechaEmi = urlParams.get('fechaEmi') || urlParams.get('fecha_generacion') || urlParams.get('fechaGeneracion');
    if (fechaEmi) {
        let fGen = fechaEmi;
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaEmi)) {
            const hora = urlParams.get('horaEmi') || '12:42:09';
            fGen = `${fechaEmi} ${hora}`;
        }
        data.fecha_generacion = fGen;
    }

    const fechaTrans = urlParams.get('fechaTransmision') || urlParams.get('fecha_transmision') || urlParams.get('fechaProcesado');
    if (fechaTrans) {
        data.fecha_transmision = fechaTrans;
    } else if (fechaEmi) {
        data.fecha_transmision = data.fecha_generacion;
    }

    // Ajustes y eventos
    if (urlParams.get('docAjustado') || urlParams.get('documento_ajustado')) {
        data.documento_ajustado = urlParams.get('docAjustado') || urlParams.get('documento_ajustado');
    }
    if (urlParams.get('eventoAplicado') || urlParams.get('evento_aplicado')) {
        data.evento_aplicado = urlParams.get('eventoAplicado') || urlParams.get('evento_aplicado');
    }

    if (urlParams.get('version')) {
        data.version = urlParams.get('version');
    }

    return data;
}

/**
 * Renderizar los datos en el DOM
 */
function renderDte() {
    const data = getDteData();

    document.getElementById('dte-estado').textContent = data.estado_dte;
    document.getElementById('dte-descripcion').textContent = data.descripcion_dte;
    document.getElementById('dte-tipo').textContent = data.tipo_dte;
    document.getElementById('dte-fecha-gen').textContent = data.fecha_generacion;
    document.getElementById('dte-fecha-trans').textContent = data.fecha_transmision;
    document.getElementById('dte-cod-gen').textContent = data.codigo_generacion;
    document.getElementById('dte-sello').textContent = data.sello_recepcion;
    document.getElementById('dte-control').textContent = data.numero_control;
    document.getElementById('dte-monto').textContent = data.monto_total;
    document.getElementById('dte-iva').textContent = data.iva_operaciones;
    document.getElementById('dte-iva-percibido').textContent = data.iva_percibido;
    document.getElementById('dte-iva-retenido').textContent = data.iva_retenido;
    document.getElementById('dte-retencion-renta').textContent = data.retencion_renta;
    document.getElementById('dte-valores-no-afectos').textContent = data.valores_no_afectos;
    document.getElementById('dte-total').textContent = data.total_operacion;
    document.getElementById('dte-doc-ajustado').textContent = data.documento_ajustado;
    document.getElementById('dte-evento').textContent = data.evento_aplicado;
    document.getElementById('dte-version').textContent = data.version;

    // Rellenar los valores iniciales en el formulario del modal de pruebas
    const inputMonto = document.getElementById('inputMonto');
    const inputIva = document.getElementById('inputIva');
    const inputCodGen = document.getElementById('inputCodGen');
    const inputSello = document.getElementById('inputSello');
    const inputControl = document.getElementById('inputControl');
    const selectTipo = document.getElementById('selectTipoDte');
    const inputFecha = document.getElementById('inputFechaEmi');

    if (inputMonto) inputMonto.value = data.monto_total.replace('$', '');
    if (inputIva) inputIva.value = data.iva_operaciones.replace('$', '');
    if (inputCodGen) inputCodGen.value = data.codigo_generacion;
    if (inputSello) inputSello.value = data.sello_recepcion;
    if (inputControl) inputControl.value = data.numero_control;
    if (selectTipo) selectTipo.value = data.tipo_dte;
    if (inputFecha) inputFecha.value = data.fecha_generacion;

    updateCodeSnippets(data);

    // Ocultar asistente si viene clean=1 o prod=1 en la URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('clean') || urlParams.has('prod')) {
        const pill = document.getElementById('devPill');
        if (pill) pill.style.display = 'none';
    }
}

/**
 * Actualizar los snippets de código para que muestren la URL actual
 */
function updateCodeSnippets(data) {
    const currentBase = window.location.origin + window.location.pathname;
    
    const sampleUrl = currentBase + '?' + new URLSearchParams({
        monto: data.monto_total.replace('$', ''),
        codGen: data.codigo_generacion,
        numeroControl: data.numero_control,
        tipoDte: data.tipo_dte
    }).toString();

    const sampleQr = currentBase + '?' + new URLSearchParams({
        ambiente: '01',
        codGen: data.codigo_generacion,
        fechaEmi: data.fecha_generacion.substring(0, 10)
    }).toString();

    const elLink1 = document.getElementById('snippetUrl');
    if (elLink1) elLink1.textContent = sampleUrl;

    const elLink2 = document.getElementById('snippetQr');
    if (elLink2) elLink2.textContent = sampleQr;
}

// Interacción del modal de pruebas
function openDevModal() {
    document.getElementById('devModal').style.display = 'flex';
}

function closeDevModal() {
    document.getElementById('devModal').style.display = 'none';
}

function closeDevModalOnBg(e) {
    if (e.target.id === 'devModal') {
        closeDevModal();
    }
}

function autoCalcIvaInput(monto) {
    const val = parseFloat(monto);
    if (!isNaN(val) && val > 0) {
        const iva = calcIva13(val);
        document.getElementById('inputIva').value = iva.toFixed(2);
    }
}

function generateNewUUID() {
    document.getElementById('inputCodGen').value = generateUUID();
    document.getElementById('inputSello').value = generateSello();
}

function resetToDefault() {
    window.location.href = window.location.pathname;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    renderDte();

    // Botón Nueva Consulta
    const btnNueva = document.getElementById('btnNuevaConsulta');
    if (btnNueva) {
        btnNueva.addEventListener('click', (e) => {
            e.preventDefault();
            resetToDefault();
        });
    }

    // Tabs del modal
    document.querySelectorAll('#devTab .nav-link').forEach((tab) => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('#devTab .nav-link').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#devTabContent .tab-pane').forEach(p => p.classList.remove('show', 'active'));

            this.classList.add('active');
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.classList.add('show', 'active');
        });
    });
});
