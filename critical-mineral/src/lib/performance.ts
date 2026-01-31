// Performance monitoring utilities

// Core Web Vitals monitoring
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Performance observer for custom metrics
export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: Map<string, number> = new Map();

  constructor() {
    this.setupObservers();
  }

  private setupObservers() {
    // Monitor navigation timing
    if ('performance' in window) {
      this.observeNavigationTiming();
      this.observeResourceTiming();
      this.observePaintTiming();
      this.observeLayoutShift();
      this.observeLongTasks();
    }
  }

  private observeNavigationTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.set('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            this.metrics.set('loadComplete', navEntry.loadEventEnd - navEntry.loadEventStart);
            this.metrics.set('timeToFirstByte', navEntry.responseStart - navEntry.requestStart);
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Navigation timing observer not supported');
    }
  }

  private observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            const duration = resource.responseEnd - resource.requestStart;
            this.metrics.set(`resource_${resource.name}`, duration);
          }
        }
      });
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing observer not supported');
    }
  }

  private observePaintTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this.metrics.set(entry.name, entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint timing observer not supported');
    }
  }

  private observeLayoutShift() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.set('cumulativeLayoutShift', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Layout shift observer not supported');
    }
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set(`longTask_${entry.startTime}`, entry.duration);
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task observer not supported');
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  clearMetrics() {
    this.metrics.clear();
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Component performance tracking
export const measureComponentRender = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance data
      console.log(`Component ${componentName} rendered in ${duration.toFixed(2)}ms`);
      
      // Send to analytics in production
      if (import.meta.env.PROD && (window as any).gtag) {
        (window as any).gtag('event', 'component_render_time', {
          component_name: componentName,
          duration: Math.round(duration),
        });
      }
      
      return duration;
    }
  };
};

// API performance tracking
export const measureApiCall = async <T>(
  apiCall: () => Promise<T>,
  apiName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    // Log performance data
    console.log(`API call ${apiName} completed in ${duration.toFixed(2)}ms`);
    
    // Send to analytics in production
    if (import.meta.env.PROD && (window as any).gtag) {
      (window as any).gtag('event', 'api_call_time', {
        api_name: apiName,
        duration: Math.round(duration),
        success: true,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    // Log error performance data
    console.error(`API call ${apiName} failed after ${duration.toFixed(2)}ms`, error);
    
    // Send to analytics in production
    if (import.meta.env.PROD && (window as any).gtag) {
      (window as any).gtag('event', 'api_call_time', {
        api_name: apiName,
        duration: Math.round(duration),
        success: false,
      });
    }
    
    throw error;
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
};

// Network performance monitoring
export const monitorNetworkPerformance = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  return null;
};

// Performance scoring
export const calculatePerformanceScore = (metrics: Record<string, number>) => {
  let score = 100;
  
  // First Contentful Paint (FCP) - should be under 1.8s
  const fcp = metrics['first-contentful-paint'] || 0;
  if (fcp > 1800) score -= Math.min(20, (fcp - 1800) / 100);
  
  // Largest Contentful Paint (LCP) - should be under 2.5s
  const lcp = metrics['largest-contentful-paint'] || 0;
  if (lcp > 2500) score -= Math.min(25, (lcp - 2500) / 100);
  
  // Cumulative Layout Shift (CLS) - should be under 0.1
  const cls = metrics['cumulativeLayoutShift'] || 0;
  if (cls > 0.1) score -= Math.min(20, (cls - 0.1) * 200);
  
  // Time to Interactive (TTI) - should be under 3.8s
  const tti = metrics['time-to-interactive'] || 0;
  if (tti > 3800) score -= Math.min(15, (tti - 3800) / 200);
  
  return Math.max(0, Math.round(score));
};

// Performance alerts
export const checkPerformanceThresholds = (metrics: Record<string, number>) => {
  const alerts: string[] = [];
  
  if (metrics['first-contentful-paint'] > 3000) {
    alerts.push('First Contentful Paint is slow (>3s)');
  }
  
  if (metrics['largest-contentful-paint'] > 4000) {
    alerts.push('Largest Contentful Paint is slow (>4s)');
  }
  
  if (metrics['cumulativeLayoutShift'] > 0.25) {
    alerts.push('High Cumulative Layout Shift (>0.25)');
  }
  
  const memoryUsage = getMemoryUsage();
  if (memoryUsage && memoryUsage.used / memoryUsage.limit > 0.9) {
    alerts.push('Memory usage is high (>90% of limit)');
  }
  
  return alerts;
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  const monitor = new PerformanceMonitor();
  
  // Report metrics every 30 seconds in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      const metrics = monitor.getMetrics();
      const score = calculatePerformanceScore(metrics);
      const alerts = checkPerformanceThresholds(metrics);
      
      console.log('Performance Score:', score);
      if (alerts.length > 0) {
        console.warn('Performance Alerts:', alerts);
      }
    }, 30000);
  }
  
  return monitor;
};
