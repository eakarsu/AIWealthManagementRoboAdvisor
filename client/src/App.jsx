import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Portfolios from './pages/Portfolios';
import Transactions from './pages/Transactions';
import Assets from './pages/Assets';
import Watchlist from './pages/Watchlist';
import Goals from './pages/Goals';
import Alerts from './pages/Alerts';
import Fees from './pages/Fees';
import Documents from './pages/Documents';
import Performance from './pages/Performance';
import AIPortfolioAnalysis from './pages/AIPortfolioAnalysis';
import AIRiskAssessment from './pages/AIRiskAssessment';
import AIInvestmentRecs from './pages/AIInvestmentRecs';
import AIMarketSentiment from './pages/AIMarketSentiment';
import AITaxOptimization from './pages/AITaxOptimization';
import AIRetirementPlanning from './pages/AIRetirementPlanning';
import AIRebalancing from './pages/AIRebalancing';
import AIGoalPlanning from './pages/AIGoalPlanning';
import AIESGAnalysis from './pages/AIESGAnalysis';
import AIEstatePlanning from './pages/AIEstatePlanning';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="portfolios" element={<Portfolios />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="assets" element={<Assets />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="goals" element={<Goals />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="fees" element={<Fees />} />
        <Route path="documents" element={<Documents />} />
        <Route path="performance" element={<Performance />} />
        <Route path="ai/portfolio-analysis" element={<AIPortfolioAnalysis />} />
        <Route path="ai/risk-assessment" element={<AIRiskAssessment />} />
        <Route path="ai/investment-recommendations" element={<AIInvestmentRecs />} />
        <Route path="ai/market-sentiment" element={<AIMarketSentiment />} />
        <Route path="ai/tax-optimization" element={<AITaxOptimization />} />
        <Route path="ai/retirement-planning" element={<AIRetirementPlanning />} />
        <Route path="ai/rebalancing" element={<AIRebalancing />} />
        <Route path="ai/goal-planning" element={<AIGoalPlanning />} />
        <Route path="ai/esg-analysis" element={<AIESGAnalysis />} />
        <Route path="ai/estate-planning" element={<AIEstatePlanning />} />
      </Route>
    </Routes>
  );
}
