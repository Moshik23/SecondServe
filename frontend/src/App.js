import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import VendorDashboard from './components/VendorDashboard';
import CustomerApp from './components/CustomerApp';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'vendor' ? '/vendor' : '/customer'} />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/vendor/*" 
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/*" 
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerApp />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
