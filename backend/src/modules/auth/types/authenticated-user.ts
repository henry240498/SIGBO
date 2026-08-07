export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
  permisos: string[];
}
