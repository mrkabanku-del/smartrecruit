import React, { useState } from 'react';
import { Plus, Briefcase, ExternalLink, Link as LinkIcon, Check, Copy, Trash2 } from 'lucide-react';


export default function ProjectsView({ projects, applicants, onCreateProject, onDeleteProject }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateProject({
      title,
      description,
      status: 'open'
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  const getApplicationLink = (projectId) => {
    return `${window.location.origin}?apply=${projectId}`;
  };

  const copyToClipboard = (projectId) => {
    const link = getApplicationLink(projectId);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div>
      <div className="project-list-header">
        <h3 style={{ fontSize: '1.15rem' }}>รายการโครงการรับสมัครงานทั้งหมด ({projects.length})</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> เปิดโครงการใหม่
        </button>
      </div>

      <div className="project-grid">
        {projects.map((proj) => {
          const projApplicants = applicants.filter(a => a.project_id === proj.id);
          const activeApplicants = projApplicants.filter(a => a.stage !== 'rejected' && a.stage !== 'hired');
          const hiredCount = projApplicants.filter(a => a.stage === 'hired').length;
          
          return (
            <div key={proj.id} className="project-card">
              <div className="project-card-header">
                <h4 className="project-card-title">{proj.title}</h4>
                <span className={`badge badge-${proj.status === 'open' ? 'success' : 'danger'}`}>
                  {proj.status === 'open' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                </span>
              </div>
              <button 
                className="btn btn-icon" 
                style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-secondary)' }}
                onClick={() => onDeleteProject(proj.id)}
              >
                <Trash2 size={18} />
              </button>
              <p className="project-card-desc">
                {proj.description || 'ไม่มีรายละเอียดโครงการ'}
              </p>

              {proj.status === 'open' && (
                <div className="share-box" style={{ margin: '12px 0 20px 0', padding: '10px 14px' }}>
                  <div className="share-link-text" title={getApplicationLink(proj.id)}>
                    {getApplicationLink(proj.id)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-icon" 
                      style={{ width: '32px', height: '32px', backgroundColor: 'var(--bg-secondary)' }}
                      onClick={() => copyToClipboard(proj.id)}
                      title="คัดลอกลิงก์ฟอร์มรับสมัคร"
                    >
                      {copiedId === proj.id ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                    </button>
                    <a 
                      href={getApplicationLink(proj.id)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-icon"
                      style={{ width: '32px', height: '32px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      title="เปิดฟอร์มใบสมัครหน้าใหม่"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}

              <div className="project-card-stats">
                <div>
                  <strong>{projApplicants.length}</strong> ผู้สมัครทั้งหมด
                </div>
                <div>
                  <strong>{activeApplicants.length}</strong> กำลังพิจารณา
                </div>
                <div>
                  <strong>{hiredCount}</strong> รับเข้าทำงานแล้ว
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>เปิดโครงการรับสมัครใหม่</h3>
              <button className="btn btn-icon" style={{ border: 'none', background: 'none' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อโครงการ / ตำแหน่งงานที่เปิดรับ *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="เช่น Senior React Developer, เจ้าหน้าที่ธุรการ"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">รายละเอียดงานและคุณสมบัติ</label>
                  <textarea 
                    className="form-control" 
                    placeholder="รายละเอียดเกี่ยวกับบทบาทหน้าที่ ความรับผิดชอบ และคุณสมบัติพื้นฐานที่ต้องการ..."
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  สร้างโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
