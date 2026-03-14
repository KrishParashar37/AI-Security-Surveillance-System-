import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, push } from 'firebase/database';
import { db, rtdb } from './firebase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CamerasPage from './pages/CamerasPage';
import AlertsPage from './pages/AlertsPage';
import DetectionPage from './pages/DetectionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Authenticated layout with sidebar
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/cameras" element={
        <ProtectedRoute>
          <AppLayout><CamerasPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute>
          <AppLayout><AlertsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/detection" element={
        <ProtectedRoute>
          <AppLayout><DetectionPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><AnalyticsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout><NotificationsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Send a 'hello' message to Firebase Firestore and Realtime Database to test connection
    const sendTestMessage = async () => {
      try {
        // Test Firestore
        const docRef = await addDoc(collection(db, "messages"), {
          text: "hello",
          timestamp: serverTimestamp(),
          source: "Initial App Load"
        });
        console.log("Firestore connected! Document ID: ", docRef.id);

        // Test Realtime Database
        const rtdbRef = push(ref(rtdb, 'messages'));
        await set(rtdbRef, {
          text: "hello",
          timestamp: Date.now(),
          source: "Initial App Load"
        });
        console.log("Realtime Database connected! Message sent.");
      } catch (e) {
        console.error("Error connecting to Firebase: ", e);
      }
    };

    sendTestMessage();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
