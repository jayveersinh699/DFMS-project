import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import OwnerDashboard from './pages/OwnerDashboard';
import RenterMarketplace from './pages/RenterMarketplace';
import Checkout from './pages/Checkout';
import RenterDashboard from './pages/RenterDashboard';

export default function AnimatedRoutes({ user, cars, addCar, handleAuthClick, setRedirectPath }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route 
          path="/" 
          element={
            <PageTransition>
              <Home onAuthClick={handleAuthClick} />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/owner" 
          element={
            <PageTransition>
              {user?.role === 'owner' ? <OwnerDashboard user={user} cars={cars} addCar={addCar} /> : <Navigate to="/" />}
            </PageTransition>
          } 
        />
        
        <Route 
          path="/renter" 
          element={
            <PageTransition>
              <RenterMarketplace cars={cars} user={user} onAuthClick={handleAuthClick} setRedirectPath={setRedirectPath} />
            </PageTransition>
          } 
        />
        
        <Route 
          path="/checkout/:carId" 
          element={
            <PageTransition>
              {user?.role === 'renter' ? <Checkout cars={cars} user={user} /> : <Navigate to="/" />}
            </PageTransition>
          } 
        />
        
        <Route 
          path="/renter/trips" 
          element={
            <PageTransition>
              {user?.role === 'renter' ? <RenterDashboard user={user} /> : <Navigate to="/" />}
            </PageTransition>
          } 
        />

      </Routes>
    </AnimatePresence>
  );
}