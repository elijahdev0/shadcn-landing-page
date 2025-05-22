import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from "./components/Navbar";
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
// import { SignupPage } from './pages/SignupPage'; // Removed SignupPage import
import { CreateEventPage } from './pages/CreateEventPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventDetailPage } from './pages/EventDetailPage'; // Import EventDetailPage
import { NotFoundPage } from './pages/NotFoundPage'; // Import NotFoundPage
import { ProtectedRoute } from './components/ProtectedRoute';
import "./App.css"; // Main app styles

// Layout component to include Navbar, Footer, ScrollToTop
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet /> {/* Child routes will render here */}
    <Footer />
    <ScrollToTop />
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Navbar, Footer, ScrollToTop */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Routes without the main layout (e.g., login, dashboard might have their own full-page layouts) */}
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignupPage />} /> Removed SignupPage route */}
        
        {/* Protected Dashboard Route */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          {/* DashboardPage will be rendered by Outlet in ProtectedRoute if authenticated */}
          {/* Or, if DashboardPage includes its own header/sidebar, it can be directly routed */}
           <Route index element={<DashboardPage />} /> {/* if DashboardPage is the only child */}
          {/* <Route path="" element={<DashboardPage />} /> Alternative if more nested dashboard routes */}
        </Route>

        {/* Protected Create Event Route */}
        <Route path="/create-event" element={<ProtectedRoute />}>
          <Route index element={<CreateEventPage />} />
        </Route>

        {/* Protected Event Detail Page Route */}
        <Route path="/events/:eventId" element={<ProtectedRoute />}>
          <Route index element={<EventDetailPage />} />
        </Route>
        
        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
