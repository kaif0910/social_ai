import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// ── Projects ──
export const getProjects = () => api.get('/projects');
export const runFullAnalysis = (id, redditPostUrl) =>
  api.post(`/projects/${id}/full-analysis`, { redditPostUrl });
export const getProjectAnalysis = (id) => api.get(`/projects/${id}/analysis`);
export const getProjectSummary = (id) => api.get(`/projects/${id}/summary`);
export const getSentimentTrend = (id) =>
  api.get(`/projects/${id}/sentiment-trend`);

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

// ── Roadmap ──
export const generateRoadmap = (clusteredData) =>
  api.post('/roadmap', clusteredData);

export default api;
