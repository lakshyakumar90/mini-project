import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Code, Users, Search, Zap, Star, Globe, Shield, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSelector, useDispatch } from 'react-redux';
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
      title: 'Connect with Developers',
      description: 'Find and connect with like-minded developers worldwide.',
    },
    {
      icon: Search,
      title: 'Search Someone with Skills',
      description: 'Search and connect with developers based on their skills and interests.',
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Instant messaging to discuss ideas and share knowledge.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      content: "DevTinder helped me find the perfect collaborator for my React project. The platform is intuitive and the connections I've made are invaluable.",
    },
    {
      name: 'Michael Chen',
      role: 'Full Stack Engineer',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      content: 'I was looking for a backend developer to complement my skills, and within a week of joining DevTinder, I found the perfect match!',
    },
    {
      name: 'Priya Patel',
      role: 'UI/UX Designer',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      content: "As a designer, finding developers who appreciate good design is crucial. DevTinder's community is full of talented professionals who value collaboration.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container py-20 w-full mx-auto">
        <div className="text-center space-y-6 animate-in fade-in duration-700">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-in slide-in-from-bottom-4 duration-700">
            Connect. Chat. Improve.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in slide-in-from-bottom-2 duration-700 delay-200">
            Join the community of developers where networking meets collaboration.
            Find your next coding partner or project team today.
          </p>
          <div className="animate-in slide-in-from-bottom-2 duration-700 delay-400">
            <Link to="/signup">
              <Button size="lg" className="mt-4 transform transition hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 animate-in fade-in duration-700 delay-500">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center text-center space-y-4 p-6 border rounded-lg shadow-sm animate-in slide-in-from-bottom-4 duration-500 delay-${600 + index * 100} hover:-translate-y-1 transition-transform`}
            >
              <feature.icon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container w-full mx-auto">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DevTinder makes it easy to find your perfect coding match in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', description: 'Sign up and showcase your skills, experience, and project interests.' },
              { step: '02', title: 'Browse Developers', description: 'Explore profiles of developers who match your criteria and project needs.' },
              { step: '03', title: 'Connect & Collaborate', description: 'Send connection requests and start collaborating on exciting projects.' },
            ].map((item, index) => (
              <div
                key={item.step}
                className={`relative p-6 border rounded-lg bg-background animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
              >
                <div className="text-5xl font-bold text-primary/20 absolute right-4 top-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3 mt-6">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container w-full mx-auto">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-bold mb-4">Developer Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from developers who found their perfect match on DevTinder.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`p-6 border rounded-lg bg-background animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container w-full mx-auto">
          <div className="text-center p-10 border rounded-lg bg-primary/5 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Coding Match?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of developers already connecting and collaborating on exciting projects.
            </p>
            <Link to="/signup">
              <Button size="lg" className="group transform transition hover:scale-105">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 mt-10">
        <div className="container w-full mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="font-bold text-xl mb-4 md:mb-0">DevTinder</Link>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-8">
            © {new Date().getFullYear()} DevTinder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;