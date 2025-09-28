// islands/ClusterStatus.tsx - Interactive cluster status monitoring island

import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { ClusterStatus } from "../types/index.ts";

export default function ClusterStatus() {
  const clusterStatus = useSignal<ClusterStatus | null>(null);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);

  const loadClusterStatus = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch('/api/cluster-status');
      const data = await response.json();
      
      if (response.ok) {
        clusterStatus.value = data;
      } else {
        clusterStatus.value = data; // Still show the fallback data
        error.value = data.clusterInfo?.error || 'Failed to load cluster status';
      }
    } catch (err) {
      error.value = 'Network error occurred';
      console.error('Error loading cluster status:', err);
    } finally {
      loading.value = false;
    }
  };

  const formatAge = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h${diffMins}m`;
    return `${diffMins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  useEffect(() => {
    loadClusterStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadClusterStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading.value && !clusterStatus.value) {
    return (
      <div class="text-center p-12">
        <div class="inline-block w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-4"></div>
        <span class="text-lg text-gray-600">Loading cluster status...</span>
      </div>
    );
  }

  const status = clusterStatus.value;
  if (!status) {
    return (
      <div class="text-center p-12">
        <div class="text-red-500 text-lg mb-4">❌ Failed to load cluster status</div>
        <button 
          onClick={loadClusterStatus}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Dinosaur API Status */}
      <div class="bg-white rounded-lg p-6 shadow-lg text-center">
        <h3 class="text-lg font-semibold mb-2">🦕 Dinosaur API</h3>
        <div class={`text-3xl font-bold mb-2 ${getStatusColor('running')}`}>
          {status.pods.api.length}
        </div>
        <small class="text-gray-600">Pods Running</small>
        <div class="mt-3 text-xs text-gray-500">
          <div>Replicas: {status.deployment.replicas.ready}/{status.deployment.replicas.desired}</div>
          <div>Strategy: {status.deployment.strategy}</div>
        </div>
      </div>

      {/* MongoDB Status */}
      <div class="bg-white rounded-lg p-6 shadow-lg text-center">
        <h3 class="text-lg font-semibold mb-2">🗄️ MongoDB</h3>
        <div class={`text-3xl font-bold mb-2 ${getStatusColor('running')}`}>
          {status.pods.mongodb.length}
        </div>
        <small class="text-gray-600">Pods Running</small>
        <div class="mt-3 text-xs text-gray-500">
          <div>Services: {status.services.mongodb.length}</div>
          <div>Storage: {status.volumes?.persistentVolumes?.length || 0} PV(s)</div>
        </div>
      </div>

      {/* CPU Status */}
      <div class="bg-white rounded-lg p-6 shadow-lg text-center">
        <h3 class="text-lg font-semibold mb-2">📊 Node CPU</h3>
        <div class={`text-3xl font-bold mb-2 ${getStatusColor(status.resources.cpuStatus)}`}>
          {status.resources.cpuPercent}%
        </div>
        <small class="text-gray-600">Utilization</small>
        <div class="mt-3 text-xs text-gray-500">
          <div>Capacity: {status.node?.capacity?.cpu || 'N/A'} cores</div>
          <div>Architecture: {status.node?.architecture || 'N/A'}</div>
        </div>
      </div>

      {/* Memory Status */}
      <div class="bg-white rounded-lg p-6 shadow-lg text-center">
        <h3 class="text-lg font-semibold mb-2">💾 Node Memory</h3>
        <div class={`text-3xl font-bold mb-2 ${getStatusColor(status.resources.memoryStatus)}`}>
          {status.resources.memoryPercent}%
        </div>
        <small class="text-gray-600">Utilization</small>
        <div class="mt-3 text-xs text-gray-500">
          <div>OS: {status.environment?.platform?.split(' ')[0] || 'N/A'}</div>
        </div>
      </div>

      {/* Cluster Info */}
      <div class="bg-white rounded-lg p-6 shadow-lg text-center">
        <h3 class="text-lg font-semibold mb-2">🌐 Cluster Info</h3>
        <div class={`text-3xl font-bold mb-2 ${status.clusterInfo.connected ? 'text-green-500' : 'text-red-500'}`}>
          {status.clusterInfo.connected ? '✅' : '❌'}
        </div>
        <small class="text-gray-600">{status.clusterInfo.connected ? 'Connected' : 'Disconnected'}</small>
        <div class="mt-3 text-xs text-gray-500">
          <div>Context: {status.metadata.context}</div>
          <div>K8s: {status.environment?.kubernetesVersion || 'N/A'}</div>
        </div>
      </div>

      {/* Pod Details */}
      <div class="bg-white rounded-lg p-6 shadow-lg col-span-full">
        <h3 class="text-lg font-semibold mb-4">🔍 Pod Details</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium text-gray-700 mb-2">API Pods</h4>
            <div class="space-y-1">
              {status.pods.api.map((pod) => (
                <div key={pod.name} class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <span>🦕 {pod.name.split('-').slice(0, 2).join('-')}-{pod.name.split('-').pop()}</span>
                  <span class={pod.ready ? 'text-green-600' : 'text-red-600'}>
                    {pod.ready ? '✅' : '❌'} ({formatAge(pod.age)}, restarts: {pod.restarts})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-2">MongoDB Pods</h4>
            <div class="space-y-1">
              {status.pods.mongodb.map((pod) => (
                <div key={pod.name} class="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <span>🗄️ {pod.name}</span>
                  <span class={pod.ready ? 'text-green-600' : 'text-red-600'}>
                    {pod.ready ? '✅' : '❌'} ({formatAge(pod.age)}, restarts: {pod.restarts})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-500">
          Total: {status.pods.stats.total} pods ({status.pods.stats.running} running, {status.pods.stats.pending} pending, {status.pods.stats.error} error)
        </div>
      </div>

      {/* Recent Events */}
      {status.events.length > 0 && (
        <div class="bg-white rounded-lg p-6 shadow-lg col-span-full">
          <h3 class="text-lg font-semibold mb-4">📋 Recent Events</h3>
          <div class="max-h-48 overflow-y-auto space-y-2">
            {status.events.slice(0, 5).map((event, index) => (
              <div 
                key={index}
                class={`text-sm p-2 rounded ${event.type === 'Normal' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}
              >
                <div class="font-medium">{event.reason}</div>
                <div class="text-gray-600">{event.message.substring(0, 100)}{event.message.length > 100 ? '...' : ''}</div>
                <div class="text-xs text-gray-400 mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div class="col-span-full text-center text-sm text-gray-500">
        <div class="flex items-center justify-center gap-2">
          <div class={`w-2 h-2 rounded-full ${loading.value ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
          Last updated: {new Date(status.metadata.lastUpdated).toLocaleTimeString()}
          {error.value && <span class="text-red-500 ml-2">({error.value})</span>}
        </div>
      </div>
    </div>
  );
}
