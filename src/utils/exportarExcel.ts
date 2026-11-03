export const exportarAExcel = (datos: any[], nombreArchivo: string = 'Exportacion') => {
    if (!datos || !datos.length) {
        alert("No hay datos para exportar");
        return;
    }

    // 1. Obtener las cabeceras (llaves del primer objeto)
    // Filtramos campos internos que no queremos en el Excel (ej. id, esRegistroExistente)
    const camposIgnorados = ['id', 'esRegistroExistente', 'liquidacionId'];
    const cabeceras = Object.keys(datos[0]).filter(key => !camposIgnorados.includes(key));

    // Usar punto y coma (;) como delimitador estándar para Excel en español
    const DELIMITADOR = ';';

    // 2. Construir las filas asegurando que los textos con comas no rompan las columnas
    const filasCsv = datos.map(fila => 
        cabeceras.map(campo => {
            let valor = fila[campo];
            if (valor === null || valor === undefined) valor = '';
            
            // Si el valor tiene comas, comillas o saltos de línea, lo envolvemos en comillas dobles
            const stringValor = String(valor).replace(/"/g, '""'); // Escapar comillas dobles
            return `"${stringValor}"`;
        }).join(DELIMITADOR)
    );

    // Directiva 'sep=;' al inicio fuerza a Excel a reconocer las columnas
    const encabezadoSep = `sep=${DELIMITADOR}\r\n`;
    const cuerpoCsv = [cabeceras.join(DELIMITADOR), ...filasCsv].join('\r\n');
    const contenidoCsv = encabezadoSep + cuerpoCsv;

    // 4. Crear el Blob con BOM (\uFEFF) para que Excel reconozca el UTF-8 (tildes, eñes)
    const blob = new Blob(['\uFEFF' + contenidoCsv], { type: 'text/csv;charset=utf-8;' });

    // 5. Crear un enlace temporal para forzar la descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nombreArchivo}_${new Date().getTime()}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};