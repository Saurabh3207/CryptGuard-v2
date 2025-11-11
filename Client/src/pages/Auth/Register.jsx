import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserSecret, FaGlobe, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const strengthLevels = [
      { score: 0, label: '', color: '', bgColor: '' },
      { score: 1, label: 'Very Weak', color: 'text-red-400', bgColor: 'bg-red-400' },
      { score: 2, label: 'Weak', color: 'text-orange-400', bgColor: 'bg-orange-400' },
      { score: 3, label: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'text-blue-400', bgColor: 'bg-blue-400' },
      { score: 5, label: 'Very Strong', color: 'text-green-400', bgColor: 'bg-green-400' }
    ];

    return strengthLevels[score];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('Please use a stronger password', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      toast.success('Account created successfully!', {
        icon: '🎉',
        style: { background: '#10B981', color: '#fff' },
      });
      navigate('/vault');
    } catch (error) {
      toast.error(error.message || 'Registration failed', {
        style: { background: '#EF4444', color: '#fff' },
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
            <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-purple-200">Join CryptGuard and secure your files</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white text-sm font-medium">👤 First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white text-sm font-medium">👤 Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

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
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-sm font-medium">🔒 Password (min 12 characters)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                placeholder="••••••••••••"
                required
                minLength={12}
              />
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score ? passwordStrength.bgColor : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.color} font-medium`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-sm font-medium">🔒 Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-purple-400 transition-all duration-300"
                placeholder="••••••••••••"
                required
              />
              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <FaCheckCircle className="text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-400" />
                      <span className="text-xs text-red-400 font-medium">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
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
                  Creating Account...
                </>
              ) : (
                <>
                  🚀 Sign Up
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="divider text-white/40 my-6">OR</div>

          {/* Login Link */}
          <p className="text-center text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 hover:text-purple-200 font-semibold transition-colors">
              Sign In
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

export default Register;
