import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
      toast.success('Welcome back!');
      navigate('/vault');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center mb-6">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Password</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input input-bordered" required />
            </div>
            <button type="submit" className={'btn btn-primary w-full ' + (loading ? 'loading' : '')} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="divider">OR</div>
          <p className="text-center">Don't have an account? <Link to="/register" className="link link-primary">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
