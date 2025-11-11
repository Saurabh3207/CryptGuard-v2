import { motion } from 'framer-motion';
import { FaShieldAlt, FaBolt, FaUserSecret, FaGlobe, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaShieldAlt className="text-4xl text-blue-400" />,
      title: 'Enhanced Security',
      description: 'Military-grade encryption protecting your files with blockchain technology',
      borderColor: 'border-blue-500/50',
      bgGradient: 'from-blue-500/10 to-transparent'
    },
    {
      icon: <FaBolt className="text-4xl text-purple-400" />,
      title: 'Fast Access',
      description: 'Lightning-fast file access and sharing with decentralized storage',
      borderColor: 'border-purple-500/50',
      bgGradient: 'from-purple-500/10 to-transparent'
    },
    {
      icon: <FaUserSecret className="text-4xl text-indigo-400" />,
      title: 'Privacy First',
      description: 'Your data remains private and encrypted end-to-end',
      borderColor: 'border-indigo-500/50',
      bgGradient: 'from-indigo-500/10 to-transparent'
    },
    {
      icon: <FaGlobe className="text-4xl text-green-400" />,
      title: '24/7 Availability',
      description: 'Access your files anytime, anywhere with guaranteed uptime',
      borderColor: 'border-green-500/50',
      bgGradient: 'from-green-500/10 to-transparent'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Logo/Title */}
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            CryptGuard
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-semibold text-white mb-4"
          >
            Secure Your Files with CryptGuard
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-purple-200 mb-8"
          >
            Connect your account to get started
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="btn btn-lg text-white border-none shadow-2xl px-8"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            Get Started
            <FaArrowRight className="ml-2" />
          </motion.button>

          {/* Status Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">System Ready</span>
            </div>
            <p className="text-sm text-purple-300">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Sign in here
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`backdrop-blur-lg bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} rounded-2xl p-6 transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-16 text-center text-gray-400 text-sm"
        >
          <p>© 2025 CryptGuard. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Landing;
