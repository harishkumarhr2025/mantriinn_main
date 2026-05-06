const normalizeRole = (role) =>
	String(role || '')
		.trim()
		.toLowerCase()
		.replace(/[\s_-]+/g, '');

export const hasRole = (user, expectedRole) => normalizeRole(user?.role) === normalizeRole(expectedRole);

export const isAdminUser = (user) => hasRole(user, 'admin');

export const isSemiAdminUser = (user) =>
	hasRole(user, 'semi admin') || hasRole(user, 'semiadmin') || hasRole(user, 'salonfrontoffice');

export const isAddOnlyUser = (user) => isSemiAdminUser(user);

export const canAccessDashboard = (user) => isAdminUser(user) || isSemiAdminUser(user);

export const canViewReports = (user) => isAdminUser(user);

export const canManageRoles = (user) => isAdminUser(user);

export const canExportData = (user) => isAdminUser(user);

export const canModifyRecords = (user) => isAdminUser(user);
