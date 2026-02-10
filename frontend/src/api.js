import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// ── Projects CRUD ──
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ── Project Analysis & Feedback ──
export const runFullAnalysis = (id, redditPostUrl) =>
  api.post(`/projects/${id}/full-analysis`, { redditPostUrl });
export const getProjectAnalysis = (id) => api.get(`/projects/${id}/analysis`);
export const getProjectSummary = (id) => api.get(`/projects/${id}/summary`);
export const getSentimentTrend = (id) =>
  api.get(`/projects/${id}/sentiment-trend`);
export const getProjectFeedback = (id) =>
  api.get(`/projects/${id}/feedback`);

// ── Campaigns ──
export const createCampaign = (data) => api.post('/campaigns', data);
export const generateCampaignReply = (id, comment) =>
  api.post(`/campaigns/${id}/reply`, { comment });

// ── Posts ──
export const generatePost = (campaignId) =>
  api.post(`/posts/${campaignId}/generate`);

// ── Copilot ──
export const copilotGeneratePost = (data) => api.post('/copilot/post', data);
export const copilotGenerateReplies = (data) =>
  api.post('/copilot/replies', data);

// ── Analyze ──
export const runAnalysis = (data) => api.post('/analyze', data);
export const getAnalyses = () => api.get('/analyze');
export const getAnalysisById = (id) => api.get(`/analyze/${id}`);

// ── Post Feedback ──
export const analyzePostFeedback = (data) => api.post('/analyze/post', data);

// ── Cluster ──
export const clusterFeatures = (comments) =>
  api.post('/cluster', { comments });
export const clusterFromUrl = (postUrl) =>
  api.post('/cluster/url', { postUrl });

// ── Roadmap ──
export const generateRoadmap = (clusteredData) =>
  api.post('/roadmap', clusteredData);

export default api;
