import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-background flex flex-col">
          <nav className="container flex h-14 items-center">
            <Link to="/">
              <Button variant="ghost" className="font-bold text-xl">
                DevTinder
              </Button>
            </Link>
          </nav>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              
              <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
              
              <div className="bg-muted/50 p-4 rounded-md mb-6 overflow-auto max-h-40 text-left">
                <p className="text-sm font-mono text-muted-foreground">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                
                <Link to="/">
                  <Button variant="outline">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <footer className="border-t py-6 mt-auto">
            <div className="container text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} DevTinder. All rights reserved.
            </div>
          </footer>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
