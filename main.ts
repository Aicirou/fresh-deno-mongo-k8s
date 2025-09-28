import { App, staticFiles } from "fresh";
import { databaseService } from "./services/database.ts";
import { config, validateConfig } from "./config/env.ts";
import { logger } from "./utils/logger.ts";
import dinosaurData from "./data.json" with { type: "json" };
import type { Dinosaur } from "./types/index.ts";

interface State {
  corsHeaders?: Record<string, string>;
  shared?: string;
}

export const app = new App<State>();

app.use(staticFiles());

// CORS middleware for API requests
app.use(async (ctx) => {
  if (ctx.req.url.includes('/api/')) {
    ctx.state.corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  
  ctx.state.shared = "dinosaur-api";
  return await ctx.next();
});

// Database initialization middleware
app.use(async (ctx) => {
  try {
    await databaseService.connect();
    
    const result = await databaseService.getDinosaurs(undefined, 1);
    if (result.total === 0) {
      logger.info('Database empty, seeding with initial data');
      await databaseService.seedDatabase(dinosaurData as Dinosaur[]);
      logger.success('Database seeded successfully');
    }
  } catch (error) {
    logger.warn('Database initialization failed, using fallback data');
    logger.debug(`Database error: ${error}`);
  }
  
  return await ctx.next();
});

// Request logging middleware (only in development)
if (config().isDevelopment) {
  app.use(async (ctx) => {
    const start = Date.now();
    const pathname = new URL(ctx.req.url).pathname;
    
    logger.debug(`→ ${ctx.req.method} ${pathname}`);
    
    const response = await ctx.next();
    const duration = Date.now() - start;
    
    logger.debug(`← ${ctx.req.method} ${pathname} - ${response.status} (${duration}ms)`);
    
    return response;
  });
}

// Health check endpoint (legacy support)
app.get("/health", async (ctx) => {
  try {
    const dbHealthy = await databaseService.isHealthy();
    
    const healthStatus = {
      status: "healthy",
      message: "Welcome to the Dinosaur API! 🦕",
      services: {
        database: dbHealthy ? "healthy" : "degraded",
        api: "healthy"
      },
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(healthStatus), {
      headers: { 
        "content-type": "application/json",
        ...ctx.state.corsHeaders 
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    const healthStatus = {
      status: "degraded",
      message: "Service is running but some components may be unavailable",
      services: {
        database: "error",
        api: "healthy"
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(healthStatus), {
      status: 503,
      headers: { 
        "content-type": "application/json",
        ...ctx.state.corsHeaders 
      }
    });
  }
});

// Include file-system based routes here
app.fsRoutes();

// Initialize and start application
function startApp(): void {
  try {
    const appConfig = config();
    validateConfig(appConfig);
    
    logger.info(`Starting Dinosaur API`);
    logger.info(`Environment: ${appConfig.isDevelopment ? 'development' : 'production'}`);
    logger.info(`Server: http://${appConfig.host}:${appConfig.port}`);
    logger.info(`Cluster monitoring: ${appConfig.enableClusterMonitoring ? 'enabled' : 'disabled'}`);
    
  } catch (error) {
    logger.failure('Configuration error');
    logger.error(`${error}`);
    globalThis.Deno?.exit(1);
  }
}

// Auto-start when running directly
if (globalThis.Deno && import.meta.main) {
  startApp();
}
