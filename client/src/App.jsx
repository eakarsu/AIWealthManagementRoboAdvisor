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
import AIChurnPrediction from './pages/AIChurnPrediction';
import AIBehavioralCoaching from './pages/AIBehavioralCoaching';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// // === Batch 09 Gaps & Frontend Mounts ===
const MultiGenerationalWealthPlanningWithTrustStructureOptiCfs = React.lazy(() => import('./pages/Batch09/MultiGenerationalWealthPlanningWithTrustStructureOptiCfs'));
const BehavioralFinanceCoachingTrackBiasSuggestInterventionsCfs = React.lazy(() => import('./pages/Batch09/BehavioralFinanceCoachingTrackBiasSuggestInterventionsCfs'));
const RealTimeRebalancingViaOptionsStrategiesCoveredCallsFCfs = React.lazy(() => import('./pages/Batch09/RealTimeRebalancingViaOptionsStrategiesCoveredCallsFCfs'));
const PredictiveClientChurnModelingWithRetentionAiCfs = React.lazy(() => import('./pages/Batch09/PredictiveClientChurnModelingWithRetentionAiCfs'));
const InstitutionalResearchIntegrationForEtfstockFilteringCfs = React.lazy(() => import('./pages/Batch09/InstitutionalResearchIntegrationForEtfstockFilteringCfs'));
const WhiteLabelCoBrandingApiCfs = React.lazy(() => import('./pages/Batch09/WhiteLabelCoBrandingApiCfs'));
const VoiceAdvisoryForNaturalLanguageGoalSettingCfs = React.lazy(() => import('./pages/Batch09/VoiceAdvisoryForNaturalLanguageGoalSettingCfs'));
const AccountanttaxPreparerCollaborationForEndToEndTaxPlanCfs = React.lazy(() => import('./pages/Batch09/AccountanttaxPreparerCollaborationForEndToEndTaxPlanCfs'));
const RegulatoryReportingFormAdvRegBiGapNon = React.lazy(() => import('./pages/Batch09/RegulatoryReportingFormAdvRegBiGapNon'));
const ComplianceAuditTrailAndReviewerQueueGapNon = React.lazy(() => import('./pages/Batch09/ComplianceAuditTrailAndReviewerQueueGapNon'));
const BeneficiaryAndTrustAccountManagementGapNon = React.lazy(() => import('./pages/Batch09/BeneficiaryAndTrustAccountManagementGapNon'));
const ExternalBrokercustodianAccountAggregationGapNon = React.lazy(() => import('./pages/Batch09/ExternalBrokercustodianAccountAggregationGapNon'));
const GranularNotificationPreferenceCenterGapNon = React.lazy(() => import('./pages/Batch09/GranularNotificationPreferenceCenterGapNon'));
const TaxFormGeneration1099K1AndDownloadsGapNon = React.lazy(() => import('./pages/Batch09/TaxFormGeneration1099K1AndDownloadsGapNon'));
const ClientMeetingNotesCrmIntegrationGapNon = React.lazy(() => import('./pages/Batch09/ClientMeetingNotesCrmIntegrationGapNon'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

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
        <Route path="ai/churn-prediction" element={<AIChurnPrediction />} />
        <Route path="ai/behavioral-coaching" element={<AIBehavioralCoaching />} />
      </Route>
    
      {/* // === Batch 09 Gaps & Frontend Mounts === */}
        <Route path="/batch09/cfs/multi-generational-wealth-planning-with-trust-structure-opti" element={<React.Suspense fallback={<div>Loading...</div>}><MultiGenerationalWealthPlanningWithTrustStructureOptiCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/behavioral-finance-coaching-track-bias-suggest-interventions" element={<React.Suspense fallback={<div>Loading...</div>}><BehavioralFinanceCoachingTrackBiasSuggestInterventionsCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/real-time-rebalancing-via-options-strategies-covered-calls-f" element={<React.Suspense fallback={<div>Loading...</div>}><RealTimeRebalancingViaOptionsStrategiesCoveredCallsFCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/predictive-client-churn-modeling-with-retention-ai" element={<React.Suspense fallback={<div>Loading...</div>}><PredictiveClientChurnModelingWithRetentionAiCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/institutional-research-integration-for-etfstock-filtering" element={<React.Suspense fallback={<div>Loading...</div>}><InstitutionalResearchIntegrationForEtfstockFilteringCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/white-label-co-branding-api" element={<React.Suspense fallback={<div>Loading...</div>}><WhiteLabelCoBrandingApiCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/voice-advisory-for-natural-language-goal-setting" element={<React.Suspense fallback={<div>Loading...</div>}><VoiceAdvisoryForNaturalLanguageGoalSettingCfs /></React.Suspense>} />
        <Route path="/batch09/cfs/accountanttax-preparer-collaboration-for-end-to-end-tax-plan" element={<React.Suspense fallback={<div>Loading...</div>}><AccountanttaxPreparerCollaborationForEndToEndTaxPlanCfs /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/regulatory-reporting-form-adv-reg-bi" element={<React.Suspense fallback={<div>Loading...</div>}><RegulatoryReportingFormAdvRegBiGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/compliance-audit-trail-and-reviewer-queue" element={<React.Suspense fallback={<div>Loading...</div>}><ComplianceAuditTrailAndReviewerQueueGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/beneficiary-and-trust-account-management" element={<React.Suspense fallback={<div>Loading...</div>}><BeneficiaryAndTrustAccountManagementGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/external-brokercustodian-account-aggregation" element={<React.Suspense fallback={<div>Loading...</div>}><ExternalBrokercustodianAccountAggregationGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/granular-notification-preference-center" element={<React.Suspense fallback={<div>Loading...</div>}><GranularNotificationPreferenceCenterGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/tax-form-generation-1099-k-1-and-downloads" element={<React.Suspense fallback={<div>Loading...</div>}><TaxFormGeneration1099K1AndDownloadsGapNon /></React.Suspense>} />
        <Route path="/batch09/gap-nonai/client-meeting-notes-crm-integration" element={<React.Suspense fallback={<div>Loading...</div>}><ClientMeetingNotesCrmIntegrationGapNon /></React.Suspense>} />

      </Routes>
  );
}
