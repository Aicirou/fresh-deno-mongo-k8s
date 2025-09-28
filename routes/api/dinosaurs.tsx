import { define } from "../../utils.ts";
import { databaseService } from "../../services/database.ts";
import type { ApiResponse, DinosaurSearchResult, Dinosaur } from "../../types/index.ts";
import dinosaurData from "../../data.json" with { type: "json" };

// Fallback data in case database is not available
const fallbackData: Dinosaur[] = [
  { name: "Triceratops", description: "A large herbivorous ceratopsid dinosaur that lived during the late Maastrichtian stage." },
  { name: "Tyrannosaurus", description: "One of the largest land predators ever known, T. Rex lived in North America." },
  { name: "Stegosaurus", description: "A herbivorous thyreophoran dinosaur with distinctive kite-shaped plates." },
  { name: "Velociraptor", description: "A small dromaeosaurid dinosaur that lived in Asia during the Late Cretaceous." },
  { name: "Brachiosaurus", description: "This dinosaur was a giant, gentle, long-necked plant-eater." },
];

export const handler = define.handlers({
  async GET(ctx: any) {
    try {
      const url = new URL(ctx.req.url);
      const query = url.searchParams.get('q');
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

      // Try to get from database first
      try {
        const result = await databaseService.getDinosaurs(query || undefined, limit);
        
        const response: ApiResponse<DinosaurSearchResult> = {
          success: true,
          data: result
        };
        
        return new Response(JSON.stringify(response.data), {
          headers: { "content-type": "application/json" }
        });
      } catch (dbError) {
        console.warn('Database not available, using fallback data:', dbError);
        
        // Fallback to static data
        let filtered = fallbackData;
        
        if (query) {
          filtered = fallbackData.filter(dino => 
            dino.name.toLowerCase().includes(query.toLowerCase()) ||
            dino.description.toLowerCase().includes(query.toLowerCase())
          );
        }
        
        if (limit) {
          filtered = filtered.slice(0, limit);
        }
        
        return new Response(JSON.stringify(filtered), {
          headers: { "content-type": "application/json" }
        });
      }
      
    } catch (error) {
      console.error('API error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
  },

  async POST(ctx: any) {
    try {
      // Initialize database with seed data
      await databaseService.seedDatabase(dinosaurData as Dinosaur[]);
      
      const response: ApiResponse = {
        success: true,
        message: 'Database seeded successfully'
      };
      
      return new Response(JSON.stringify(response), {
        headers: { "content-type": "application/json" }
      });
      
    } catch (error) {
      console.error('Seed error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to seed database'
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
  }
});
