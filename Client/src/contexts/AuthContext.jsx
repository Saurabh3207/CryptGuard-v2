import { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [masterKey, setMasterKey] = useState(null); // In-memory only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: Check for existing tokens
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedAccessToken && storedRefreshToken) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          
          // Set axios default header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
          
          // Fetch user profile
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry (13 minutes = 780 seconds)
  useEffect(() => {
    if (!accessToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshTokens();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        logout();
      }
    }, 780000); // 13 minutes

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  };

  // Register new user
  const register = async (email, password, firstName, lastName) => {
    try {
      setError(null);

      // Generate master key (256-bit)
      const generatedMasterKey = CryptoJS.lib.WordArray.random(32).toString();
      
      // Encrypt master key with user's password (client-side)
      const encryptedMasterKey = CryptoJS.AES.encrypt(
        generatedMasterKey,
        password
      ).toString();

      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        masterKeyEncrypted: encryptedMasterKey
      });

      if (response.data.success) {
        const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Set state
        setUser(user);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setMasterKey(generatedMasterKey); // Store in memory only
        
        // Set axios header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);

      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Fetch master key from server
        const masterKeyResponse = await apiClient.get('/api/auth/me');
        const encryptedMasterKey = masterKeyResponse.data.data.user.masterKeyEncrypted;
        
        // Decrypt master key with user's password (client-side)
        try {
          const decryptedMasterKey = CryptoJS.AES.decrypt(
            encryptedMasterKey,
            password
          ).toString(CryptoJS.enc.Utf8);
          
          if (!decryptedMasterKey) {
            throw new Error('Invalid password');
          }
          
          // Set state
          setUser(user);
          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          setMasterKey(decryptedMasterKey); // Store in memory only
          
          // Set axios header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          return { success: true, user };
        } catch (decryptError) {
          throw new Error('Failed to decrypt master key');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Refresh tokens
  const refreshTokens = async () => {
    try {
      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Update tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        
        // Update axios header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        return { success: true };
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (accessToken) {
        await apiClient.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setMasterKey(null); // Clear master key from memory
      
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear axios header
      delete apiClient.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    masterKey,
    loading,
    error,
    register,
    login,
    logout,
    refreshTokens,
    isAuthenticated: !!user && !!accessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
