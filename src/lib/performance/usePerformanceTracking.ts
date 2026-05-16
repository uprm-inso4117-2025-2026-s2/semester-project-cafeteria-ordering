// src/lib/performance/usePerformanceTracking.ts
import { useEffect, useRef } from 'react';
import { metricsCollector } from './metricsCollector';

export function useScreenPerformance(screenName: string) {
  const startTime = useRef(Date.now());
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    // Track time to interactive
    const timeToInteractive = Date.now() - startTime.current;
    metricsCollector.recordMetric({
      name: 'screen_load_time',
      value: timeToInteractive,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { screen: screenName }
    });

    // Track render performance
    const renderTime = Date.now() - mountTime.current;
    metricsCollector.recordMetric({
      name: 'initial_render_time',
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      tags: { screen: screenName, renderCount: renderCount.current }
    });

    return () => {
      const dwellTime = Date.now() - startTime.current;
      metricsCollector.recordMetric({
        name: 'screen_dwell_time',
        value: dwellTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { 
          screen: screenName, 
          renders: renderCount.current,
          totalTime: dwellTime
        }
      });
    };
  }, [screenName]);

  // Track re-renders
  renderCount.current++;
  
  // Track component updates
  useEffect(() => {
    if (renderCount.current > 1) {
      metricsCollector.recordMetric({
        name: 'component_render',
        value: 1,
        unit: 'count',
        timestamp: Date.now(),
        tags: { screen: screenName, renderNumber: renderCount.current }
      });
    }
  });
}
