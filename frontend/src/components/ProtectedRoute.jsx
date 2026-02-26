import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protected Route - redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
