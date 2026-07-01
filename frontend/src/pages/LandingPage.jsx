import ActivityFeed from "../components/landing/ActivityFeed";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import Hero from "../components/landing/Hero";
import QuickActions from "../components/landing/QuickActions";
import SocialProof from "../components/landing/SocialProof";
import Statistics from "../components/landing/Statistics";
import TechnologyPartners from "../components/landing/TechnologyPartners";
import UseCases from "../components/landing/UseCases";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { getRoleHome } from "../utils/roles";

export default function LandingPage() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <div className="route-loading" role="status">Loading your workspace...</div>;
  }

  if (isAuthenticated && ["agent", "admin"].includes(user?.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return (
    <div className="landing-page bg-white dark:bg-slate-900">
      <Hero />
      <QuickActions />
      <Statistics />
      <ActivityFeed />
      <UseCases />
      <SocialProof />
      <TechnologyPartners />
      <CTA />
      <Footer />
    </div>
  );
}
