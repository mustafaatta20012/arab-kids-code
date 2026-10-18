import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// i18n initialization
import './i18n/config';

// Layout & Pages
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/layout/WhatsAppButton';
import { SubscriptionBanner } from './components/common/SubscriptionBanner';

// Route guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/routes/AppRoutes';

// Public pages
import { HomePage }        from './pages/HomePage';
import { FreeLessonPage }  from './pages/FreeLessonPage';
import { CurriculumPage }  from './pages/CurriculumPage';
import { InstructorPage }  from './pages/InstructorPage';
import { PricingPage }     from './pages/PricingPage';
import { ContactPage }     from './pages/ContactPage';
import { PrivacyPage }     from './pages/PrivacyPage';
import { LoginPage }       from './pages/LoginPage';

// Protected: student
import { StudentDashboard }    from './pages/student/StudentDashboard';
import { StudentLessonPlayer } from './pages/student/StudentLessonPlayer';
import { StudentProjectsPage } from './pages/student/StudentProjectsPage';

// Protected: parent
import { ParentDashboard } from './pages/parent/ParentDashboard';

// Protected: admin / teacher
import { AdminLayout }         from './pages/admin/AdminLayout';
import { AdminApprovalsPage }  from './pages/admin/AdminApprovalsPage';
import { AdminAnalyticsPage }  from './pages/admin/AdminAnalyticsPage';
import { AdminStudentsPage }   from './pages/admin/AdminStudentsPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminReviewsPage }    from './pages/admin/AdminReviewsPage';
import { AdminAuditLogsPage }  from './pages/admin/AdminAuditLogsPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-cairo text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
          <SubscriptionBanner />
          <Navbar />
          <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
            <Routes>

              {/* ── Public routes ────────────────────────────────────────── */}
              <Route path="/"             element={<HomePage />} />
              <Route path="/lessons/free" element={<FreeLessonPage />} />
              <Route path="/curriculum"   element={<CurriculumPage />} />
              <Route path="/instructor"   element={<InstructorPage />} />
              <Route path="/pricing"      element={<PricingPage />} />
              <Route path="/contact"      element={<ContactPage />} />
              <Route path="/privacy"      element={<PrivacyPage />} />

              {/* ── Guest-only: redirect logged-in users to their dashboard ─ */}
              <Route path="/login" element={
                <GuestRoute><LoginPage /></GuestRoute>
              } />

              {/* ── Protected: student ───────────────────────────────────── */}
              <Route path="/student" element={
                <ProtectedRoute><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/student/lessons/:id" element={
                <ProtectedRoute><StudentLessonPlayer /></ProtectedRoute>
              } />
              <Route path="/student/projects" element={
                <ProtectedRoute><StudentProjectsPage /></ProtectedRoute>
              } />
              <Route path="/lessons/:id" element={
                <ProtectedRoute><StudentLessonPlayer /></ProtectedRoute>
              } />

              {/* ── Protected: parent ────────────────────────────────────── */}
              <Route path="/parent" element={
                <ProtectedRoute><ParentDashboard /></ProtectedRoute>
              } />

              {/* ── Protected: admin / teacher ───────────────────────────── */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index element={<AdminAnalyticsPage />} />
                <Route path="approvals"  element={<AdminApprovalsPage />} />
                <Route path="students"   element={<AdminStudentsPage />} />
                <Route path="submissions" element={<AdminSubmissionsPage />} />
                <Route path="reviews"    element={<AdminReviewsPage />} />
                <Route path="audit"      element={<AdminAuditLogsPage />} />
              </Route>

              {/* ── Legacy redirects ─────────────────────────────────────── */}
              <Route path="/lesson1.html"  element={<Navigate to="/lessons/free" replace />} />
              <Route path="/lesson*.html"  element={<Navigate to="/curriculum"   replace />} />
              <Route path="/index.html"    element={<Navigate to="/"             replace />} />

              {/* ── 404 fallback ─────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />

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
