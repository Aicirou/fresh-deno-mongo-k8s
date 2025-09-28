// utils/config.ts - Configuration management following SOC principles

import type { AppConfig } from "../types/index.ts";

// Environment variable helpers - these should work in both server and edge contexts
function getEnvVar(key: string): string | undefined {
  try {
    // Use globalThis to access the environment in a way that works across contexts
    return (globalThis as any).Deno?.env?.get?.(key);
  } catch {
    return undefined;
  }
}

/**
 * Get application configuration from environment variables
 */
export function getConfig(): AppConfig {
  const port = parseInt(getEnvVar('PORT') || '8000');
  
  // MongoDB connection - use localhost for local dev, service name for K8s
  const mongoUri = getEnvVar('MONGODB_URI') || 
    (getEnvVar('KUBERNETES_SERVICE_HOST') 
      ? 'mongodb://mongodb-service:27017/dinosaurdb' 
      : 'mongodb://localhost:27017/dinosaurdb');
  
  const isKubernetes = !!getEnvVar('KUBERNETES_SERVICE_HOST');
  
  const environment = (getEnvVar('DENO_ENV') || 'development') as 'development' | 'production' | 'test';
  
  return {
    port,
    mongoUri,
    isKubernetes,
    environment,
  };
}

/**
 * Validate required environment variables
 */
export function validateConfig(config: AppConfig): void {
  if (!config.port || config.port < 1 || config.port > 65535) {
    throw new Error('Invalid port configuration');
  }
  
  if (!config.mongoUri) {
    throw new Error('MongoDB URI is required');
  }
}

/**
 * Log configuration information (without sensitive data)
 */
export function logConfig(config: AppConfig): void {
  console.log(`🔧 Configuration:`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Kubernetes: ${config.isKubernetes ? 'Yes' : 'No'}`);
  console.log(`   MongoDB: ${config.mongoUri.replace(/\/\/.*@/, '//***@')}`);
}
