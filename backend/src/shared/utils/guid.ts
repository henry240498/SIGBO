/**
 * SQL Server `uniqueidentifier` (NEWSEQUENTIALID) no siempre respeta los
 * nibbles de version/variante de un UUID RFC 4122, por lo que el decorador
 * @IsUUID() de class-validator los rechaza. Se valida solo la forma GUID.
 */
export const GUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const GUID_REGEX_MENSAJE = 'debe ser un identificador valido';
