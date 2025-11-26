/** Tipos de alertas operacionais suportados pelo domínio OpSafe. */
export type AlertType = 'epiExpiry' | 'lateReturn' | 'maintenanceDue' | 'stockLow';

/** Severidade do alerta, usada em UI (cores, badges) e lógica de priorização. */
export type AlertSeverity = 'info' | 'warning' | 'critical';
