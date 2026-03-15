import React, { Component } from 'react';
import { T } from '../../context/LanguageContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">⚠️</div>
            <h2>Oops!</h2>
            <p className="error-boundary-msg">
              Something went wrong loading this page.
            </p>
            <div className="error-boundary-actions">
              <button className="btn-primary" onClick={this.handleRetry}>
                Try again
              </button>
              <button className="btn-secondary" onClick={() => window.location.hash = '#/'}>
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
