import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-10 max-w-3xl w-full mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using DevTinder, you agree to be bound by these Terms
              of Service and all applicable laws and regulations. If you do not
              agree with any of these terms, you are prohibited from using or
              accessing this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their
              account information and for all activities that occur under their
              account. Users must provide accurate and complete information when
              creating an account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Code of Conduct</h2>
            <p>
              Users must behave professionally and respectfully when interacting
              with other users. Harassment, hate speech, or any form of
              discriminatory behavior will not be tolerated and may result in
              account termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p>
              Users retain ownership of their content but grant DevTinder a license
              to use, display, and distribute content shared on the platform. Users
              must respect intellectual property rights and not share copyrighted
              material without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
            <p>
              DevTinder reserves the right to terminate or suspend accounts that
              violate these terms or engage in harmful behavior. Users may also
              terminate their accounts at any time.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </motion.main>
    </div>
  );
};

export default TermsPage;