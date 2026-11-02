// Lee la primera hoja de un .xlsx (o un .csv) sin librerías.
// Un .xlsx es un ZIP con XML adentro: se ubican los archivos del ZIP, se descomprimen con
// DecompressionStream (nativo del navegador) y se leen las celdas con DOMParser.

export type TablaExcel = (string | number)[][];

// ===== ZIP: índice central → función que devuelve el texto de un archivo interno =====
const abrirZip = (buffer: ArrayBuffer) => {
    const v = new DataView(buffer);
    const texto = new TextDecoder();

    // "fin del directorio central": está al final del archivo
    let fin = buffer.byteLength - 22;
    while (fin >= 0 && v.getUint32(fin, true) !== 0x06054b50) fin--;
    if (fin < 0) throw new Error('El archivo no es un Excel válido (.xlsx)');

    const entradas = new Map<string, { metodo: number; tamano: number; inicio: number }>();
    let p = v.getUint32(fin + 16, true);
    for (let i = 0, total = v.getUint16(fin + 10, true); i < total; i++) {
        const largoNombre = v.getUint16(p + 28, true);
        const local = v.getUint32(p + 42, true);
        entradas.set(texto.decode(new Uint8Array(buffer, p + 46, largoNombre)), {
            metodo: v.getUint16(p + 10, true),
            tamano: v.getUint32(p + 20, true),
            inicio: local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true),
        });
        p += 46 + largoNombre + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
    }

    return async (nombre: string): Promise<string | null> => {
        const e = entradas.get(nombre);
        if (!e) return null;
        const datos = new Uint8Array(buffer, e.inicio, e.tamano);
        if (e.metodo === 0) return texto.decode(datos);   // guardado sin comprimir
        const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return new Response(flujo).text();
    };
};

const xml = (texto: string) => new DOMParser().parseFromString(texto, 'application/xml');
const etiquetas = (el: Document | Element, tag: string) => Array.from(el.getElementsByTagName(tag));
const textoDe = (el: Element) => etiquetas(el, 't').map((t) => t.textContent ?? '').join('');

// "AB12" → 27 (índice de columna desde 0)
const indiceColumna = (ref: string) =>
    [...ref.replace(/\d+/g, '')].reduce((n, letra) => n * 26 + letra.charCodeAt(0) - 64, 0) - 1;

export const letraColumna = (i: number): string =>
    (i >= 26 ? letraColumna(Math.floor(i / 26) - 1) : '') + String.fromCharCode(65 + (i % 26));

const leerCsv = (contenido: string): TablaExcel => {
    const lineas = contenido.split(/\r?\n/).filter((l) => l.trim());
    const primera = lineas[0] ?? '';
    const separador = primera.split(';').length > primera.split(',').length ? ';' : ',';
    return lineas.map((l) => l.split(separador).map((c) => c.trim().replace(/^"|"$/g, '')));
};

export const leerExcel = async (archivo: File): Promise<TablaExcel> => {
    if (archivo.name.toLowerCase().endsWith('.csv')) return leerCsv(await archivo.text());

    const leer = abrirZip(await archivo.arrayBuffer());

    // la primera hoja del libro (workbook.xml dice cuál es; sus rels dicen en qué archivo está)
    let rutaHoja = 'xl/worksheets/sheet1.xml';
    const [libro, rels] = await Promise.all([leer('xl/workbook.xml'), leer('xl/_rels/workbook.xml.rels')]);
    if (libro && rels) {
        const id = etiquetas(xml(libro), 'sheet')[0]?.getAttribute('r:id');
        const destino = etiquetas(xml(rels), 'Relationship').find((r) => r.getAttribute('Id') === id)?.getAttribute('Target');
        if (destino) rutaHoja = destino.startsWith('/') ? destino.slice(1) : `xl/${destino}`;
    }

    const hoja = await leer(rutaHoja);
    if (!hoja) throw new Error('No se encontró la hoja en el Excel');

    // los textos se guardan una sola vez en sharedStrings y las celdas apuntan a su índice
    const compartidos = await leer('xl/sharedStrings.xml');
    const textos = compartidos ? etiquetas(xml(compartidos), 'si').map(textoDe) : [];

    const filas: TablaExcel = etiquetas(xml(hoja), 'row').map((row) => {
        const fila: (string | number)[] = [];
        etiquetas(row, 'c').forEach((c, i) => {
            const ref = c.getAttribute('r');
            const tipo = c.getAttribute('t');
            const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
            let valor: string | number = v;
            if (tipo === 's') valor = textos[Number(v)] ?? '';
            else if (tipo === 'inlineStr') valor = textoDe(c);
            else if (!tipo || tipo === 'n') valor = v === '' ? '' : Number(v);
            fila[ref ? indiceColumna(ref) : i] = valor;
        });
        return Array.from(fila, (x) => x ?? '');
    });

    return filas.filter((f) => f.some((x) => x !== ''));
};

// "S/ 1,234.50" | "1.234,50" | 1234.5 → 1234.5 ; vacío o inválido → null
export const aNumero = (valor: unknown): number | null => {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
    let t = String(valor ?? '').replace(/[^\d.,-]/g, '');
    if (!t) return null;
    if (t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');   // coma decimal
    else t = t.replace(/,/g, '');                                                              // coma de miles
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
};
