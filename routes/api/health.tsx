import { define } from "../../utils.ts";
import { databaseService } from "../../services/database.ts";
import type { ApiResponse } from "../../types/index.ts";

export const handler = define.handlers({
  async GET(ctx: any) {
    try {
      // Check database health
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
        headers: { "content-type": "application/json" }
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
        headers: { "content-type": "application/json" }
      });
    }
  }
});
