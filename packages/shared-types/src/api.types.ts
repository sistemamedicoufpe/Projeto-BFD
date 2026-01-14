export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: Date;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: Date;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
  };
  version: string;
}

export interface ApiMetrics {
  requests: {
    total: number;
    success: number;
    failed: number;
  };
  latency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  endpoints: {
    path: string;
    method: string;
    count: number;
    avgLatency: number;
  }[];
}
