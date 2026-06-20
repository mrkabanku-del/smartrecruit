import React, { useState } from 'react';
import { Mail, Phone, ExternalLink, Calendar, Edit, FileText, User, Filter, AlertCircle, Clock, Trash2 } from 'lucide-react';

const STAGES = [
  { id: 'new', title: 'ใบสมัครใหม่', color: 'var(--accent-primary)' },
  { id: 'screening', title: 'คัดกรองเบื้องต้น', color: 'var(--info)' },
  { id: 'interview', title: 'นัดสัมภาษณ์', color: 'var(--warning)' },
  { id: 'offer', title: 'เสนอจ้าง', color: 'var(--accent-secondary)' },
  { id: 'hired', title: 'รับเข้าทำงาน', color: 'var(--success)' },
  { id: 'rejected', title: 'ไม่ผ่าน', color: 'var(--danger)' }
];

export default function KanbanView({ 
  projects, 
  applicants, 
  interviews, 
  onMoveStage, 
  onUpdateApplicant, 
  onScheduleInterview, 
  onDeleteApplicant,
  selectedApplicant, 
  setSelectedApplicant 
}) {
  const [filterProjectId, setFilterProjectId] = useState('');
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  
  // Detail Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editResume, setEditResume] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [editCover, setEditCover] = useState('');
  
  // Interview Schedule Inline States
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewDuration, setInterviewDuration] = useState('60');
  const [interviewNotes, setInterviewNotes] = useState('');

  // Filter Applicants
  const filteredApplicants = filterProjectId
    ? applicants.filter(a => a.project_id === filterProjectId)
    : applicants;

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId && stageId) {
      onMoveStage(appId, stageId);
    }
    setDraggedAppId(null);
    setDragOverStage(null);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  // Open Applicant Detail modal
  const openDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setIsEditing(false);
    setShowScheduleForm(false);
    
    // Set edit values
    setEditName(applicant.name);
    setEditEmail(applicant.email || '');
    setEditPhone(applicant.phone || '');
    setEditResume(applicant.resume_url || '');
    setEditPortfolio(applicant.portfolio_url || '');
    setEditCover(applicant.cover_letter || '');
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    onUpdateApplicant({
      id: selectedApplicant.id,
      name: editName,
      email: editEmail,
      phone: editPhone,
      resume_url: editResume,
      portfolio_url: editPortfolio,
      cover_letter: editCover
    });

    setIsEditing(false);
  };

  // Handle Interview Schedule Submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!interviewTitle.trim() || !interviewDate || !interviewTime) return;

    const scheduledAt = `${interviewDate}T${interviewTime}:00`;
    onScheduleInterview({
      applicant_id: selectedApplicant.id,
      title: interviewTitle,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(interviewDuration),
      notes: interviewNotes
    });

    // Reset Form
    setInterviewTitle('');
    setInterviewDate('');
    setInterviewTime('');
    setInterviewNotes('');
    setShowScheduleForm(false);
  };

  // Get Interviews for currently selected applicant
  const applicantInterviews = selectedApplicant
    ? interviews.filter(i => i.applicant_id === selectedApplicant.id)
    : [];

  const getProjectTitle = (projId) => {
    const proj = projects.find(p => p.id === projId);
    return proj ? proj.title : 'ไม่ระบุโครงการ';
  };

  return (
    <div>
      {/* Controls / Filter Bar */}
      <div className="kanban-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>กรองโครงการ:</span>
          <select 
            className="form-control" 
            style={{ width: '280px', padding: '8px 12px', fontSize: '0.85rem' }}
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
          >
            <option value="">ทั้งหมด ทุกโครงการ ({applicants.length} คน)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({applicants.filter(a => a.project_id === p.id).length} คน)
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          * ลากและวางการ์ดเพื่อเปลี่ยนขั้นตอนการสมัครงาน
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageApps = filteredApplicants.filter(a => a.stage === stage.id);
          
          return (
            <div 
              key={stage.id} 
              className={`kanban-column ${dragOverStage === stage.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={handleDragLeave}
            >
              <div className="column-header">
                <span className="column-title">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stage.color }}></span>
                  {stage.title}
                </span>
                <span className="column-count">{stageApps.length}</span>
              </div>

              <div className="column-cards">
                {stageApps.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', padding: '24px 0', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                    ไม่มีผู้สมัคร
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div 
  key={app.id}
  className="applicant-card"
  draggable
  onDragStart={(e) => handleDragStart(e, app.id)}
  onClick={() => openDetail(app)}
  style={{ position: 'relative' }}
>
  <button className="btn btn-icon" style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-secondary)' }} onClick={(e) => { e.stopPropagation(); onDeleteApplicant(app.id); }}>
    <Trash2 size={16} />
  </button>
                      <h4>{app.name}</h4>
                      <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {getProjectTitle(app.project_id)}
                      </p>
                      
                      <div className="card-tags">
                        {app.phone && <span className="badge badge-info" style={{ padding: '2px 6px', fontSize: '0.65rem' }}><Phone size={8} /></span>}
                        {app.email && <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.65rem' }}><Mail size={8} /></span>}
                        {app.resume_url && <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.65rem' }}><FileText size={8} /></span>}
                      </div>

                      <div className="card-footer">
                        <span>{new Date(app.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                        <span># {app.id.substring(4, 9)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>{selectedApplicant.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    รหัสผู้สมัคร: {selectedApplicant.id}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!isEditing && (
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setIsEditing(true)}>
                    <Edit size={14} /> แก้ไขข้อมูล
                  </button>
                )}
                <button className="btn btn-icon" style={{ border: 'none', background: 'none' }} onClick={() => setSelectedApplicant(null)}>✕</button>
              </div>
            </div>

            <div className="modal-body">
              {isEditing ? (
                /* EDIT FORM */
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label className="form-label">ชื่อ-นามสกุล *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="applicant-details-grid" style={{ marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">อีเมล</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ลิงก์ประวัติย่อ (Resume URL)</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={editResume} 
                        onChange={(e) => setEditResume(e.target.value)} 
                        placeholder="https://example.com/resume"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ลิงก์ผลงาน (Portfolio URL)</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={editPortfolio} 
                        onChange={(e) => setEditPortfolio(e.target.value)} 
                        placeholder="https://example.com/portfolio"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">แนะนำตัว / ประวัติโดยย่อ (Cover Letter)</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      value={editCover} 
                      onChange={(e) => setEditCover(e.target.value)} 
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>ยกเลิก</button>
                    <button type="submit" className="btn btn-primary">บันทึกการแก้ไข</button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY DETAILS */
                <div>
                  <div className="applicant-details-grid">
                    <div className="details-group">
                      <div className="details-label">โครงการรับสมัคร</div>
                      <div className="details-value" style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
                        {getProjectTitle(selectedApplicant.project_id)}
                      </div>
                    </div>
                    <div className="details-group">
                      <div className="details-label">ขั้นตอนการสมัครปัจจุบัน</div>
                      <div className="details-value">
                        <span className={`badge badge-${
                          selectedApplicant.stage === 'hired' ? 'success' :
                          selectedApplicant.stage === 'rejected' ? 'danger' :
                          selectedApplicant.stage === 'offer' ? 'info' :
                          selectedApplicant.stage === 'interview' ? 'warning' : 'primary'
                        }`} style={{ marginTop: '4px' }}>
                          {STAGES.find(s => s.id === selectedApplicant.stage)?.title}
                        </span>
                      </div>
                    </div>
                    <div className="details-group">
                      <div className="details-label">อีเมล</div>
                      <div className="details-value">
                        {selectedApplicant.email ? (
                          <a href={`mailto:${selectedApplicant.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {selectedApplicant.email} <ExternalLink size={12} />
                          </a>
                        ) : '-'}
                      </div>
                    </div>
                    <div className="details-group">
                      <div className="details-label">เบอร์โทรศัพท์</div>
                      <div className="details-value">{selectedApplicant.phone || '-'}</div>
                    </div>
                    <div className="details-group">
                      <div className="details-label">ประวัติย่อ (Resume)</div>
                      <div className="details-value">
                        {selectedApplicant.resume_url ? (
                          <a href={selectedApplicant.resume_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                            <FileText size={14} /> เปิดไฟล์ประวัติ <ExternalLink size={12} />
                          </a>
                        ) : 'ไม่มีลิงก์ประวัติ'}
                      </div>
                    </div>
                    <div className="details-group">
                      <div className="details-label">ผลงาน (Portfolio)</div>
                      <div className="details-value">
                        {selectedApplicant.portfolio_url ? (
                          <a href={selectedApplicant.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            ลิงก์แสดงผลงาน <ExternalLink size={12} />
                          </a>
                        ) : 'ไม่มีลิงก์ผลงาน'}
                      </div>
                    </div>
                    <div className="details-group details-textarea">
                      <div className="details-label">แนะนำตัวเพิ่มเติม (Cover Letter)</div>
                      <div className="details-value" style={{ whiteSpace: 'pre-line', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginTop: '6px', fontSize: '0.9rem' }}>
                        {selectedApplicant.cover_letter || 'ผู้สมัครรายนี้ไม่ได้ระบุข้อมูลแนะนำตัวเพิ่มเติม'}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Interviews History */}
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} /> ประวัติและการนัดหมายสัมภาษณ์ ({applicantInterviews.length})
                      </h4>
                      {!showScheduleForm && (
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => {
                          setInterviewTitle(`สัมภาษณ์รอบแรก - ${selectedApplicant.name}`);
                          setShowScheduleForm(true);
                        }}>
                          + นัดหมายวันสัมภาษณ์
                        </button>
                      )}
                    </div>

                    {showScheduleForm && (
                      <form onSubmit={handleScheduleSubmit} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                        <h5 style={{ fontSize: '0.85rem', marginBottom: '12px' }}>ฟอร์มบันทึกนัดสัมภาษณ์</h5>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>หัวข้อนัดหมายสัมภาษณ์ *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            value={interviewTitle} 
                            onChange={(e) => setInterviewTitle(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="applicant-details-grid" style={{ marginBottom: '12px', gap: '12px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>วันที่นัดหมาย *</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              value={interviewDate} 
                              onChange={(e) => setInterviewDate(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>เวลานัดหมาย *</label>
                            <input 
                              type="time" 
                              className="form-control" 
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              value={interviewTime} 
                              onChange={(e) => setInterviewTime(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>ระยะเวลาการคุย (นาที)</label>
                          <select 
                            className="form-control" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            value={interviewDuration} 
                            onChange={(e) => setInterviewDuration(e.target.value)}
                          >
                            <option value="30">30 นาที</option>
                            <option value="45">45 นาที</option>
                            <option value="60">60 นาที (1 ชั่วโมง)</option>
                            <option value="90">90 นาที</option>
                            <option value="120">120 นาที (2 ชั่วโมง)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>ช่องทางติดต่อ / บันทึก (เช่น ลิงก์ Zoom)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            placeholder="ลิงก์การประชุม Zoom หรือเบอร์คุยสายตรง..."
                            value={interviewNotes} 
                            onChange={(e) => setInterviewNotes(e.target.value)} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                          <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowScheduleForm(false)}>ยกเลิก</button>
                          <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>บันทึกนัดหมาย</button>
                        </div>
                      </form>
                    )}

                    {applicantInterviews.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-light)' }}>
                        ยังไม่มีตารางสัมภาษณ์
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {applicantInterviews.map(int => (
                          <div key={int.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{int.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Clock size={12} /> {new Date(int.scheduled_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น. ({int.duration_minutes} นาที)
                              </div>
                              {int.notes && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', padding: '2px 6px', backgroundColor: 'var(--accent-light)', borderRadius: '4px', display: 'inline-block' }}>
                                  โน้ต: {int.notes}
                                </div>
                              )}
                            </div>
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>รอดำเนินการ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedApplicant(null)}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
