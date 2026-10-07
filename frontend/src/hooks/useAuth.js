import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, role, isAuthenticated, loading } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    isAdmin: role === 'ADMIN',
    isStaff: role === 'STAFF',
    isViewer: role === 'VIEWER',
    logout: handleLogout,
  };
};
