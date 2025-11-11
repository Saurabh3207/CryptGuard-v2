import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      toast.success('Account created successfully!');
      navigate('/vault');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">First Name</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Last Name</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Password (min 12 characters)</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input input-bordered" required minLength={12} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Confirm Password</span></label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input input-bordered" required />
            </div>
            <button type="submit" className={'btn btn-primary w-full ' + (loading ? 'loading' : '')} disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className="divider">OR</div>
          <p className="text-center">Already have an account? <Link to="/login" className="link link-primary">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
