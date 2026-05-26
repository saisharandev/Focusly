import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/ui/ErrorBoundary'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/Dashboard'
import SessionSetup from './pages/session/SessionSetup'
import SessionActive from './pages/session/SessionActive'
import RoomsBrowse from './pages/rooms/RoomsBrowse'
import RoomCreate from './pages/rooms/RoomCreate'
import RoomView from './pages/rooms/RoomView'

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
            } />
            <Route path="/session/new" element={
              <ProtectedRoute><AppLayout><SessionSetup /></AppLayout></ProtectedRoute>
            } />
            {/* Session active has its own full-screen layout */}
            <Route path="/session/active" element={
              <ProtectedRoute><SessionActive /></ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute><AppLayout><RoomsBrowse /></AppLayout></ProtectedRoute>
            } />
            <Route path="/rooms/create" element={
              <ProtectedRoute><AppLayout><RoomCreate /></AppLayout></ProtectedRoute>
            } />
            {/* Room view has its own full-height layout */}
            <Route path="/rooms/:id" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-bg-base lg:pl-60">
                  <RoomView />
                </div>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
