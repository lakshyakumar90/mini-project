import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Search, Zap, ArrowRight, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Build your network',
      description: 'Connect with developers you actually want to work with.',
    },
    {
      icon: Search,
      title: 'Search by skills',
      description: 'Find people by stacks, roles, and interests in seconds.',
    },
    {
      icon: Zap,
      title: 'Real-time messaging',
      description: 'Start conversations instantly and keep momentum.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="container w-full mx-auto py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
              DevConnect · Professional developer networking
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Find collaborators, not swipes.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A clean, focused platform to discover developers by skills, connect with intent,
              and chat in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Built for teams, hackathons, open-source, and side projects.
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border rounded-2xl p-6 sm:p-8 bg-card">
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">What you can do</div>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    Create a profile with skills and links
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    Search developers by name or stack
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    Connect and message instantly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t">
        <div className="container w-full mx-auto py-14 sm:py-16">
          <div className="flex flex-col gap-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Designed to stay focused</h2>
            <p className="text-muted-foreground max-w-2xl">
              Modern UI, clear actions, and fast workflows—without noise.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="border rounded-2xl p-6 bg-card">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="container w-full mx-auto py-14 sm:py-16">
          <div className="flex flex-col gap-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground max-w-2xl">
              Simple steps from profile to collaboration.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create your profile',
                description: 'Show your skills, interests, and what you want to build.',
              },
              {
                step: '02',
                title: 'Search & connect',
                description: 'Discover developers by name, role, or stack and send a request.',
              },
              {
                step: '03',
                title: 'Chat and build',
                description: 'Message instantly to align on ideas and start collaborating.',
              },
            ].map((item) => (
              <div key={item.step} className="border rounded-2xl p-6 bg-card">
                <div className="text-sm font-medium text-muted-foreground">{item.step}</div>
                <h3 className="mt-3 font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container w-full mx-auto py-14 sm:py-16">
          <div className="border rounded-2xl p-8 sm:p-10 bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Ready to collaborate?</h2>
              <p className="text-muted-foreground max-w-2xl">
                Create your profile and start connecting with developers today.
              </p>
            </div>
            <Link to="/signup">
              <Button size="lg">
                Create an account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 mt-10">
        <div className="container w-full mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="font-bold text-xl mb-4 md:mb-0">DevConnect</Link>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <a
                href="mailto:devtinder93@gmail.com"
                className="hover:text-foreground inline-flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                devtinder93@gmail.com
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-8">
            © {new Date().getFullYear()} DevConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;