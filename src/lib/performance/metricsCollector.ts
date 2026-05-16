// src/lib/performance/metricsCollector.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string | number>;
}

class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private systemMonitorInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = '@performance_metrics_history';
  private isBrowser: boolean;

  constructor() {
    // Check if we're in a browser environment
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    
    if (this.isBrowser) {
      this.startAutoFlush();
      this.setupPerformanceObservers();
      this.startSystemMonitoring();
    }
    this.loadHistoricalMetrics();
  }

  private async loadHistoricalMetrics() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const historical = JSON.parse(stored);
        this.metrics = historical.slice(-500);
        console.log(`[Performance] Loaded ${this.metrics.length} historical metrics`);
      }
    } catch (error) {
      console.error('Failed to load historical metrics:', error);
    }
  }

  private startAutoFlush() {
    if (!this.isBrowser) return;
    
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  private startSystemMonitoring() {
    if (!this.isBrowser) return;
    
    this.systemMonitorInterval = setInterval(async () => {
      await this.collectSystemMetrics();
    }, 10000);
  }

  private async collectSystemMetrics() {
    if (!this.isBrowser) return;
    
    try {
      // Get memory info if available (Chrome only)
      let memoryUsed = 0;
      let totalMemory = 0;
      
      if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
        memoryUsed = (window.performance as any).memory.usedJSHeapSize;
        totalMemory = (window.performance as any).memory.jsHeapSizeLimit;
        console.log('[Performance] Memory API available');
      } else {
        // Estimate based on platform
        memoryUsed = Platform.OS === 'web' ? 50 * 1024 * 1024 : 150 * 1024 * 1024;
        totalMemory = Platform.OS === 'web' ? 512 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
      }
      
      const jsHeapSize = memoryUsed / (1024 * 1024);
      
      this.recordMetric({
        name: 'memory_usage',
        value: memoryUsed / (1024 * 1024),
        unit: 'MB',
        timestamp: Date.now(),
        tags: { 
          type: 'system', 
          total_mb: totalMemory / (1024 * 1024),
          platform: Platform.OS
        }
      });
      
      this.recordMetric({
        name: 'js_heap_size',
        value: jsHeapSize,
        unit: 'MB',
        timestamp: Date.now(),
        tags: { type: 'javascript' }
      });
      
      // Battery API (limited web support)
      if (Platform.OS === 'web' && 'getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          this.recordMetric({
            name: 'battery_level',
            value: battery.level * 100,
            unit: '%',
            timestamp: Date.now(),
            tags: { type: 'system' }
          });
        } catch (err) {
          // Silent fail
        }
      }
      
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  private setupPerformanceObservers() {
    if (!this.isBrowser) return;
    
    this.monitorFetchCalls();
    this.monitorFrameRate();
  }

  private monitorFrameRate() {
    if (!this.isBrowser) return;
    
    let lastFrameTime = Date.now();
    
    const checkFrameRate = () => {
      const now = Date.now();
      const delta = now - lastFrameTime;
      
      if (delta > 100) {
        this.recordMetric({
          name: 'frame_drop',
          value: delta,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { severity: delta > 200 ? 'severe' : 'moderate' }
        });
      }
      
      lastFrameTime = now;
      
      // Only continue if we're still in browser
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(checkFrameRate);
      }
    };
    
    // Check if requestAnimationFrame exists before using it
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(checkFrameRate);
    }
  }

  private monitorFetchCalls() {
    if (!this.isBrowser) return;
    
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          name: 'api_call_duration',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          tags: {
            url: typeof args[0] === 'string' ? args[0].substring(0, 50) : 'fetch',
            method: args[1]?.method || 'GET',
            status: response.status
          }
        });
        
        return response;
      } catch (error) {
        this.recordMetric({
          name: 'api_error',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
          tags: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        throw error;
      }
    };
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.persistMetric(metric);
    
    if (this.metrics.length >= 20) {
      this.flush();
    }
  }

  private async persistMetric(metric: PerformanceMetric) {
    try {
      const existing = await AsyncStorage.getItem(this.STORAGE_KEY);
      const metrics = existing ? JSON.parse(existing) : [];
      metrics.push(metric);
      if (metrics.length > 2000) metrics.shift();
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to persist metric:', error);
    }
  }

  async flush() {
    if (this.metrics.length === 0) return;
    
    try {
      const existing = await AsyncStorage.getItem(this.STORAGE_KEY);
      const allMetrics = existing ? JSON.parse(existing) : [];
      allMetrics.push(...this.metrics);
      const trimmedMetrics = allMetrics.slice(-2000);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedMetrics));
      this.metrics = [];
      console.log(`[Performance] Flushed metrics to storage`);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  async getAllStoredMetrics(): Promise<PerformanceMetric[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored metrics:', error);
      return [];
    }
  }

  calculateThroughput(timeWindowMs: number = 60000): number {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      m => m.name === 'api_call_duration' && (now - m.timestamp) < timeWindowMs
    );
    return recentMetrics.length / (timeWindowMs / 1000);
  }

  calculateAverageResponseTime(): number {
    const responseMetrics = this.metrics.filter(m => m.name === 'api_call_duration');
    if (responseMetrics.length === 0) return 0;
    const sum = responseMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / responseMetrics.length;
  }

  calculateErrorRate(): number {
    const errors = this.metrics.filter(m => m.name === 'api_error').length;
    const total = this.metrics.filter(m => m.name === 'api_call_duration').length;
    return total === 0 ? 0 : (errors / total) * 100;
  }

  async getCurrentSystemMetrics() {
    let memoryUsed = 0;
    let totalMemory = 0;
    
    if (this.isBrowser && typeof window !== 'undefined' && (window.performance as any)?.memory) {
      memoryUsed = (window.performance as any).memory.usedJSHeapSize;
      totalMemory = (window.performance as any).memory.jsHeapSizeLimit;
    }
    
    return {
      memoryUsed: memoryUsed || 100 * 1024 * 1024,
      totalMemory: totalMemory || 2 * 1024 * 1024 * 1024,
      batteryLevel: 0.5,
      freeDiskStorage: 1024 * 1024 * 1024,
      isLowPowerMode: false,
      jsHeapSize: memoryUsed / (1024 * 1024) || 50
    };
  }

  async exportMetrics(): Promise<string> {
    const allMetrics = await this.getAllStoredMetrics();
    return JSON.stringify(allMetrics, null, 2);
  }

  async clearMetrics() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.metrics = [];
      console.log('[Performance] All metrics cleared');
    } catch (error) {
      console.error('Failed to clear metrics:', error);
    }
  }

  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    if (this.systemMonitorInterval) {
      clearInterval(this.systemMonitorInterval);
    }
  }
}

export const metricsCollector = new MetricsCollector();
