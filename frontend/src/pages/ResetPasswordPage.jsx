import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPasswordWithToken, clearPasswordResetState } from '@/store/slices/authSlice';
import Navbar from '@/components/Navbar';

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    passwordResetLoading, 
    passwordResetError, 
    passwordResetSuccess,
    isAuthenticated
  } = useSelector((state) => state.auth);

  // If reset is successful and user is authenticated, redirect to dashboard
  useEffect(() => {
    if (passwordResetSuccess && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [passwordResetSuccess, isAuthenticated, navigate]);

  // Clear password reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPasswordResetState());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setPasswordError('');
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    // Dispatch reset password action
    dispatch(resetPasswordWithToken({ resetToken, password }));
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
            <h1 className="text-3xl font-bold">Reset Your Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your new password below
            </p>
          </div>

          {passwordResetError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordResetError}</AlertDescription>
            </Alert>
          )}
          
          {passwordError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordResetSuccess && !isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary/10 p-6 rounded-lg text-center space-y-4"
            >
              <h2 className="font-semibold text-xl">Password Reset Successful!</h2>
              <p>Your password has been successfully reset.</p>
              <div className="pt-4">
                <Link to="/login">
                  <Button className="w-full">
                    Login with New Password
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={passwordResetLoading}
              >
                {passwordResetLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;
