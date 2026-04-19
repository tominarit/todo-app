import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '@clerk/react';
import Navbar from './components/Navbar';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodoListPage from './pages/TodoListPage';

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
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <>
            <Navbar />
            <TodoListPage />
          </>
        </ProtectedRoute>
      } />
      <Route path="/sign-in/*" element={<PublicRoute><SignInPage /></PublicRoute>} />
      <Route path="/sign-up/*" element={<PublicRoute><SignUpPage /></PublicRoute>} />
    </Routes>
  )
};

export default App