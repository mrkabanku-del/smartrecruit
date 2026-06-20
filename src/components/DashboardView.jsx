import React from 'react';
import { Briefcase, Users, Calendar, Award, ArrowRight, UserPlus, Clock } from 'lucide-react';

export default function DashboardView({ projects, applicants, interviews, setTab, onSelectApplicant }) {
  // Compute Stats
  const totalProjects = projects.length;
  const openProjects = projects.filter(p => p.status === 'open').length;
  const totalApplicants = applicants.length;
  const interviewedCount = applicants.filter(a => ['interview', 'offer', 'hired'].includes(a.stage)).length;
  const hiredCount = applicants.filter(a => a.stage === 'hired').length;
  
  // Calculate Applicants per Project for Chart
  const projectStats = projects.map(proj => {
    const count = applicants.filter(a => a.project_id === proj.id).length;
    return {
      title: proj.title,
      count: count
    };
  });

  // Maximum value for chart scaling
  const maxCount = Math.max(...projectStats.map(p => p.count), 1);

  // Filter Upcoming Interviews
  const now = new Date();
  const upcomingInterviews = interviews
    .filter(int => new Date(int.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5);

  // Filter Recent Applicants
  const recentApplicants = [...applicants]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return {
      day: d.getDate(),
      month: months[d.getMonth()],
      time: d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };
  };

  return (
    <div>
      {/* Stat Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>โครงการรับสมัครทั้งหมด</p>
            <h3>{totalProjects}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
              เปิดรับอยู่ {openProjects} โครงการ
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>ผู้สมัครทั้งหมด</p>
            <h3>{totalApplicants}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              เฉลี่ย {totalProjects > 0 ? (totalApplicants / totalProjects).toFixed(1) : 0} คน/โครงการ
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>ได้รับการสัมภาษณ์</p>
            <h3>{interviewedCount}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: '600' }}>
              คิดเป็น {totalApplicants > 0 ? ((interviewedCount / totalApplicants) * 100).toFixed(0) : 0}% ของผู้สมัคร
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>รับเข้าทำงานแล้ว (Hired)</p>
            <h3>{hiredCount}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
              ยินดีต้อนรับพนักงานใหม่!
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Charts and Lists Layout */}
      <div className="dashboard-sections">
        {/* Applicants Chart Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} />
              สถิติผู้สมัครแยกตามโครงการ
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setTab('projects')}>
              จัดการโครงการ
            </button>
          </div>
          
          {projectStats.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              ยังไม่มีข้อมูลโครงการรับสมัครงาน
            </div>
          ) : (
            <div className="chart-container">
              {projectStats.map((item, index) => {
                const percentage = (item.count / maxCount) * 80 + 10; // scale between 10% and 90%
                return (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${percentage}%` }}
                      data-value={`${item.count} คน`}
                    ></div>
                    <div className="chart-label" title={item.title}>
                      {item.title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Clock size={18} style={{ color: 'var(--warning)' }} />
              สัมภาษณ์ที่กำลังจะมาถึง
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setTab('calendar')}>
              ดูปฏิทิน
            </button>
          </div>

          <div className="upcoming-list">
            {upcomingInterviews.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center' }}>
                ไม่มีนัดสัมภาษณ์เร็วๆ นี้
              </div>
            ) : (
              upcomingInterviews.map((int) => {
                const dateParts = formatDate(int.scheduled_at);
                return (
                  <div key={int.id} className="upcoming-item">
                    <div className="upcoming-date">
                      <span>{dateParts.day}</span>
                      {dateParts.month}
                    </div>
                    <div className="upcoming-details">
                      <h4>{int.title}</h4>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={10} /> {dateParts.time} ({int.duration_minutes} นาที)
                      </p>
                      <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '500', marginTop: '2px' }}>
                        {int.project_title}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <div className="dashboard-panel" style={{ marginTop: '24px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <UserPlus size={18} style={{ color: 'var(--success)' }} />
            ผู้สมัครล่าสุด
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setTab('kanban')}>
            เปิดบอร์ด Kanban
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>ชื่อผู้สมัคร</th>
                <th style={{ padding: '12px' }}>สมัครตำแหน่งโครงการ</th>
                <th style={{ padding: '12px' }}>อีเมล/เบอร์โทร</th>
                <th style={{ padding: '12px' }}>สถานะขั้นตอน</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {recentApplicants.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    ยังไม่มีข้อมูลผู้สมัคร
                  </td>
                </tr>
              ) : (
                recentApplicants.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{app.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{app.project_title}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      <div>{app.email || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{app.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${
                        app.stage === 'hired' ? 'success' :
                        app.stage === 'rejected' ? 'danger' :
                        app.stage === 'offer' ? 'info' :
                        app.stage === 'interview' ? 'warning' : 'primary'
                      }`}>
                        {app.stage === 'new' ? 'ใบสมัครใหม่' :
                         app.stage === 'screening' ? 'คัดกรองเบื้องต้น' :
                         app.stage === 'interview' ? 'นัดสัมภาษณ์' :
                         app.stage === 'offer' ? 'เสนอจ้าง' :
                         app.stage === 'hired' ? 'รับเข้าทำงาน' : 'ไม่ผ่านการคัดเลือก'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => onSelectApplicant(app)}
                      >
                        ดูรายละเอียด <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
