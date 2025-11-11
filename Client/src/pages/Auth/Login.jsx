import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserSecret, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!', {
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      navigate('/vault');
    } catch (error) {
      toast.error(error.message || 'Login failed', {
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #6b21a8 100%)'
    }}>
      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphic Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)'
              }}
            >
              <FaShieldAlt className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-200">Sign in to access your secure vault</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-sm font-medium">📧 Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <div className="flex justify-between items-center mb-2">
                <label className="label-text text-white text-sm font-medium">🔒 Password</label>
                <Link to="/forgot-password" className="text-purple-300 hover:text-purple-200 text-sm transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                placeholder="••••••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn w-full text-white border-none shadow-lg transition-all duration-300"
              style={{
                background: loading ? '#6366f1' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  🛡️ Sign In Securely
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="divider text-white/40 my-6">OR</div>

          {/* Register Link */}
          <p className="text-center text-white/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-8"
        >
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <FaShieldAlt className="text-purple-300 text-2xl mx-auto mb-1" />
            <p className="text-white/80 text-xs font-medium">Secure</p>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <FaUserSecret className="text-purple-300 text-2xl mx-auto mb-1" />
            <p className="text-white/80 text-xs font-medium">Private</p>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center">
            <FaGlobe className="text-purple-300 text-2xl mx-auto mb-1" />
            <p className="text-white/80 text-xs font-medium">24/7 Access</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
