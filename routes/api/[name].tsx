import { define } from "../../utils.ts";
import { databaseService } from "../../services/database.ts";
import type { ApiResponse, Dinosaur } from "../../types/index.ts";

// Fallback data in case database is not available
const fallbackData: Dinosaur[] = [
  { name: "Triceratops", description: "A large herbivorous ceratopsid dinosaur that lived during the late Maastrichtian stage." },
  { name: "Tyrannosaurus", description: "One of the largest land predators ever known, T. Rex lived in North America." },
  { name: "Stegosaurus", description: "A herbivorous thyreophoran dinosaur with distinctive kite-shaped plates." },
  { name: "Velociraptor", description: "A small dromaeosaurid dinosaur that lived in Asia during the Late Cretaceous." },
  { name: "Brachiosaurus", description: "This dinosaur was a giant, gentle, long-necked plant-eater." },
];

export const handler = define.handlers({
  async GET(ctx) {
    const name = ctx.params.name;
    
    try {
      // Try to get from database first
      const dinosaur = await databaseService.getDinosaurByName(name);
      
      if (dinosaur) {
        const response: ApiResponse<Dinosaur> = {
          success: true,
          data: dinosaur
        };
        return new Response(JSON.stringify(response), {
          headers: { "content-type": "application/json" }
        });
      }
      
      // Fallback to static data
      const found = fallbackData.find((item) =>
        item.name.toLowerCase() === name.toLowerCase()
      );
      
      if (found) {
        const response: ApiResponse<Dinosaur> = {
          success: true,
          data: found
        };
        return new Response(JSON.stringify(response), {
          headers: { "content-type": "application/json" }
        });
      }
      
      // Not found
      const response: ApiResponse = {
        success: false,
        message: "No dinosaurs found."
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
      
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
});
