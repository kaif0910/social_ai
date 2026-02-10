import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
