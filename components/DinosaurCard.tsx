// components/DinosaurCard.tsx - Reusable dinosaur card component

import type { Dinosaur } from "../types/index.ts";

interface DinosaurCardProps {
  dinosaur: Dinosaur;
  index?: number;
}

export function DinosaurCard({ dinosaur, index = 0 }: DinosaurCardProps) {
  return (
    <div 
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
  );
}
