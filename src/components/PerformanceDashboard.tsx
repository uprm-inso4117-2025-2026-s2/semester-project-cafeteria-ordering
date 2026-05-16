// src/components/PerformanceDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { metricsCollector } from '@/lib/performance/metricsCollector';

interface MetricSnapshot {
  throughput: number;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  memoryUsed: number;
  totalMemory: number;
  memoryPercentage: number;
  jsHeapSize: number;
  frameDrops: number;
  uptime: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricSnapshot>({
    throughput: 0,
    avgResponseTime: 0,
    errorRate: 0,
    totalRequests: 0,
    memoryUsed: 0,
    totalMemory: 0,
    memoryPercentage: 0,
    jsHeapSize: 0,
    frameDrops: 0,
    uptime: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const updateMetrics = async () => {
    const systemMetrics = await metricsCollector.getCurrentSystemMetrics();
    
    setMetrics({
      throughput: metricsCollector.calculateThroughput(),
      avgResponseTime: metricsCollector.calculateAverageResponseTime(),
      errorRate: metricsCollector.calculateErrorRate(),
      totalRequests: metricsCollector.getMetrics().filter(m => m.name === 'api_call_duration').length,
      memoryUsed: systemMetrics ? systemMetrics.memoryUsed / (1024 * 1024) : 0,
      totalMemory: systemMetrics ? systemMetrics.totalMemory / (1024 * 1024) : 0,
      memoryPercentage: systemMetrics ? (systemMetrics.memoryUsed / systemMetrics.totalMemory) * 100 : 0,
      jsHeapSize: systemMetrics ? systemMetrics.jsHeapSize : 0,
      frameDrops: metricsCollector.getMetrics().filter(m => m.name === 'frame_drop').length,
      uptime: Date.now() - (global as any).__APP_START_TIME__ || 0
    });
    setLoading(false);
  };

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await updateMetrics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Performance Metrics Dashboard</Text>
      <Text style={styles.subtitle}>Real-time system & app performance</Text>
      
      <View style={styles.metricsGrid}>
        {/* API Performance Metrics */}
        <MetricSection title="API Performance">
          <MetricCard
            title="Throughput"
            value={metrics.throughput.toFixed(2)}
            unit="req/s"
            threshold={50}
            currentValue={metrics.throughput}
          />
          
          <MetricCard
            title="Avg Response Time"
            value={metrics.avgResponseTime.toFixed(0)}
            unit="ms"
            threshold={200}
            currentValue={metrics.avgResponseTime}
            inverse
          />
          
          <MetricCard
            title="Error Rate"
            value={metrics.errorRate.toFixed(2)}
            unit="%"
            threshold={2}
            currentValue={metrics.errorRate}
            inverse
          />
          
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests}
            unit="requests"
            threshold={1000}
            currentValue={metrics.totalRequests}
          />
        </MetricSection>

        {/* System Resource Metrics */}
        <MetricSection title="System Resources">
          <MetricCard
            title="Memory Usage"
            value={metrics.memoryUsed.toFixed(0)}
            unit="MB"
            threshold={metrics.totalMemory * 0.7}
            currentValue={metrics.memoryUsed}
          />
          
          <MetricCard
            title="Memory %"
            value={metrics.memoryPercentage.toFixed(1)}
            unit="%"
            threshold={70}
            currentValue={metrics.memoryPercentage}
          />
          
          <MetricCard
            title="JS Heap Size"
            value={metrics.jsHeapSize.toFixed(0)}
            unit="MB"
            threshold={50}
            currentValue={metrics.jsHeapSize}
          />
        </MetricSection>

        {/* Device Status Metrics */}
        <MetricSection title="Device Status">
          <MetricCard
            title="Frame Drops"
            value={metrics.frameDrops}
            unit="drops"
            threshold={10}
            currentValue={metrics.frameDrops}
          />
          
          <MetricCard
            title="Uptime"
            value={(metrics.uptime / 3600000).toFixed(1)}
            unit="hours"
            threshold={24}
            currentValue={metrics.uptime / 3600000}
          />
        </MetricSection>

        {/* Health Status Summary */}
        <View style={styles.healthCard}>
          <Text style={styles.healthTitle}>System Health Status</Text>
          <View style={styles.healthIndicator}>
            <View style={[
              styles.healthDot,
              { backgroundColor: getHealthColor(metrics) }
            ]} />
            <Text style={styles.healthText}>{getHealthStatus(metrics)}</Text>
          </View>
          <Text style={styles.healthRecommendation}>
            {getHealthRecommendation(metrics)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const MetricSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit: string;
  threshold: number;
  currentValue: number;
  inverse?: boolean;
}> = ({ title, value, unit, threshold, currentValue, inverse }) => {
  const isWarning = inverse ? currentValue > threshold : currentValue > threshold;
  const isCritical = inverse ? currentValue > threshold * 1.5 : currentValue > threshold * 1.5;
  
  let statusColor = Colors.primaryGreen;
  if (isCritical) statusColor = '#E53935';
  else if (isWarning) statusColor = Colors.pastelPeach;
  
  return (
    <View style={[styles.card, isWarning && styles.cardWarning, isCritical && styles.cardCritical]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardValueContainer}>
        <Text style={[styles.cardValue, { color: statusColor }]}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
      <Text style={styles.cardThreshold}>
        Threshold: {typeof threshold === 'number' ? threshold.toFixed(0) : threshold}{unit}
      </Text>
      {isWarning && (
        <View style={[styles.warningBadge, isCritical && styles.criticalBadge]}>
          <Text style={styles.warningText}>
            {isCritical ? '🔴 CRITICAL' : '⚠️ Warning'}
          </Text>
        </View>
      )}
    </View>
  );
};

const getHealthColor = (metrics: MetricSnapshot): string => {
  if (metrics.errorRate > 5 || metrics.memoryPercentage > 85) return '#E53935';
  if (metrics.errorRate > 2 || metrics.memoryPercentage > 70) return Colors.pastelPeach;
  return Colors.primaryGreen;
};

const getHealthStatus = (metrics: MetricSnapshot): string => {
  if (metrics.errorRate > 5 || metrics.memoryPercentage > 85) return 'Critical - Needs Immediate Attention';
  if (metrics.errorRate > 2 || metrics.memoryPercentage > 70) return 'Warning - Monitor Closely';
  if (metrics.throughput < 1) return 'Low Activity - App Usage Minimal';
  if (metrics.avgResponseTime > 500) return 'Performance Degradation - Slow Responses';
  return 'Healthy - All Systems Operational';
};

const getHealthRecommendation = (metrics: MetricSnapshot): string => {
  if (metrics.errorRate > 5) return '⚠️ High error rate detected. Check API connectivity and error logging.';
  if (metrics.memoryPercentage > 85) return '💾 Memory pressure detected. Consider optimizing images and clearing caches.';
  if (metrics.avgResponseTime > 500) return '🐌 Slow response times detected. Review database queries and API endpoints.';
  if (metrics.frameDrops > 20) return '📱 Performance degradation. Review render optimizations and list virtualization.';
  if (metrics.throughput < 1 && metrics.totalRequests < 10) return '📊 Low usage detected. Generate more traffic by using the app.';
  return '✅ System is performing well. Continue monitoring.';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.heading,
    fontSize: 24,
    padding: 20,
    paddingBottom: 5,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    paddingHorizontal: 20,
    paddingBottom: 15,
    color: Colors.mutedGray,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.subheading,
    fontSize: 18,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    color: Colors.light.text,
  },
  sectionContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  metricsGrid: {
    paddingBottom: 30,
  },
  card: {
    width: Dimensions.get('window').width / 2 - 25,
    backgroundColor: Colors.pastelSage,
    borderRadius: 12,
    padding: 15,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: Colors.pastelPeach,
  },
  cardCritical: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  cardTitle: {
    ...Typography.subheading,
    fontSize: 14,
    color: Colors.light.alternateText,
    marginBottom: 8,
  },
  cardValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardValue: {
    ...Typography.heading,
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardUnit: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.light.alternateText,
    marginLeft: 5,
    opacity: 0.7,
  },
  cardThreshold: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.light.alternateText,
    opacity: 0.6,
  },
  warningBadge: {
    marginTop: 8,
    backgroundColor: Colors.pastelPeach,
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
  },
  criticalBadge: {
    backgroundColor: '#E53935',
  },
  warningText: {
    ...Typography.button,
    fontSize: 11,
    color: '#fff',
  },
  healthCard: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 12,
    padding: 20,
    margin: 15,
    marginTop: 10,
  },
  healthTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.light.secondaryText,
    marginBottom: 10,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  healthText: {
    ...Typography.subheading,
    fontSize: 16,
    color: Colors.light.secondaryText,
  },
  healthRecommendation: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.secondaryText,
    opacity: 0.9,
    marginTop: 5,
  },
});
