/**
 * Formatea una fecha ISO a formato de hora local (Hermosillo)
 * @param fechaISO - Fecha en formato ISO
 * @returns Hora formateada (ejemplo: "05:43 p.m.")
 */
export const formatearHora = (fechaISO: string): string => {
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  } catch (err) {
    console.error("Error al formatear fecha:", err);
    return "Hora no disponible";
  }
};

/**
 * Formatea una fecha ISO a formato de fecha completa
 * @param fechaISO - Fecha en formato ISO
 * @returns Fecha formateada (ejemplo: "7 may 2025")
 */
export const formatearFecha = (fechaISO: string): string => {
  try {
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", fechaISO);
      return "Fecha no disponible";
    }

    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Hermosillo'
    });
  } catch (err) {
    console.error("Error al formatear fecha:", err);
    return "Fecha no disponible";
  }
};