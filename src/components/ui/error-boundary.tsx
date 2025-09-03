import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something went wrong. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={this.handleReset}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => (
  <ErrorBoundary fallback={
    <div className="flex items-center justify-center min-h-[200px]">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold">Error occurred</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error?.message || 'Something went wrong'}
          </p>
          {resetError && (
            <Button variant="outline" size="sm" onClick={resetError}>
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  }>
    {null}
  </ErrorBoundary>
);