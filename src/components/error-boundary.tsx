'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Habits ErrorBoundary] Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    console.log('[Habits ErrorBoundary] User requested retry');
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    console.log('[Habits ErrorBoundary] Full page reload');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--th-bg)', color: 'var(--th-text)' }}
        >
          <div
            className="max-w-md w-full rounded-2xl p-6 border-2 text-center space-y-4"
            style={{
              backgroundColor: 'var(--th-bg-card)',
              borderColor: 'var(--th-danger)',
            }}
          >
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
              <AlertCircle className="h-8 w-8" style={{ color: 'var(--th-danger)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--th-text)' }}>
                Something went wrong
              </h2>
              <p className="text-sm" style={{ color: 'var(--th-text-secondary)' }}>
                An unexpected error occurred. Your progress has been saved automatically.
              </p>
            </div>
            {this.state.error && (
              <div
                className="text-left p-3 rounded-lg text-xs overflow-auto max-h-32"
                style={{
                  backgroundColor: 'var(--th-bg-input)',
                  color: 'var(--th-text-muted)',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--th-accent)',
                  color: 'var(--th-bg)',
                }}
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 font-bold uppercase py-3 rounded-xl border-2 transition-all"
                style={{
                  backgroundColor: 'var(--th-bg-input)',
                  borderColor: 'var(--th-border)',
                  color: 'var(--th-text)',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
