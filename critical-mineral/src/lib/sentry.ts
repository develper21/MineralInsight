import * as Sentry from '@sentry/react';
import React from 'react';
import { config } from './config';

// Initialize Sentry only in production and when DSN is available
if (config.security.enableCSP && config.analytics.sentryDsn) {
  Sentry.init({
    dsn: config.analytics.sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: config.dev.mode ? 1.0 : 0.1,
    // Session Replay
    replaysSessionSampleRate: config.dev.mode ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Environment
    environment: config.dev.mode ? 'development' : 'production',
    // Release
    release: config.app.version,
    // beforeSend to filter out sensitive data
    beforeSend: (event) => {
      // Don't send errors in development
      if (config.dev.mode) {
        return null;
      }
      
      // Filter out sensitive URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/\/api\/[^\/]*\/[^\/]*/, '/api/***');
      }
      
      return event;
    },
  });
}

// Error boundary component
export class SentryErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center bg-gray-100',
      }, [
        React.createElement('div', {
          key: 'container',
          className: 'max-w-md mx-auto text-center',
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-gray-900 mb-4',
          }, 'Something went wrong'),
          React.createElement('p', {
            key: 'description',
            className: 'text-gray-600 mb-6',
          }, 'We\'re sorry, but something unexpected happened. Our team has been notified.'),
          React.createElement('button', {
            key: 'reload',
            onClick: () => window.location.reload(),
            className: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }, 'Reload Page'),
        ]),
      ]);
    }

    return this.props.children;
  }
}

// Custom error tracking functions
export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const trackMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user',
    level: 'info',
    data: properties,
  });
};

export const setUserContext = (user: { id: string; email: string; name?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Performance tracking
export const trackPerformance = (name: string, startTime: number) => {
  const duration = performance.now() - startTime;
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    level: 'info',
    data: {
      duration,
      startTime,
    },
  });
};

// API error tracking
export const trackApiError = (url: string, method: string, status: number, error?: any) => {
  Sentry.captureException(new Error(`API Error: ${method} ${url}`), {
    extra: {
      url,
      method,
      status,
      error,
    },
    tags: {
      api_error: 'true',
      status_code: status.toString(),
    },
  });
};

export default Sentry;
