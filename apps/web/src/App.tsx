import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// i18n initialization
import './i18n/config';

// Layout & Pages
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { FreeLessonPage } from './pages/FreeLessonPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { InstructorPage } from './pages/InstructorPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentLessonPlayer } from './pages/student/StudentLessonPlayer';
import { StudentProjectsPage } from './pages/student/StudentProjectsPage';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

import { SubscriptionBanner } from './components/common/SubscriptionBanner';
import { useAuthStore } from './lib/auth';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { loadUser } = useAuthStore();

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-cairo text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
          <SubscriptionBanner />
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lessons/free" element={<FreeLessonPage />} />
              <Route path="/lessons/:id" element={<StudentLessonPlayer />} />
              <Route path="/curriculum" element={<CurriculumPage />} />
              <Route path="/instructor" element={<InstructorPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Student & Parent Portals */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/lessons/:id" element={<StudentLessonPlayer />} />
              <Route path="/student/projects" element={<StudentProjectsPage />} />
              <Route path="/parent" element={<ParentDashboard />} />

              {/* Teacher / Admin Dashboard */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminAnalyticsPage />} />
                <Route path="approvals" element={<AdminApprovalsPage />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="submissions" element={<AdminSubmissionsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="audit" element={<AdminAuditLogsPage />} />
              </Route>

              {/* Legacy Prototype Redirects */}
              <Route path="/lesson1.html" element={<Navigate to="/lessons/free" replace />} />
              <Route path="/lesson*.html" element={<Navigate to="/curriculum" replace />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />

              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </QueryClientProvider>
  );
};



export default App;
