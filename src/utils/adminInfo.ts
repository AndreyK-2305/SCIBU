/**
 * Credenciales de administrador predeterminadas
 * Este archivo sirve como referencia rápida para obtener las credenciales del administrador
 */

export const ADMIN_CREDENTIALS = {
  email: "admin@sisgelab.com",
  password: "Admin@123456",
  role: "admin",
};

/**
 * Devuelve las credenciales formateadas como cadena para mostrar
 */
export function getAdminCredentialsAsString(): string {
  return `
    Email: ${ADMIN_CREDENTIALS.email}
    Password: ${ADMIN_CREDENTIALS.password}
    Rol: ${ADMIN_CREDENTIALS.role}
  `;
}
