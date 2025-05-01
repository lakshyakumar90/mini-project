import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-10 max-w-3xl w-full mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an
              account, including your name, email address, and professional
              information. We also collect data about your usage of the platform
              and interactions with other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information to provide and improve our services,
              personalize your experience, facilitate connections between users,
              and send important updates about the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your
              information with other users as part of the platform's core
              functionality and with service providers who assist in operating the
              platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal
              information. However, no method of transmission over the internet is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal
              information. You can also request a copy of your data or opt-out of
              certain data collection practices.
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

export default PrivacyPage;