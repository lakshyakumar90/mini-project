import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="container flex h-14 items-center">
        <Link to="/">
          <Button variant="ghost" className="font-bold text-xl">
            DevTinder
          </Button>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4 animate-in fade-in duration-500">
          <div className="text-9xl font-bold text-primary/20 mb-4 animate-in zoom-in duration-700 delay-200">
            404
          </div>
          
          <h1 className="text-3xl font-bold mb-4 animate-in slide-in-from-bottom-2 duration-500 delay-300">Page Not Found</h1>
          
          <p className="text-muted-foreground mb-8 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-2 duration-500 delay-500">
            <Link to="/">
              <Button className="w-full sm:w-auto transform transition hover:scale-105">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto transform transition hover:scale-105"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="border-t py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="font-bold text-xl mb-4 md:mb-0">DevTinder</div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;
