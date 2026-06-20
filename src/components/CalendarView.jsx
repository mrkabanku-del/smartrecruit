import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Trash2, Plus } from 'lucide-react';

export default function CalendarView({ 
  projects, 
  applicants, 
  interviews, 
  onScheduleInterview, 
  onDeleteInterview 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields State
  const [applicantId, setApplicantId] = useState('');
  const [title, setTitle] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so 0 = Monday if we want Monday start, but let's keep standard 0 = Sunday
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // index of first day (0-6)

  // Get previous month days for padding
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const paddingCellsCount = firstDayIndex; // standard Sunday start

  const calendarCells = [];

  // 1. Previous month padding cells
  for (let i = paddingCellsCount - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }

  // 2. Current month cells
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }

  // 3. Next month padding cells
  const totalCells = 42; // 6 rows * 7 columns
  const nextMonthPadding = totalCells - calendarCells.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    calendarCells.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  // Thai months names
  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Helper to compare dates
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getInterviewsForDate = (date) => {
    return interviews.filter(int => {
      const intDate = new Date(int.scheduled_at);
      return isSameDay(intDate, date);
    });
  };

  const handleCellClick = (cell) => {
    const clickedDate = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(clickedDate);
    
    // Set default values in form
    const monthStr = String(cell.month + 1).padStart(2, '0');
    const dayStr = String(cell.day).padStart(2, '0');
    
    // Auto populate defaults
    setTitle('นัดสัมภาษณ์งาน');
    setShowAddForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!applicantId || !title.trim() || !interviewTime) return;

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const scheduledAt = `${y}-${m}-${d}T${interviewTime}:00`;

    onScheduleInterview({
      applicant_id: applicantId,
      title: title,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(duration),
      notes: notes
    });

    // Reset Form
    setApplicantId('');
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const selectedDateInterviews = getInterviewsForDate(selectedDate);
  const activeApplicants = applicants.filter(a => a.stage !== 'hired' && a.stage !== 'rejected');

  return (
    <div className="calendar-layout">
      {/* Calendar Grid Section */}
      <div className="calendar-card">
        <div className="calendar-header-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={20} style={{ color: 'var(--accent-primary)' }} />
            <span className="calendar-month-title">
              {THAI_MONTHS[month]} {year + 543}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => setCurrentDate(new Date())}>
              วันนี้
            </button>
            <button className="btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((day, idx) => (
            <div key={idx} style={{ color: idx === 0 ? 'var(--danger)' : idx === 6 ? 'var(--accent-primary)' : 'inherit' }}>
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarCells.map((cell, idx) => {
            const cellDate = new Date(cell.year, cell.month, cell.day);
            const cellInterviews = getInterviewsForDate(cellDate);
            const today = new Date();
            
            const cellClass = `calendar-cell 
              ${!cell.isCurrentMonth ? 'other-month' : ''} 
              ${isSameDay(cellDate, today) ? 'today' : ''} 
              ${isSameDay(cellDate, selectedDate) ? 'selected' : ''}`;

            return (
              <div 
                key={idx} 
                className={cellClass}
                onClick={() => handleCellClick(cell)}
                style={isSameDay(cellDate, selectedDate) ? { border: '2px solid var(--accent-primary)', padding: '6px' } : {}}
              >
                <span className="cell-number">{cell.day}</span>
                <div className="cell-events">
                  {cellInterviews.slice(0, 3).map((int) => (
                    <div key={int.id} className="cell-event-dot" title={int.title}>
                      {int.applicant_name}
                    </div>
                  ))}
                  {cellInterviews.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                      +{cellInterviews.length - 3} นัดหมาย
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Details Sidebar */}
      <div className="calendar-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>
            นัดหมายวันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h4>
          {!showAddForm && (
            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowAddForm(true)}>
              <Plus size={12} /> เพิ่มนัดหมาย
            </button>
          )}
        </div>

        {showAddForm ? (
          /* ADD INTERVIEW FORM */
          <form onSubmit={handleFormSubmit} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', marginBottom: '20px' }}>
            <h5 style={{ fontSize: '0.85rem', marginBottom: '12px' }}>นัดหมายสัมภาษณ์ใหม่</h5>
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>ผู้สมัครงาน *</label>
              <select 
                className="form-control" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={applicantId} 
                onChange={(e) => setApplicantId(e.target.value)} 
                required
              >
                <option value="">เลือกผู้สมัคร...</option>
                {activeApplicants.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.project_title})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>หัวข้อนัดสัมภาษณ์ *</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="applicant-details-grid" style={{ marginBottom: '12px', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>เวลา *</label>
                <input 
                  type="time" 
                  className="form-control" 
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  value={interviewTime} 
                  onChange={(e) => setInterviewTime(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>ระยะเวลา</label>
                <select 
                  className="form-control" 
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="30">30 นาที</option>
                  <option value="45">45 นาที</option>
                  <option value="60">1 ชั่วโมง</option>
                  <option value="90">1.5 ชั่วโมง</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>โน้ต / ลิงก์ Zoom</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowAddForm(false)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                บันทึก
              </button>
            </div>
          </form>
        ) : null}

        {/* Interviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
          {selectedDateInterviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              ไม่มีกำหนดการสัมภาษณ์ในวันนี้
            </div>
          ) : (
            selectedDateInterviews.map((int) => (
              <div key={int.id} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '24px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{int.title}</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', position: 'absolute', top: '14px', right: '12px' }}
                    onClick={() => {
                      if (confirm('คุณต้องการลบนัดสัมภาษณ์นี้ใช่หรือไม่?')) {
                        onDeleteInterview(int.id);
                      }
                    }}
                    title="ลบนัดหมาย"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} /> ผู้สมัคร: {int.applicant_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(int.scheduled_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. ({int.duration_minutes} นาที)
                </div>
                {int.notes && (
                  <div style={{ fontSize: '0.75rem', padding: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '4px', marginTop: '4px' }}>
                    {int.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
