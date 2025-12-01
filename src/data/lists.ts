export const AREAS = [
    "Recepción",
    "Esterilización",
    "Desfrutado",
    "Prensado de raquis",
    "Extracción-digestión",
    "Desfibración",
    "Trituración",
    "Palmisteria",
    "Planta palmiste",
    "Generación de vapor",
    "Grupo de generación"
] as const;

// TODO: In a real app, this might be a map of Area -> Equipment[]
// For MVP, we'll use a flat list or a simple categorization if available.
// Based on the user's image, it seems to be a long list.
export const EQUIPMENT_LIST = [
    "ELEVADOR DE CAMIONES",
    "TOLVA DE RECEPCIÓN",
    "VAGONETAS",
    "ELEVADOR DE FRUTO",
    "RIEL DE VAGONETAS",
    "VOLTEADOR DE VAGONETAS",
    "ESTERILIZADOR #1",
    "ESTERILIZADOR #2",
    "ESTERILIZADOR #3",
    "TAMBOR DESFRUTADOR",
    "ELEVADOR DE TUSA",
    "PRENSA DE RAQUIS",
    "DIGESTOR #1",
    "DIGESTOR #2",
    "DIGESTOR #3",
    "PRENSA #1",
    "PRENSA #2",
    "PRENSA #3",
    "TAMIZ VIBRATORIO",
    "CLARIFICADOR",
    "CENTRIFUGA",
    "SECADOR DE VACÍO",
    "COLUMNA DE FIBRA",
    "MOLINO DE MARTILLOS",
    "CALDERA #1",
    "CALDERA #2",
    "TURBINA",
    "PLANTA DE AGUA",
    "BOMBA DE ALIMENTACIÓN",
    "COMPRESOR DE AIRE",
    "TABLERO PRINCIPAL",
    "RED CONTRA INCENDIO"
];

export const SPECIALTIES = [
    "Mecánica",
    "Electro-Instrumentación"
] as const;

export const WORK_TYPES = [
    "Preventivo",
    "Correctivo"
] as const;

export const STATUSES = [
    { value: "Ejecutado", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" },
    { value: "Adicional Turno", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    { value: "Reprogramado", color: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    { value: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/50" }
] as const;
