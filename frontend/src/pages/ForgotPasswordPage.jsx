import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { forgotPasswordRequest, clearPasswordResetState } from '@/store/slices/authSlice';
import Navbar from '@/components/Navbar';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const dispatch = useDispatch();
  const { 
    passwordResetLoading, 
    passwordResetError, 
    passwordResetSuccess, 
    passwordResetToken 
  } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPasswordRequest(email))
      .then((resultAction) => {
        if (forgotPasswordRequest.fulfilled.match(resultAction)) {
          setEmailSent(true);
        }
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md mx-auto pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {passwordResetError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordResetError}</AlertDescription>
            </Alert>
          )}

          {emailSent && passwordResetSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary/10 p-6 rounded-lg text-center space-y-4"
            >
              <h2 className="font-semibold text-xl">Reset Link Sent!</h2>
              <p>
                We've sent a password reset link to <span className="font-medium">{email}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your email and follow the instructions to reset your password.
              </p>
              
              {/* In a real app, you wouldn't display the token directly */}
              {passwordResetToken && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">For demo purposes only:</p>
                  <p className="text-xs break-all">
                    Reset Token: <span className="font-mono">{passwordResetToken}</span>
                  </p>
                  <p className="text-xs mt-2">
                    <Link to={`/reset-password/${passwordResetToken}`} className="text-primary hover:underline">
                      Click here to reset your password
                    </Link>
                  </p>
                </div>
              )}
              
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={passwordResetLoading}
              >
                {passwordResetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center pt-4">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
