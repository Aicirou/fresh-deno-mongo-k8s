// islands/DinosaurBrowser.tsx - Interactive dinosaur browser island

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Dinosaur } from "../types/index.ts";

export default function DinosaurBrowser() {
  const dinosaurs = useSignal<Dinosaur[]>([]);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const searchQuery = useSignal("");

  const loadDinosaurs = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const url = searchQuery.value 
        ? `/api?q=${encodeURIComponent(searchQuery.value)}`
        : '/api';
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        dinosaurs.value = Array.isArray(data) ? data : data.dinosaurs || [];
      } else {
        error.value = data.error || 'Failed to load dinosaurs';
      }
    } catch (err) {
      error.value = 'Network error occurred';
      console.error('Error loading dinosaurs:', err);
    } finally {
      loading.value = false;
    }
  };

  const searchDinosaurs = (query: string) => {
    searchQuery.value = query;
    loadDinosaurs();
  };

  useEffect(() => {
    loadDinosaurs();
  }, []);

  if (loading.value) {
    return (
      <div class="flex items-center justify-center p-8">
        <div class="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mr-3"></div>
        <span class="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error.value) {
    return (
      <div class="text-center p-8">
        <div class="text-red-600 mb-4">{error.value}</div>
        <button 
          type="button"
          onClick={loadDinosaurs}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search dinosaurs..."
        class="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        onInput={(e) => searchDinosaurs((e.target as HTMLInputElement).value)}
      />
      
      {dinosaurs.value.length === 0 ? (
        <div class="text-center text-gray-500 py-8">
          No dinosaurs found
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dinosaurs.value.map((dinosaur, index) => (
            <div 
              key={dinosaur.name}
              class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <h3 class="text-lg font-medium text-gray-900 mb-3">
                {dinosaur.name}
              </h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                {dinosaur.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
