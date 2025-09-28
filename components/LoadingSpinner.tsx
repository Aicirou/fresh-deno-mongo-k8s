// components/LoadingSpinner.tsx - Reusable loading spinner component

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div class="text-center p-12">
      <div class="inline-block w-10 h-10 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-4"></div>
      <span class="text-lg text-gray-600">{message}</span>
    </div>
  );
}
