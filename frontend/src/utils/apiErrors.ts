// El backend convierte las claves de error a camelCase (ver
// ResponseFormatter::convertToCamelCase), así que un campo enviado como
// `first_name` llega en `fields` como `firstName`.
export function toCamelCase(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// La mayoría de los validadores del backend devuelven un string por campo
// (PQRValidator, ServiceRequestValidator, VehicleValidator, SurveyValidator),
// pero los de Auth (RequestValidator::validateRegistrationRequest/
// validateLoginRequest/validateChangePasswordRequest) devuelven un array de
// strings por campo. Se normaliza aquí para no depender de cuál formato use
// cada endpoint — siempre se muestra el primer mensaje disponible.
export function fieldErrorFor(
  fields: Record<string, string | string[]> | null | undefined,
  field: string
): string | undefined {
  if (!fields) return undefined;
  const value = fields[toCamelCase(field)];
  if (Array.isArray(value)) return value[0];
  return value;
}
