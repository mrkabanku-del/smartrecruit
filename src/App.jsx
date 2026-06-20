import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Kanban, Calendar, Moon, Sun, RefreshCw, FileText, User } from 'lucide-react';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import ApplicationFormView from './components/ApplicationFormView';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  
  // Public Form Mode Detection
  const [publicApplyProjectId, setPublicApplyProjectId] = useState(null);
  
  // Data States
  const [projects, setProjects] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Check URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const applyProjId = params.get('apply');
    if (applyProjId) {
      setPublicApplyProjectId(applyProjId);
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetches
      const [projRes, appRes, intRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/applicants'),
        fetch('/api/interviews')
      ]);

      if (!projRes.ok || !appRes.ok || !intRes.ok) {
        throw new Error('การเชื่อมต่อกับ Cloudflare APIs ล้มเหลว');
      }

      const projData = await projRes.json();
      const appData = await appRes.json();
      const intData = await intRes.json();

      setProjects(projData);
      setApplicants(appData);
      setInterviews(intData);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบฐานข้อมูล D1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // API Call Handlers
// Delete project handler
  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('ไม่สามารถลบโครงการได้');
      // Optimistically remove from state
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete applicant handler
  const handleDeleteApplicant = async (applicantId) => {
    try {
      const response = await fetch(`/api/applicants?id=${applicantId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('ไม่สามารถลบผู้สมัครได้');
      // Remove from state and also any related interviews
      setApplicants(applicants.filter(a => a.id !== applicantId));
      setInterviews(interviews.filter(i => i.applicant_id !== applicantId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('ไม่สามารถสร้างโครงการใหม่ได้');
      const newProj = await response.json();
      setProjects([newProj, ...projects]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveStage = async (applicantId, newStage) => {
    try {
      const response = await fetch('/api/applicants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicantId, stage: newStage })
      });
      if (!response.ok) throw new Error('ไม่สามารถเปลี่ยนขั้นตอนสถานะผู้สมัครได้');
      
      const updatedApplicant = await response.json();
      
      // Update local state
      setApplicants(applicants.map(app => 
        app.id === applicantId ? { ...app, stage: newStage } : app
      ));

      // Update selected applicant if it's the one currently open
      if (selectedApplicant && selectedApplicant.id === applicantId) {
        setSelectedApplicant({ ...selectedApplicant, stage: newStage });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateApplicant = async (details) => {
    try {
      const response = await fetch('/api/applicants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      if (!response.ok) throw new Error('ไม่สามารถอัปเดตข้อมูลผู้สมัครได้');
      const updatedApp = await response.json();
      
      // Update list
      setApplicants(applicants.map(app => 
        app.id === details.id ? { ...app, ...details } : app
      ));

      // Update active details modal
      if (selectedApplicant && selectedApplicant.id === details.id) {
        setSelectedApplicant({ ...selectedApplicant, ...details });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });
      if (!response.ok) throw new Error('ไม่สามารถบันทึกนัดหมายสัมภาษณ์ได้');
      const newInt = await response.json();
      
      // Since scheduling an interview can promote stages to 'interview', let's reload data
      await fetchData();
      
      // Re-link the updated applicant so details modal shows stage and new interview
      if (selectedApplicant) {
        const freshApp = applicants.find(a => a.id === selectedApplicant.id);
        if (freshApp) setSelectedApplicant(freshApp);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      const response = await fetch(`/api/interviews?id=${interviewId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('ไม่สามารถลบนัดหมายสัมภาษณ์ได้');
      
      setInterviews(interviews.filter(i => i.id !== interviewId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectApplicantFromDashboard = (applicant) => {
    setSelectedApplicant(applicant);
    setTab('kanban');
  };

  // If in Candidate application mode, only render form (Clean, public portal)
  if (publicApplyProjectId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', width: '100%' }}>
        <ApplicationFormView 
          projects={projects} 
          defaultProjectId={publicApplyProjectId === 'new' ? null : publicApplyProjectId} 
        />
      </div>
    );
  }

  // Load and Error handling for Admin Panel
  const renderContent = () => {
    if (loading && projects.length === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
          <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--accent-primary)', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>กำลังดึงข้อมูลจาก Cloudflare Edge...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', padding: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--danger)', fontSize: '1.2rem', fontWeight: '600' }}>เกิดข้อผิดพลาดในการโหลดระบบ</div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px' }}>{error}</p>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid var(--border-color)', textAlign: 'left' }}>
            <strong>คำแนะนำในการเชื่อมต่อฐานข้อมูล:</strong>
            <ul style={{ marginLeft: '18px', marginTop: '6px' }}>
              <li>ตรวจสอบว่ารัน <code>npx wrangler pages dev dist --d1 DB</code> หรือไม่</li>
              <li>ใช้คำสั่ง <code>npx wrangler d1 execute smartrecruit-db --local --file=schema.sql</code> เพื่อสร้างตารางใน D1 เครื่องคอมพิวเตอร์ของคุณ</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={fetchData}>
            <RefreshCw size={14} /> ลองเชื่อมต่อใหม่อีกครั้ง
          </button>
        </div>
      );
    }

    switch (tab) {
      case 'dashboard':
        return (
          <DashboardView 
            projects={projects} 
            applicants={applicants} 
            interviews={interviews} 
            setTab={setTab}
            onSelectApplicant={handleSelectApplicantFromDashboard}
          />
        );
      case 'projects':
        return (
          <ProjectsView 
            projects={projects} 
            applicants={applicants} 
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'kanban':
        return (
          <KanbanView 
          projects={projects} 
          applicants={applicants} 
          onDeleteApplicant={handleDeleteApplicant} 
            interviews={interviews}
            onMoveStage={handleMoveStage}
            onUpdateApplicant={handleUpdateApplicant}
            onScheduleInterview={handleScheduleInterview}
            selectedApplicant={selectedApplicant}
            setSelectedApplicant={setSelectedApplicant}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            projects={projects} 
            applicants={applicants} 
            interviews={interviews}
            onScheduleInterview={handleScheduleInterview}
            onDeleteInterview={handleDeleteInterview}
          />
        );
      default:
        return <div>ไม่พบหน้านี้</div>;
    }
  };

  const getHeaderTitle = () => {
    switch (tab) {
      case 'dashboard': return 'แดชบอร์ดสรุปผลรับสมัครงาน';
      case 'projects': return 'การจัดการโครงการรับสมัครงาน';
      case 'kanban': return 'บอร์ดความคืบหน้าผู้สมัครงาน (Kanban)';
      case 'calendar': return 'ปฏิทินนัดหมายสัมภาษณ์';
      default: return 'SmartRecruit';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">S</div>
          <div className="logo-text">SmartRecruit</div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => { setTab('dashboard'); setSelectedApplicant(null); }}>
              <LayoutDashboard size={18} /> แดชบอร์ดสรุปผล
            </li>
            <li className={`nav-item ${tab === 'projects' ? 'active' : ''}`} onClick={() => { setTab('projects'); setSelectedApplicant(null); }}>
              <Briefcase size={18} /> โครงการรับสมัคร
            </li>
            <li className={`nav-item ${tab === 'kanban' ? 'active' : ''}`} onClick={() => { setTab('kanban'); }}>
              <Kanban size={18} /> บอร์ดผู้สมัคร (Kanban)
            </li>
            <li className={`nav-item ${tab === 'calendar' ? 'active' : ''}`} onClick={() => { setTab('calendar'); setSelectedApplicant(null); }}>
              <Calendar size={18} /> ปฏิทินสัมภาษณ์
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-icon" onClick={toggleTheme} title="เปลี่ยนธีมสว่าง/มืด">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            v1.0.0
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-content">
        <header className="header">
          <h2 className="header-title">{getHeaderTitle()}</h2>
          <div className="header-actions">
            {/* Quick Share Link for Form */}
            <a 
              href={`${window.location.origin}?apply=new`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={14} /> เปิดฟอร์มรับสมัครงาน (แชร์ได้)
            </a>
            
            <button className="btn-icon" onClick={fetchData} title="รีเฟรชข้อมูล">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
