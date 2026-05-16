// src/lib/performance/regressionDetector.ts
import { metricsCollector } from './metricsCollector';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Baseline {
  throughput: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  frameDrops: number;
  timestamp: number;
}

class RegressionDetector {
  private baselines: Map<string, Baseline> = new Map();
  private alertCallbacks: Array<(metric: string, baseline: number, current: number, severity: string) => void> = [];
  private readonly BASELINE_STORAGE_KEY = '@performance_baselines';

  constructor() {
    this.loadBaselines();
  }

  private async loadBaselines() {
    try {
      const stored = await AsyncStorage.getItem(this.BASELINE_STORAGE_KEY);
      if (stored) {
        const baselinesObj = JSON.parse(stored);
        Object.entries(baselinesObj).forEach(([key, value]) => {
          this.baselines.set(key, value as Baseline);
        });
        console.log(`[Performance] Loaded ${this.baselines.size} baselines`);
      }
    } catch (error) {
      console.error('Failed to load baselines:', error);
    }
  }

  private async saveBaselines() {
    try {
      const baselinesObj: Record<string, Baseline> = {};
      this.baselines.forEach((value, key) => {
        baselinesObj[key] = value;
      });
      await AsyncStorage.setItem(this.BASELINE_STORAGE_KEY, JSON.stringify(baselinesObj));
    } catch (error) {
      console.error('Failed to save baselines:', error);
    }
  }

  async setBaseline(version: string) {
    const systemMetrics = await metricsCollector.getCurrentSystemMetrics();
    const baseline: Baseline = {
      throughput: metricsCollector.calculateThroughput(),
      avgResponseTime: metricsCollector.calculateAverageResponseTime(),
      errorRate: metricsCollector.calculateErrorRate(),
      memoryUsage: systemMetrics ? systemMetrics.memoryUsed / (1024 * 1024) : 0,
      frameDrops: metricsCollector.getMetrics().filter(m => m.name === 'frame_drop').length,
      timestamp: Date.now()
    };
    
    this.baselines.set(version, baseline);
    await this.saveBaselines();
    console.log(`[Performance] Baseline set for ${version}:`, baseline);
  }

  async detectRegression(version: string = 'current') {
    const currentBaseline = this.baselines.get(version);
    if (!currentBaseline) {
      console.warn(`No baseline found for ${version}`);
      return false;
    }

    const systemMetrics = await metricsCollector.getCurrentSystemMetrics();
    const currentMetrics = {
      throughput: metricsCollector.calculateThroughput(),
      avgResponseTime: metricsCollector.calculateAverageResponseTime(),
      errorRate: metricsCollector.calculateErrorRate(),
      memoryUsage: systemMetrics ? systemMetrics.memoryUsed / (1024 * 1024) : 0,
      frameDrops: metricsCollector.getMetrics().filter(m => m.name === 'frame_drop').length,
    };

    const regressions = [];

    // Check throughput regression (more than 20% drop)
    const throughputChange = (currentMetrics.throughput - currentBaseline.throughput) / currentBaseline.throughput;
    if (throughputChange < -0.2) {
      regressions.push({
        metric: 'throughput',
        baseline: currentBaseline.throughput,
        current: currentMetrics.throughput,
        change: throughputChange,
        severity: Math.abs(throughputChange) > 0.4 ? 'critical' : 'warning'
      });
    }

    // Check response time regression (more than 20% increase)
    const responseTimeChange = (currentMetrics.avgResponseTime - currentBaseline.avgResponseTime) / currentBaseline.avgResponseTime;
    if (responseTimeChange > 0.2) {
      regressions.push({
        metric: 'avgResponseTime',
        baseline: currentBaseline.avgResponseTime,
        current: currentMetrics.avgResponseTime,
        change: responseTimeChange,
        severity: responseTimeChange > 0.5 ? 'critical' : 'warning'
      });
    }

    // Check error rate regression (more than 50% increase)
    const errorRateChange = currentBaseline.errorRate === 0 && currentMetrics.errorRate > 0 
      ? 1 
      : (currentMetrics.errorRate - currentBaseline.errorRate) / currentBaseline.errorRate;
      
    if (errorRateChange > 0.5) {
      regressions.push({
        metric: 'errorRate',
        baseline: currentBaseline.errorRate,
        current: currentMetrics.errorRate,
        change: errorRateChange,
        severity: errorRateChange > 1 ? 'critical' : 'warning'
      });
    }

    // Check memory regression (more than 30% increase)
    const memoryChange = (currentMetrics.memoryUsage - currentBaseline.memoryUsage) / currentBaseline.memoryUsage;
    if (memoryChange > 0.3) {
      regressions.push({
        metric: 'memoryUsage',
        baseline: currentBaseline.memoryUsage,
        current: currentMetrics.memoryUsage,
        change: memoryChange,
        severity: memoryChange > 0.5 ? 'critical' : 'warning'
      });
    }

    if (regressions.length > 0) {
      console.warn('[Performance Regression Detected]', regressions);
      regressions.forEach(r => {
        this.alertCallbacks.forEach(cb => cb(r.metric, r.baseline, r.current, r.severity));
      });
      return true;
    }

    return false;
  }

  onRegression(callback: (metric: string, baseline: number, current: number, severity: string) => void) {
    this.alertCallbacks.push(callback);
  }

  getPerformanceScore(): number {
    // Calculate overall performance score (0-100)
    const throughput = metricsCollector.calculateThroughput();
    const responseTime = metricsCollector.calculateAverageResponseTime();
    const errorRate = metricsCollector.calculateErrorRate();
    
    let score = 100;
    
    // Deduct for low throughput (target: >10 req/s)
    if (throughput < 10) score -= Math.min(30, (10 - throughput) * 3);
    
    // Deduct for high response time (target: <200ms)
    if (responseTime > 200) score -= Math.min(30, (responseTime - 200) / 10);
    
    // Deduct for errors (target: 0%)
    if (errorRate > 0) score -= Math.min(40, errorRate * 8);
    
    return Math.max(0, Math.min(100, score));
  }

  async getBaselines(): Promise<Record<string, Baseline>> {
    const baselinesObj: Record<string, Baseline> = {};
    this.baselines.forEach((value, key) => {
      baselinesObj[key] = value;
    });
    return baselinesObj;
  }
}

export const regressionDetector = new RegressionDetector();
