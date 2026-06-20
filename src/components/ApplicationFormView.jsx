import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ApplicationFormView({ projects, defaultProjectId }) {
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setError('กรุณาเลือกโครงการที่ต้องการสมัคร');
      return;
    }
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          resume_url: resumeUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          cover_letter: coverLetter.trim() || null
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'การส่งใบสมัครล้มเหลว');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find(p => p.id === projectId);

  if (submitted) {
    return (
      <div className="public-form-container">
        <div className="form-success-state">
          <div className="form-success-icon">
            <CheckCircle size={36} />
          </div>
          <h2>ส่งใบสมัครสำเร็จเรียบร้อย!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            ขอขอบคุณสำหรับความสนใจร่วมงานกับเรา
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '4px' }}>
            ตำแหน่ง: {selectedProject?.title || 'ตำแหน่งที่คุณสมัคร'}
          </p>
          
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '32px' }}
            onClick={() => {
              setName('');
              setEmail('');
              setPhone('');
              setResumeUrl('');
              setPortfolioUrl('');
              setCoverLetter('');
              setSubmitted(false);
            }}
          >
            ส่งใบสมัครใหม่ / สมัครตำแหน่งอื่น
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-form-container">
      <div className="form-header-banner">
        <h2>ฟอร์มใบสมัครงานออนไลน์</h2>
        <p>กรอกข้อมูลรายละเอียดเพื่อยื่นสมัครงานในตำแหน่งที่ต้องการ</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">เลือกโครงการรับสมัครงานที่ต้องการสมัคร *</label>
          <select 
            className="form-control" 
            value={projectId} 
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!!defaultProjectId}
            required
          >
            <option value="">-- กรุณาเลือกโครงการ --</option>
            {projects.filter(p => p.status === 'open').map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {defaultProjectId && (
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', fontWeight: '500' }}>
              สมัครตำแหน่งงานตามลิงก์โครงการที่เลือกโดยอัตโนมัติ
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">ชื่อ-นามสกุลจริง *</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="กรอกชื่อและนามสกุลของคุณ (จำเป็นต้องระบุ)"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="applicant-details-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
          <div className="form-group">
            <label className="form-label">อีเมล (ไม่บังคับ)</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="example@domain.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="08xxxxxxxx"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">ลิงก์ประวัติย่อ / Resume URL (ไม่บังคับ)</label>
          <input 
            type="url" 
            className="form-control" 
            placeholder="เช่น ลิงก์บน Google Drive, Dropbox, หรือเว็บแนบไฟล์ต่างๆ"
            value={resumeUrl} 
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">ลิงก์ผลงาน / Portfolio URL (ไม่บังคับ)</label>
          <input 
            type="url" 
            className="form-control" 
            placeholder="เช่น GitHub, Behance, หรือเว็บไซต์ส่วนตัว"
            value={portfolioUrl} 
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">ข้อมูลแนะนำตัวสั้นๆ / ข้อความเพิ่มเติม (ไม่บังคับ)</label>
          <textarea 
            className="form-control" 
            rows="5"
            placeholder="แนะนำประวัติความสามารถ ประสบการณ์ หรือสิ่งที่ต้องการแจ้งกับคณะกรรมการพิจารณา..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          ></textarea>
        </div>

        <div style={{ marginTop: '32px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px' }}
            disabled={submitting}
          >
            <Send size={16} /> {submitting ? 'กำลังส่งข้อมูลสมัครงาน...' : 'ยื่นใบสมัครออนไลน์'}
          </button>
        </div>
      </form>
    </div>
  );
}
