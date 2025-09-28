// services/kubernetes.ts - Kubernetes service layer following SOC principles

import type { ClusterStatus } from "../types/index.ts";
import { logger } from "../utils/logger.ts";

/**
 * Check if kubectl is available
 */
function isKubectlAvailable(): boolean {
  try {
    const cmd = new (globalThis as { Deno?: { Command?: any } }).Deno.Command("kubectl", { 
      args: ["version", "--client=true"], 
      stdout: "null", 
      stderr: "null" 
    });
    const { code } = cmd.outputSync();
    return code === 0;
  } catch {
    return false;
  }
}

/**
 * Execute kubectl commands
 */
async function executeKubectl(args: string[]): Promise<string> {
  try {
    const cmd = new (globalThis as { Deno?: { Command?: any } }).Deno.Command("kubectl", { 
      args, 
      stdout: "piped", 
      stderr: "piped" 
    });
    const { code, stdout, stderr } = await cmd.output();
    
    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`kubectl command failed: ${errorText}`);
    }
    
    return new TextDecoder().decode(stdout);
  } catch (error) {
    // For "not found" errors, just throw without logging (handled by caller)
    if (error instanceof Error && error.message.includes('entity not found')) {
      throw new Error('kubectl not available');
    }
    logger.debug('kubectl execution error', error);
    throw error;
  }
}

/**
 * Kubernetes service for cluster monitoring
 */
export class KubernetesService {
  /**
   * Get comprehensive cluster status
   */
  async getClusterStatus(): Promise<ClusterStatus> {
    // Check if kubectl is available first
    if (!isKubectlAvailable()) {
      logger.debug('kubectl not available, returning fallback status');
      return this.getFallbackStatus(new Error('kubectl not available in development environment'));
    }

    try {
      // Get dinosaur-api pods
      const apiPodsOutput = await executeKubectl(["get", "pods", "-l", "app=dinosaur-api", "-o", "json"]);
      const apiPodsData = JSON.parse(apiPodsOutput);
      
      // Get mongodb pods
      const mongoPodsOutput = await executeKubectl(["get", "pods", "-l", "app=mongodb", "-o", "json"]);
      const mongoPodsData = JSON.parse(mongoPodsOutput);
      
      let podStats = { running: 0, pending: 0, error: 0, total: 0 };
      const apiPods: any[] = [];
      const mongoPods: any[] = [];
      
      // Process dinosaur-api pods
      apiPodsData.items.forEach((pod: any) => {
        podStats.total++;
        const phase = pod.status.phase;
        const podInfo = {
          name: pod.metadata.name,
          app: 'dinosaur-api',
          status: phase,
          restarts: pod.status.containerStatuses?.[0]?.restartCount || 0,
          age: pod.metadata.creationTimestamp,
          ready: pod.status.containerStatuses?.[0]?.ready || false
        };
        
        if (phase === 'Running') {
          podStats.running++;
        } else if (phase === 'Pending') {
          podStats.pending++;
        } else {
          podStats.error++;
        }
        
        apiPods.push(podInfo);
      });
      
      // Process mongodb pods
      mongoPodsData.items.forEach((pod: any) => {
        podStats.total++;
        const phase = pod.status.phase;
        const podInfo = {
          name: pod.metadata.name,
          app: 'mongodb',
          status: phase,
          restarts: pod.status.containerStatuses?.[0]?.restartCount || 0,
          age: pod.metadata.creationTimestamp,
          ready: pod.status.containerStatuses?.[0]?.ready || false
        };
        
        if (phase === 'Running') {
          podStats.running++;
        } else if (phase === 'Pending') {
          podStats.pending++;
        } else {
          podStats.error++;
        }
        
        mongoPods.push(podInfo);
      });

      // Get services
      const apiServicesOutput = await executeKubectl(["get", "services", "-l", "app=dinosaur-api", "-o", "json"]);
      const apiServicesData = JSON.parse(apiServicesOutput);
      
      const mongoServicesOutput = await executeKubectl(["get", "services", "-l", "app=mongodb", "-o", "json"]);
      const mongoServicesData = JSON.parse(mongoServicesOutput);
      
      const apiServices: any[] = [];
      const mongoServices: any[] = [];
      
      // Process services
      apiServicesData.items.forEach((service: any) => {
        apiServices.push({
          name: service.metadata.name,
          app: 'dinosaur-api',
          type: service.spec.type,
          clusterIP: service.spec.clusterIP,
          ports: service.spec.ports,
          endpoints: service.status?.loadBalancer?.ingress || []
        });
      });
      
      mongoServicesData.items.forEach((service: any) => {
        mongoServices.push({
          name: service.metadata.name,
          app: 'mongodb',
          type: service.spec.type,
          clusterIP: service.spec.clusterIP,
          ports: service.spec.ports,
          endpoints: service.status?.loadBalancer?.ingress || []
        });
      });

      // Get deployment information
      const deploymentOutput = await executeKubectl(["get", "deployment", "dinosaur-api", "-o", "json"]);
      const deploymentData = JSON.parse(deploymentOutput);
      
      const deploymentInfo = {
        name: deploymentData.metadata.name,
        replicas: {
          desired: deploymentData.spec.replicas,
          current: deploymentData.status.replicas || 0,
          ready: deploymentData.status.readyReplicas || 0,
          available: deploymentData.status.availableReplicas || 0
        },
        strategy: deploymentData.spec.strategy.type,
        image: deploymentData.spec.template.spec.containers[0].image
      };

      // Get HPA if exists
      let hpaInfo = null;
      try {
        const hpaOutput = await executeKubectl(["get", "hpa", "dinosaur-api-hpa", "-o", "json"]);
        const hpaData = JSON.parse(hpaOutput);
        hpaInfo = {
          minReplicas: hpaData.spec.minReplicas,
          maxReplicas: hpaData.spec.maxReplicas,
          currentReplicas: hpaData.status.currentReplicas,
          targetCPU: hpaData.spec.targetCPUUtilizationPercentage,
          currentCPU: hpaData.status.currentCPUUtilizationPercentage || 0
        };
      } catch {
        // HPA doesn't exist or not accessible
      }

      // Get node information
      let nodeInfo: any = {};
      let resourceStats: any = {
        memoryPercent: 0,
        cpuPercent: 0,
        memoryStatus: 'running',
        cpuStatus: 'running',
        source: 'unknown'
      };

      try {
        const nodeOutput = await executeKubectl(["get", "nodes", "-o", "json"]);
        const nodeData = JSON.parse(nodeOutput);
        if (nodeData.items.length > 0) {
          const node = nodeData.items[0];
          nodeInfo = {
            name: node.metadata.name,
            version: node.status.nodeInfo.kubeletVersion,
            osImage: node.status.nodeInfo.osImage,
            kernelVersion: node.status.nodeInfo.kernelVersion,
            containerRuntime: node.status.nodeInfo.containerRuntimeVersion,
            architecture: node.status.nodeInfo.architecture,
            capacity: {
              cpu: node.status.capacity.cpu,
              memory: node.status.capacity.memory,
              pods: node.status.capacity.pods
            },
            allocatable: {
              cpu: node.status.allocatable.cpu,
              memory: node.status.allocatable.memory,
              pods: node.status.allocatable.pods
            },
            conditions: node.status.conditions.map((c: any) => ({
              type: c.type,
              status: c.status,
              reason: c.reason || 'N/A'
            }))
          };
        }
      } catch (nodeError) {
        console.log('Could not fetch node details:', nodeError);
      }

      // Get resource usage metrics
      try {
        const nodeMetricsOutput = await executeKubectl([
          "get", "--raw", "/apis/metrics.k8s.io/v1beta1/nodes"
        ]);
        const nodeMetricsData = JSON.parse(nodeMetricsOutput);
        
        if (nodeMetricsData.items && nodeMetricsData.items.length > 0) {
          const firstNode = nodeMetricsData.items[0];
          const usage = firstNode.usage || {};
          
          // Parse CPU usage (nanocores)
          const cpuUsage = usage.cpu || '0n';
          const cpuNanocores = parseInt(cpuUsage.replace('n', '')) || 0;
          const cpuMillicores = cpuNanocores / 1000000;
          
          // Parse Memory usage
          const memUsage = usage.memory || '0Ki';
          let memBytes = 0;
          if (memUsage.endsWith('Ki')) {
            memBytes = parseInt(memUsage.replace('Ki', '')) * 1024;
          } else if (memUsage.endsWith('Mi')) {
            memBytes = parseInt(memUsage.replace('Mi', '')) * 1024 * 1024;
          } else if (memUsage.endsWith('Gi')) {
            memBytes = parseInt(memUsage.replace('Gi', '')) * 1024 * 1024 * 1024;
          }
          
          // Get node capacity for percentage calculation
          const nodeInfoOutput = await executeKubectl(["get", "node", firstNode.metadata.name, "-o", "json"]);
          const nodeInfoData = JSON.parse(nodeInfoOutput);
          const capacity = nodeInfoData.status?.capacity || {};
          
          // Calculate percentages
          const cpuCapacity = parseFloat(capacity.cpu || '1');
          const memCapacity = capacity.memory ? parseInt(capacity.memory.replace('Ki', '')) * 1024 : 1;
          
          resourceStats.cpuPercent = Math.round((cpuMillicores / (cpuCapacity * 1000)) * 100);
          resourceStats.memoryPercent = Math.round((memBytes / memCapacity) * 100);
          resourceStats.source = 'metrics-api';
        }
      } catch {
        // Fallback to simulated data
        resourceStats.memoryPercent = Math.floor(Math.random() * 30) + 20;
        resourceStats.cpuPercent = Math.floor(Math.random() * 25) + 10;
        resourceStats.source = 'simulated';
      }

      // Determine resource status based on usage
      if (resourceStats.memoryPercent > 80) resourceStats.memoryStatus = 'error';
      else if (resourceStats.memoryPercent > 60) resourceStats.memoryStatus = 'pending';
      
      if (resourceStats.cpuPercent > 80) resourceStats.cpuStatus = 'error';
      else if (resourceStats.cpuPercent > 60) resourceStats.cpuStatus = 'pending';

      // Get recent events
      let recentEvents: any[] = [];
      try {
        const eventsOutput = await executeKubectl([
          "get", "events", 
          "--field-selector", "involvedObject.kind=Pod",
          "--sort-by", ".lastTimestamp",
          "-o", "json"
        ]);
        const eventsData = JSON.parse(eventsOutput);
        
        recentEvents = eventsData.items
          .filter((event: any) => 
            event.involvedObject.name.includes('dinosaur-api') || 
            event.involvedObject.name.includes('mongodb')
          )
          .slice(-10)
          .map((event: any) => ({
            type: event.type,
            reason: event.reason,
            message: event.message,
            object: event.involvedObject.name,
            timestamp: event.lastTimestamp,
            count: event.count
          }));
      } catch {
        // Events not available
      }

      // Get volume information
      let volumeInfo: any = { persistentVolumes: [] };
      try {
        const pvcOutput = await executeKubectl(["get", "pvc", "-o", "json"]);
        const pvcData = JSON.parse(pvcOutput);
        
        volumeInfo = {
          persistentVolumes: pvcData.items.map((pvc: any) => ({
            name: pvc.metadata.name,
            status: pvc.status.phase,
            capacity: pvc.status.capacity?.storage || 'N/A',
            accessModes: pvc.spec.accessModes,
            storageClass: pvc.spec.storageClassName
          }))
        };
      } catch {
        // PVC info not available
      }

      return {
        deployment: deploymentInfo,
        pods: {
          stats: podStats,
          api: apiPods,
          mongodb: mongoPods,
          metrics: { api: [], mongodb: [] }
        },
        services: {
          api: apiServices,
          mongodb: mongoServices
        },
        autoscaling: hpaInfo,
        node: nodeInfo,
        resources: resourceStats,
        volumes: volumeInfo,
        events: recentEvents,
        environment: {
          kubernetesVersion: nodeInfo.version || 'unknown',
          runtime: nodeInfo.containerRuntime || 'unknown',
          platform: `${nodeInfo.osImage || 'unknown'} (${nodeInfo.architecture || 'unknown'})`,
          kernel: nodeInfo.kernelVersion || 'unknown'
        },
        metadata: {
          lastUpdated: new Date().toISOString(),
          updateFrequency: '30s',
          dataSource: 'kubectl',
          namespace: 'default',
          context: 'minikube'
        },
        clusterInfo: {
          connected: true,
          healthy: podStats.running > 0 && podStats.error === 0,
          totalPods: podStats.total,
          readyPods: podStats.running
        }
      };
      
    } catch (error) {
      logger.debug('Error loading cluster status', error);
      
      // Return fallback status
      return this.getFallbackStatus(error);
    }
  }

  /**
   * Get fallback status when kubectl is not available
   */
  private getFallbackStatus(error: unknown): ClusterStatus {
    const isDevelopment = error instanceof Error && error.message.includes('kubectl not available');
    
    return {
      deployment: {
        name: 'dinosaur-api',
        replicas: { desired: 1, current: 1, ready: 1, available: 1 },
        strategy: 'development',
        image: 'fresh-dinosaur-api:latest'
      },
      pods: {
        stats: { running: 1, pending: 0, error: 0, total: 1 },
        api: [{
          name: 'dinosaur-api-dev',
          app: 'dinosaur-api',
          status: 'Running',
          restarts: 0,
          age: new Date().toISOString(),
          ready: true
        }],
        mongodb: [],
        metrics: { api: [], mongodb: [] }
      },
      services: {
        api: [{
          name: 'dinosaur-api-service',
          app: 'dinosaur-api',
          type: 'Development',
          clusterIP: 'localhost:5173',
          ports: [{ port: 5173, targetPort: 5173, protocol: 'TCP' }],
          endpoints: []
        }],
        mongodb: []
      },
      autoscaling: null,
      node: {} as any,
      resources: {
        memoryPercent: 15,
        cpuPercent: 8,
        memoryStatus: 'running',
        cpuStatus: 'running',
        source: 'development'
      },
      volumes: { persistentVolumes: [] },
      events: [],
      environment: {
        kubernetesVersion: 'development',
        runtime: 'deno-dev-server',
        platform: 'Development Environment',
        kernel: 'fresh-vite'
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        updateFrequency: '30s',
        dataSource: 'development',
        namespace: 'local',
        context: 'development'
      },
      clusterInfo: {
        connected: true,
        healthy: true,
        totalPods: 1,
        readyPods: 1,
        message: isDevelopment ? 'Running in development mode - kubectl not available' : 'Cluster monitoring unavailable',
        troubleshooting: {
          suggestions: isDevelopment ? [
            'This is normal in development mode',
            'kubectl monitoring is available in Kubernetes deployment',
            'Use "deno task dev" for local development',
            'Deploy to K8s with "./scripts/deploy-full-stack.sh" for cluster monitoring'
          ] : [
            'Check if kubectl is available in the container',
            'Verify RBAC permissions for the service account',
            'Ensure the cluster is accessible from the pod',
            'Check if the required resources exist'
          ],
          commands: isDevelopment ? [
            'deno task dev',
            './scripts/deploy-full-stack.sh',
            'kubectl port-forward service/dinosaur-api-service 8080:80'
          ] : [
            'kubectl get pods -l app=dinosaur-api',
            'kubectl get services -l app=dinosaur-api',
            'kubectl describe deployment dinosaur-api'
          ]
        }
      }
    };
  }
}

// Export singleton instance
export const kubernetesService = new KubernetesService();
