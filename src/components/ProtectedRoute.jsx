import { useAuth } from '../contexts/Auth';
import Login from '../components/Login';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
