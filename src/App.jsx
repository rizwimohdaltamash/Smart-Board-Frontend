import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Boards from './pages/Boards';
import Board from './pages/Board';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/boards"
            element={
              <PrivateRoute>
                <Boards />
              </PrivateRoute>
            }
          />
          <Route
            path="/board/:boardId"
            element={
              <PrivateRoute>
                <Board />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/boards" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
