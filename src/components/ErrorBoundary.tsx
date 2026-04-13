import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white border-2 border-red-500 m-8 rounded">
          <h1 className="text-xl font-bold text-red-600">App Crashed</h1>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{this.state.error?.toString()}</pre>
          <pre className="mt-2 text-xs text-gray-500">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
