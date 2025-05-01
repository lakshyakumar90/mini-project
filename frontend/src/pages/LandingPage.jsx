import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Code, Users, Zap, Star, Globe, Shield, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Connect with Developers',
      description: 'Find and connect with like-minded developers worldwide.',
    },
    {
      icon: Code,
      title: 'Collaborate on Projects',
      description: 'Discover exciting projects and collaborate with other developers.',
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

  const benefits = [
    {
      icon: Star,
      title: 'Skill Matching',
      description: 'Our algorithm matches you with developers who complement your skill set.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with developers from around the world, expanding your professional network.',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: "All profiles are verified to ensure you're connecting with real developers.",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container py-20 w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          >
            Connect. Collaborate. Code.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join the community of developers where networking meets collaboration.
            Find your next coding partner or project team today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/signup">
              <Button size="lg" className="mt-4">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg shadow-sm"
            >
              <feature.icon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DevTinder makes it easy to find your perfect coding match in just a few simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', description: 'Sign up and showcase your skills, experience, and project interests.' },
              { step: '02', title: 'Browse Developers', description: 'Explore profiles of developers who match your criteria and project needs.' },
              { step: '03', title: 'Connect & Collaborate', description: 'Send connection requests and start collaborating on exciting projects.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-6 border rounded-lg bg-background"
              >
                <div className="text-5xl font-bold text-primary/20 absolute right-4 top-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3 mt-6">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Developer Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from developers who found their perfect match on DevTinder.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 border rounded-lg bg-background"
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose DevTinder</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique benefits designed specifically for developers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 border rounded-lg bg-background"
              >
                <benefit.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center p-10 border rounded-lg bg-primary/5 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Coding Match?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of developers already connecting and collaborating on exciting projects.
            </p>
            <Link to="/signup">
              <Button size="lg" className="group">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
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
              <Link to='/contact' className="hover:text-foreground">
                Contact Us
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