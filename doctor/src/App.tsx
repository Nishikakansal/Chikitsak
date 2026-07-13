/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder components for other pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <h2 className="text-2xl font-black uppercase tracking-widest">{title} Page</h2>
    <p className="font-medium">This section is under development.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/patients" element={
          <Layout>
            <Patients />
          </Layout>
        } />
        
        <Route path="/appointments" element={
          <Layout>
            <Appointments />
          </Layout>
        } />
        
        <Route path="/doctors" element={
          <Layout>
            <Doctors />
          </Layout>
        } />
        
        <Route path="/resources" element={
          <Layout>
            <Resources />
          </Layout>
        } />
        
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
