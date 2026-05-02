import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded for now, will import directly in Phase 5
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CorpusList from './pages/CorpusList';
import CorpusDetail from './pages/CorpusDetail';
import Learning from './pages/Learning';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="corpus" element={<CorpusList />} />
              <Route path="corpus/:id" element={<CorpusDetail />} />
              <Route path="corpus/:id/learn" element={<Learning />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
