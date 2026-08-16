import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Campaigns from './pages/Campaigns';
import Copilot from './pages/Copilot';
import Analyze from './pages/Analyze';
import AnalysisDetail from './pages/AnalysisDetail';
import PostFeedback from './pages/PostFeedback';
import Cluster from './pages/Cluster';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/copilot" element={<Copilot />} />
                  <Route path="/analyze" element={<Analyze />} />
                  <Route path="/analyze/:id" element={<AnalysisDetail />} />
                  <Route path="/post-feedback" element={<PostFeedback />} />
                  <Route path="/cluster" element={<Cluster />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
