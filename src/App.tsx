import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/Feedback';
import { AppShell } from '@/components/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { ProfileSetupPage } from '@/pages/ProfileSetupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SkillAnalyzerPage } from '@/pages/SkillAnalyzerPage';
import { TeamBuilderPage } from '@/pages/TeamBuilderPage';
import { ProjectValidatorPage } from '@/pages/ProjectValidatorPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { FeaturePrioritizerPage } from '@/pages/FeaturePrioritizerPage';
import { PitchPage } from '@/pages/PitchPage';
import { JudgeSimulatorPage } from '@/pages/JudgeSimulatorPage';
import { DocumentationPage } from '@/pages/DocumentationPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AIChatPage } from '@/pages/AIChatPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader message="Loading..." />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageLoader message="Loading..." />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/skill-analyzer" element={<ProtectedRoute><SkillAnalyzerPage /></ProtectedRoute>} />
        <Route path="/team-builder" element={<ProtectedRoute><TeamBuilderPage /></ProtectedRoute>} />
        <Route path="/project-validator" element={<ProtectedRoute><ProjectValidatorPage /></ProtectedRoute>} />
        <Route path="/architecture" element={<ProtectedRoute><ArchitecturePage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/feature-prioritizer" element={<ProtectedRoute><FeaturePrioritizerPage /></ProtectedRoute>} />
        <Route path="/pitch" element={<ProtectedRoute><PitchPage /></ProtectedRoute>} />
        <Route path="/judge-simulator" element={<ProtectedRoute><JudgeSimulatorPage /></ProtectedRoute>} />
        <Route path="/documentation" element={<ProtectedRoute><DocumentationPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AIChatPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
