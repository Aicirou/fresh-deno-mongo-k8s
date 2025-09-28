// services/database.ts - Database service layer following SOC principles
// Note: Using fallback data mode to avoid MongoDB/Vite compatibility issues

import type { Dinosaur, DinosaurSearchResult } from "../types/index.ts";

// Fallback dinosaur data
const fallbackDinosaurs: Dinosaur[] = [
  { name: "Triceratops", description: "A large herbivorous ceratopsid dinosaur that lived during the late Maastrichtian stage." },
  { name: "Tyrannosaurus", description: "One of the largest land predators ever known, T. Rex lived in North America." },
  { name: "Stegosaurus", description: "A herbivorous thyreophoran dinosaur with distinctive kite-shaped plates." },
  { name: "Velociraptor", description: "A small dromaeosaurid dinosaur that lived in Asia during the Late Cretaceous." },
  { name: "Brachiosaurus", description: "This dinosaur was a giant, gentle, long-necked plant-eater." },
  { name: "Allosaurus", description: "The apex predator of late Jurassic North America." },
  { name: "Diplodocus", description: "Thin at one end, much thicker in the middle, and thin again at the far end." },
  { name: "Ankylosaurus", description: "This dinosaur was the Cretaceous equivalent of a Sherman tank." },
  { name: "Parasaurolophus", description: "Possibly the loudest dinosaur ever to roam the earth." },
  { name: "Spinosaurus", description: "This massive predator was semi-aquatic and had a distinctive sail on its back." }
];

// Simplified database service using in-memory data
class DatabaseService {
  private isConnected = false;
  private data: Dinosaur[] = [];

  /**
   * Initialize database connection (using fallback data)
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Initialize with fallback data
      this.data = [...fallbackDinosaurs];
      this.isConnected = true;
      
      console.log('✅ Using fallback dinosaur data (MongoDB disabled for Fresh compatibility)');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    this.data = [];
    this.isConnected = false;
    console.log('📦 Disconnected from database service');
  }

  /**
   * Check if database is connected and healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const count = this.data.length;
      console.log(`💚 Database health check passed. ${count} dinosaurs available.`);
      return this.isConnected && count > 0;
    } catch (error) {
      console.error('💔 Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get all dinosaurs with optional search
   */
  getDinosaurs(query?: string, limit?: number): Promise<DinosaurSearchResult> {
    this.ensureConnection();

    try {
      let filteredDinosaurs = this.data;
      
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase();
        filteredDinosaurs = this.data.filter(dino => 
          dino.name.toLowerCase().includes(searchTerm) ||
          dino.description.toLowerCase().includes(searchTerm)
        );
      }

      if (limit && limit > 0) {
        filteredDinosaurs = filteredDinosaurs.slice(0, limit);
      }

      return Promise.resolve({
        dinosaurs: filteredDinosaurs,
        total: filteredDinosaurs.length,
        query
      });
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Get a single dinosaur by name
   */
  getDinosaurByName(name: string): Promise<Dinosaur | null> {
    this.ensureConnection();

    try {
      const dinosaur = this.data.find(dino =>
        dino.name.toLowerCase() === name.toLowerCase()
      ) || null;
      
      return Promise.resolve(dinosaur);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Seed database with initial data if needed
   */
  seedDatabase(dinosaurData: Dinosaur[]): Promise<void> {
    this.ensureConnection();

    try {
      console.log('🌱 Seeding in-memory database...');

      // Replace current data with new data
      this.data = [...dinosaurData];
      
      console.log(`✅ Database now contains ${this.data.length} dinosaurs`);
      console.log('🎉 Database seeding completed successfully!');
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }

  /**
   * Ensure database connection is established
   */
  private ensureConnection(): void {
    if (!this.isConnected) {
      // Initialize synchronously for fallback mode
      this.data = [...fallbackDinosaurs];
      this.isConnected = true;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
