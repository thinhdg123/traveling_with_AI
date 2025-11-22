// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  // User Management
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update',
    CHANGE_PASSWORD: '/api/user/change-password',
  },
  // Application specific
  VUNGMIEN: {
    LIST: '/api/vungmien',
    DETAIL: '/api/vungmien/:id',
    CREATE: '/api/vungmien/create',
    UPDATE: '/api/vungmien/:id/update',
    DELETE: '/api/vungmien/:id/delete',
  },
} as const;

// App Routes
export const APP_ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/auth/login-register',
    REGISTER: '/auth/login-register',
  },
  // Protected routes
  PRIVATE: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
  // App specific routes
  VUNGMIEN: {
    LIST: '/vungmien',
    DETAIL: '/vungmien/:id',
    CREATE: '/vungmien/create',
    EDIT: '/vungmien/:id/edit',
  },
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Permission Levels
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.DELETE,
    PERMISSIONS.ADMIN,
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.READ,
  ],
  [USER_ROLES.GUEST]: [
    PERMISSIONS.READ,
  ],
} as const;

// Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email already exists.',
  PASSWORD_TOO_WEAK: 'Password is too weak.',
  INVALID_TOKEN: 'Invalid or expired token.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ITEM_CREATED: 'Item created successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Hackathon 2025 App',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TOKEN_STORAGE_KEY: 'auth_token',
  USER_STORAGE_KEY: 'user_data',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
} as const;

// Type definitions for constants
export type ApiEndpoint = typeof API_ENDPOINTS;
export type AppRoute = typeof APP_ROUTES;
export type UserRole = keyof typeof USER_ROLES;
export type Permission = keyof typeof PERMISSIONS;
export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];
