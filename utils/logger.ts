// utils/logger.ts - Clean logging utility

import { config } from "../config/env.ts";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green  
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m'
} as const;

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
} as const;

class Logger {
  private minLevel: number;
  
  constructor() {
    this.minLevel = LOG_LEVELS[config().logLevel];
  }
  
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }
  
  private formatMessage(level: LogLevel, message: string, ..._args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    return `${LOG_COLORS[level]}[${timestamp}] ${levelUpper}${LOG_COLORS.reset} ${message}`;
  }
  
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
  
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }
  
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }
  
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }
  
  // Simple methods for clean output
  success(message: string): void {
    console.log(`${LOG_COLORS.info}✅ ${message}${LOG_COLORS.reset}`);
  }
  
  failure(message: string): void {
    console.log(`${LOG_COLORS.error}❌ ${message}${LOG_COLORS.reset}`);
  }
  
  loading(message: string): void {
    console.log(`${LOG_COLORS.debug}⏳ ${message}${LOG_COLORS.reset}`);
  }
}

export const logger = new Logger();
