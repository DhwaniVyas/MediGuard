import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Symptoms from './pages/Symptoms';
import MedicineCompatibility from './pages/MedicineCompatibility';
import Profile from './pages/Profile';
import News from './pages/News';

function Layout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col w-full h-full relative">
        <main className="flex-1 w-full relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/symptoms', element: <Symptoms /> },
          { path: '/medicine', element: <MedicineCompatibility /> },
          { path: '/profile', element: <Profile /> },
          { path: '/news', element: <News /> },
        ]
      },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#1D2D50',
            color: '#fff',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#2AAE8A', secondary: '#fff' } },
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
