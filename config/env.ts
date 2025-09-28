// config/env.ts - Global environment configuration

export interface AppConfig {
  // Server configuration
  port: number;
  host: string;
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  isKubernetes: boolean;
  
  // Database
  mongoUri: string;
  mongoDbName: string;
  
  // Features
  enableClusterMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function getEnvVar(key: string, defaultValue?: string): string {
  try {
    return (globalThis as { Deno?: { env?: { get?: (key: string) => string | undefined } } }).Deno?.env?.get?.(key) ?? defaultValue ?? '';
  } catch {
    return defaultValue ?? '';
  }
}

function getBooleanEnv(key: string, _defaultValue = false): boolean {
  const value = getEnvVar(key).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function getIntEnv(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get comprehensive application configuration
 */
export function getConfig(): AppConfig {
  const port = getIntEnv('PORT', 8000);
  const host = getEnvVar('HOST', '0.0.0.0');
  
  const nodeEnv = getEnvVar('NODE_ENV', 'development');
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isKubernetes = !!getEnvVar('KUBERNETES_SERVICE_HOST');
  
  // MongoDB configuration with smart defaults
  const mongoDbName = getEnvVar('MONGO_DB_NAME', 'dinosaurdb');
  const mongoUri = getEnvVar('MONGODB_URI') || 
    (isKubernetes 
      ? `mongodb://admin:password@mongodb-service:27017/${mongoDbName}?authSource=admin`
      : `mongodb://localhost:27017/${mongoDbName}`);
  
  // Feature flags
  const enableClusterMonitoring = isKubernetes || getBooleanEnv('ENABLE_CLUSTER_MONITORING');
  const logLevel = (getEnvVar('LOG_LEVEL', isDevelopment ? 'debug' : 'info') as AppConfig['logLevel']);
  
  return {
    port,
    host,
    isDevelopment,
    isProduction,
    isKubernetes,
    mongoUri,
    mongoDbName,
    enableClusterMonitoring,
    logLevel,
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port: ${config.port}`);
  }
  
  if (!config.mongoUri) {
    throw new Error('MongoDB URI is required');
  }
  
  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    throw new Error(`Invalid log level: ${config.logLevel}`);
  }
}

// Global config instance
let _config: AppConfig | null = null;

/**
 * Get or initialize global configuration
 */
export function config(): AppConfig {
  if (!_config) {
    _config = getConfig();
    validateConfig(_config);
  }
  return _config;
}

/**
 * Development environment configuration
 */
export const DEV_CONFIG = {
  port: 8000,
  mongoUri: 'mongodb://localhost:27017/dinosaurdb',
  enablePortForwarding: true,
  enableHotReload: true,
  logLevel: 'debug' as const,
};

/**
 * Production environment configuration  
 */
export const PROD_CONFIG = {
  port: 8000,
  mongoUri: 'mongodb://admin:password@mongodb-service:27017/dinosaurdb?authSource=admin',
  enableClusterMonitoring: true,
  logLevel: 'info' as const,
};
