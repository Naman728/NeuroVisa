import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Report from './pages/Report';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Background3D from './components/Background3D';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <>
      <Background3D />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<PageWrapper><Landing /></PageWrapper>} />

            <Route path="login" element={
              <PublicRoute>
                <PageWrapper><Login /></PageWrapper>
              </PublicRoute>
            } />

            <Route path="register" element={
              <PublicRoute>
                <PageWrapper><Register /></PageWrapper>
              </PublicRoute>
            } />

            <Route path="dashboard" element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="interview/:sessionId" element={
              <ProtectedRoute>
                <PageWrapper><Interview /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="report/:sessionId" element={
              <ProtectedRoute>
                <PageWrapper><Report /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
