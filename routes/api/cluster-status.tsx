import { define } from "../../utils.ts";
import { kubernetesService } from "../../services/kubernetes.ts";
import type { ApiResponse, ClusterStatus } from "../../types/index.ts";

export const handler = define.handlers({
  async GET(ctx: any) {
    try {
      const status = await kubernetesService.getClusterStatus();
      
      return new Response(JSON.stringify(status), {
        headers: { "content-type": "application/json" }
      });
      
    } catch (error) {
      console.error('❌ Error loading cluster status:', error);
      
      // Return detailed error information
      const fallbackStatus = {
        deployment: {
          name: 'dinosaur-api',
          replicas: { desired: 0, current: 0, ready: 0, available: 0 },
          strategy: 'unknown',
          image: 'unknown'
        },
        pods: {
          stats: { running: 0, pending: 0, error: 1, total: 0 },
          api: [],
          mongodb: [],
          metrics: { api: [], mongodb: [] }
        },
        services: {
          api: [],
          mongodb: []
        },
        autoscaling: null,
        node: {} as any,
        resources: {
          memoryPercent: 0,
          cpuPercent: 0,
          memoryStatus: 'error' as const,
          cpuStatus: 'error' as const
        },
        volumes: { persistentVolumes: [] },
        events: [],
        environment: {
          kubernetesVersion: 'unknown',
          runtime: 'unknown',
          platform: 'unknown',
          kernel: 'unknown'
        },
        metadata: {
          lastUpdated: new Date().toISOString(),
          updateFrequency: '30s',
          dataSource: 'kubectl',
          namespace: 'default',
          context: 'unknown'
        },
        clusterInfo: {
          connected: false,
          healthy: false,
          totalPods: 0,
          readyPods: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          troubleshooting: {
            suggestions: [
              'Check if kubectl is available in the container',
              'Verify RBAC permissions for the service account',
              'Ensure the cluster is accessible from the pod',
              'Check if the required resources exist'
            ],
            commands: [
              'kubectl get pods -l app=dinosaur-api',
              'kubectl get services -l app=dinosaur-api',
              'kubectl describe deployment dinosaur-api'
            ]
          }
        }
      };
      
      return new Response(JSON.stringify(fallbackStatus), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }
  }
});
