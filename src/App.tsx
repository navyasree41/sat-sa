import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LoadingState, ErrorState } from './components/LoadingAndError';
import { OverviewView } from './views/OverviewView';
import { SocAssessmentsView } from './views/SocAssessmentsView';
import { InvestigationIntegrityView } from './views/InvestigationIntegrityView';
import { KpiEvidenceView } from './views/KpiEvidenceView';
import { SayDoGapView } from './views/SayDoGapView';
import { DetectionCoverageView } from './views/DetectionCoverageView';
import { SupervisoryQueueView } from './views/SupervisoryQueueView';
import { ExaminerWorkspaceView } from './views/ExaminerWorkspaceView';
import { api } from './services/api';
import {
  OverviewData,
  SOCSummary,
  InvestigationAnalysis,
  KPIEvidenceData,
  SayDoData,
  DetectionCoverageData,
  SupervisoryQueueData,
  AssessmentPeriod,
  UserRole
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedSoc, setSelectedSoc] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<AssessmentPeriod>('90');
  const [selectedRole, setSelectedRole] = useState<UserRole>('NCIIPC Senior Supervisor');
  const [socList, setSocList] = useState<SOCSummary[]>([]);

  // Data cache
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [investigationData, setInvestigationData] = useState<InvestigationAnalysis | null>(null);
  const [kpiData, setKpiData] = useState<KPIEvidenceData | null>(null);
  const [sayDoData, setSayDoData] = useState<SayDoData | null>(null);
  const [detectionData, setDetectionData] = useState<DetectionCoverageData | null>(null);
  const [supervisoryData, setSupervisoryData] = useState<SupervisoryQueueData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestTabRequest = useRef(0);

  // Fetch initial SOC summaries list for current period
  const loadSocs = useCallback(async (period: AssessmentPeriod) => {
    try {
      const socs = await api.getSocs(period);
      setSocList(socs);
    } catch (err: any) {
      console.warn('Could not load SOCs list:', err);
    }
  }, []);

  // Fetch data for the currently active tab
  const loadTabData = useCallback(
    async (tab: NavTab, socId: string, period: AssessmentPeriod, showRefreshSpinner = false) => {
      const requestId = ++latestTabRequest.current;
      if (showRefreshSpinner) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        if (tab === 'overview' || tab === 'examiner_workspace') {
          const overviewPromise = api.getOverview(socId, period);
          const investigationPromise = tab === 'examiner_workspace'
            ? api.getInvestigations(socId, period, 'ALL', '', 150)
            : null;
          const res = await overviewPromise;
          if (requestId !== latestTabRequest.current) return;
          setOverviewData(res);
          if (tab === 'examiner_workspace') {
            const investigationRes = await investigationPromise!;
            if (requestId !== latestTabRequest.current) return;
            setInvestigationData(investigationRes);
          }
        } else if (tab === 'soc_assessments') {
          const res = await api.getSocs(period);
          if (requestId !== latestTabRequest.current) return;
          setSocList(res);
        } else if (tab === 'investigation_integrity') {
          const res = await api.getInvestigations(socId, period, 'ALL', '', 150);
          if (requestId !== latestTabRequest.current) return;
          setInvestigationData(res);
        } else if (tab === 'kpi_evidence') {
          const res = await api.getKpiEvidence(socId, period);
          if (requestId !== latestTabRequest.current) return;
          setKpiData(res);
        } else if (tab === 'say_do') {
          const res = await api.getSayDoGaps(socId, period);
          if (requestId !== latestTabRequest.current) return;
          setSayDoData(res);
        } else if (tab === 'detection_coverage') {
          const res = await api.getDetectionCoverage(socId, period);
          if (requestId !== latestTabRequest.current) return;
          setDetectionData(res);
        } else if (tab === 'supervisory_queue') {
          const res = await api.getSupervisoryQueue(socId, period);
          if (requestId !== latestTabRequest.current) return;
          setSupervisoryData(res);
        }
      } catch (err: any) {
        console.error(`Error loading data for ${tab}:`, err);
        setErrorMessage(
          err.message || 'Failed to communicate with Flask analytics service.'
        );
      } finally {
        if (requestId === latestTabRequest.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  // On mount and when period changes: reload SOC list
  useEffect(() => {
    loadSocs(selectedPeriod);
  }, [loadSocs, selectedPeriod]);

  // When tab, selectedSoc, or selectedPeriod changes, load that tab's data
  useEffect(() => {
    loadTabData(activeTab, selectedSoc, selectedPeriod);
  }, [activeTab, selectedSoc, selectedPeriod, loadTabData]);

  const handleManualRefresh = () => {
    loadTabData(activeTab, selectedSoc, selectedPeriod, true);
    loadSocs(selectedPeriod);
  };

  const handleSelectSocScope = (socId: string) => {
    setSelectedSoc(socId);
  };

  const handleSelectPeriod = (period: AssessmentPeriod) => {
    setSelectedPeriod(period);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setActiveTab(role === 'NCIIPC Examiner' ? 'examiner_workspace' : 'overview');
  };

  // Called after a finding is reviewed, completed, or reopened
  const handleFindingUpdated = async () => {
    try {
      const [ovRes, sqRes] = await Promise.all([
        api.getOverview(selectedSoc, selectedPeriod),
        api.getSupervisoryQueue(selectedSoc, selectedPeriod)
      ]);
      setOverviewData(ovRes);
      setSupervisoryData(sqRes);
    } catch (err) {
      console.error('Error refreshing finding state:', err);
    }
  };

  const handleInspectInvestigation = (investigationId: string) => {
    setActiveTab('investigation_integrity');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar: Strict requirements - ONLY the 7 specified tabs and Prototype footer */}
      <Sidebar
        activeTab={activeTab}
        currentUserRole={selectedRole}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        queueCount={overviewData?.priority_findings_count || supervisoryData?.total_active || 4}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TopNav with Global SOC Scope, Assessment Period, and Role Switcher */}
        <TopNav
          selectedSoc={selectedSoc}
          onSelectSoc={handleSelectSocScope}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          socList={socList}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <LoadingState message={`Loading ${activeTab.replace('_', ' ')} data from Python Flask backend...`} />
            ) : errorMessage ? (
              <ErrorState error={errorMessage} onRetry={handleManualRefresh} />
            ) : (
              <>
                {activeTab === 'examiner_workspace' && overviewData && investigationData && (
                  <ExaminerWorkspaceView
                    overviewData={overviewData}
                    investigationData={investigationData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {activeTab === 'overview' && overviewData && (
                  <OverviewView
                    data={overviewData}
                    onNavigateTab={setActiveTab}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                    currentUserRole={selectedRole}
                    onFindingUpdated={handleFindingUpdated}
                    onInspectInvestigation={handleInspectInvestigation}
                  />
                )}

                {activeTab === 'soc_assessments' && (
                  <SocAssessmentsView
                    socList={socList}
                    selectedPeriod={selectedPeriod}
                    onSelectSocScope={handleSelectSocScope}
                  />
                )}

                {activeTab === 'investigation_integrity' && investigationData && (
                  <InvestigationIntegrityView
                    data={investigationData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                  />
                )}

                {activeTab === 'kpi_evidence' && kpiData && (
                  <KpiEvidenceView
                    data={kpiData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                  />
                )}

                {activeTab === 'say_do' && sayDoData && (
                  <SayDoGapView
                    data={sayDoData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                  />
                )}

                {activeTab === 'detection_coverage' && detectionData && (
                  <DetectionCoverageView
                    data={detectionData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                  />
                )}

                {activeTab === 'supervisory_queue' && supervisoryData && (
                  <SupervisoryQueueView
                    data={supervisoryData}
                    selectedSoc={selectedSoc}
                    selectedPeriod={selectedPeriod}
                    currentUserRole={selectedRole}
                    onFindingUpdated={handleFindingUpdated}
                    onInspectInvestigation={handleInspectInvestigation}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
