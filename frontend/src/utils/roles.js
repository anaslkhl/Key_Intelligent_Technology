export const ROLE_HOME = {
  client: '/',
  agent: '/agent/dashboard',
  admin: '/admin/dashboard',
}

export function getRoleHome(role) {
  return ROLE_HOME[role] || '/'
}

export const ROLE_LABELS = {
  client: 'Client',
  agent: 'Support agent',
  admin: 'Administrator',
}
