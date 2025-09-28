// types/index.ts - Shared TypeScript types for the dinosaur application

export interface Dinosaur {
  _id?: string;
  name: string;
  description: string;
}

export interface DinosaurSearchResult {
  dinosaurs: Dinosaur[];
  total: number;
  query?: string;
}

// Kubernetes related types
export interface PodInfo {
  name: string;
  app: string;
  status: string;
  restarts: number;
  age: string;
  ready: boolean;
}

export interface ServiceInfo {
  name: string;
  app: string;
  type: string;
  clusterIP: string;
  ports: Array<{
    port: number;
    targetPort: number;
    protocol: string;
  }>;
  endpoints: Array<unknown>;
}

export interface PodMetric {
  name: string;
  cpu: {
    nanocores?: number;
    millicores?: number;
    cores?: string;
    raw?: string;
  };
  memory: {
    bytes?: number;
    kilobytes?: number;
    megabytes?: number;
    humanReadable?: string;
    raw?: string;
  };
  timestamp?: string;
  window?: string;
  source?: string;
}

export interface DeploymentInfo {
  name: string;
  replicas: {
    desired: number;
    current: number;
    ready: number;
    available: number;
  };
  strategy: string;
  image: string;
}

export interface AutoscalingInfo {
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  targetCPU: number;
  currentCPU: number;
}

export interface NodeInfo {
  name: string;
  version: string;
  osImage: string;
  kernelVersion: string;
  containerRuntime: string;
  architecture: string;
  capacity: {
    cpu: string;
    memory: string;
    pods: string;
  };
  allocatable: {
    cpu: string;
    memory: string;
    pods: string;
  };
  conditions: Array<{
    type: string;
    status: string;
    reason: string;
  }>;
}

export interface ResourceStats {
  memoryPercent: number;
  cpuPercent: number;
  memoryStatus: 'running' | 'pending' | 'error';
  cpuStatus: 'running' | 'pending' | 'error';
  source?: string;
  details?: {
    cpu: {
      usage: { nanocores: number; millicores: number };
      capacity: { cores: number };
      percent: number;
    };
    memory: {
      usage: { bytes: number; humanReadable: string };
      capacity: { bytes: number; humanReadable: string };
      percent: number;
    };
    timestamp: string;
    window: string;
  };
}

export interface VolumeInfo {
  persistentVolumes: Array<{
    name: string;
    status: string;
    capacity: string;
    accessModes: string[];
    storageClass: string;
  }>;
}

export interface KubernetesEvent {
  type: string;
  reason: string;
  message: string;
  object: string;
  timestamp: string;
  count: number;
}

export interface ClusterStatus {
  deployment: DeploymentInfo;
  pods: {
    stats: {
      running: number;
      pending: number;
      error: number;
      total: number;
    };
    api: PodInfo[];
    mongodb: PodInfo[];
    metrics: {
      api: PodMetric[];
      mongodb: PodMetric[];
    };
  };
  services: {
    api: ServiceInfo[];
    mongodb: ServiceInfo[];
  };
  autoscaling: AutoscalingInfo | null;
  node: NodeInfo;
  resources: ResourceStats;
  volumes: VolumeInfo;
  events: KubernetesEvent[];
  environment: {
    kubernetesVersion: string;
    runtime: string;
    platform: string;
    kernel: string;
  };
  metadata: {
    lastUpdated: string;
    updateFrequency: string;
    dataSource: string;
    namespace: string;
    context: string;
  };
  clusterInfo: {
    connected: boolean;
    healthy: boolean;
    totalPods: number;
    readyPods: number;
    error?: string;
    troubleshooting?: {
      suggestions: string[];
      commands: string[];
    };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Environment configuration
export interface AppConfig {
  port: number;
  mongoUri: string;
  isKubernetes: boolean;
  environment: 'development' | 'production' | 'test';
}
