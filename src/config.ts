// Single source of truth for business constants (AC1, AC2, fixed clock).
export const MAX_BOOKING_MINUTES = 120; // AC2
export const DAY_START_MINUTES = 0; // AC1 lower bound (00:00)
export const DAY_END_MINUTES = 1440; // AC1 upper bound (24:00)
export const DEFAULT_NOW_MINUTES = 540; // fixed prototype "current time" = 09:00
