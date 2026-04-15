import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '@clerk/react';
import Navbar from './components/Navbar';
import TodoList from './pages/TodoList';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
        <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
      </Routes>
    </>
  )
}

export default App