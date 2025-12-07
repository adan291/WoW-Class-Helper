// This file is kept for backwards compatibility
// The main app now uses AppRouter.tsx which routes to:
// - / (HubPage) - Main landing with tool selection
// - /class-helper (ClassHelperApp) - WoW Class Helper
// - /log-analyzer (LogAnalyzerApp) - Azeroth AI Analyst

import { Navigate } from 'react-router-dom';

const App = () => {
  return <Navigate to="/" replace />;
};

export default App;
