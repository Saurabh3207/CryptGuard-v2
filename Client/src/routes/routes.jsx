import { createBrowserRouter, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Home from '../pages/Home';
import Vault from '../pages/Vault';
import HelpSupport from '../components/HelpSupport';
import Register from '../pages/Auth/Register';
import Login from '../pages/Auth/Login';
import ProtectedRoute from '../components/ProtectedRoute';

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/home",
        element: <Home />,
        children: [
          {
            path: "vault",
            element: <Vault />,
          },
          {
            path: "support",
            element: <HelpSupport />,
          },
        ],
      },
      {
        path: "/vault",
        element: <Navigate to="/home/vault" replace />,
      },
    ],
  },
]);
