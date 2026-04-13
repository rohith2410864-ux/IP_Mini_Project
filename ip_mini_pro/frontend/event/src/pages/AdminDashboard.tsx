import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/axios';
import type { AdminStats, Event } from '../types/models';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { CSSProperties } from 'react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: string;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);

  const navigate = useNavigate();

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get<AdminStats>('/admin/dashboard/stats'),
        api.get<Event[]>('/events'),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(loadData, 10000);
    return () => window.clearInterval(interval);
  }, [loadData]);

  const handleSelectEvent = (event: { id: string }): void => {
    navigate(`/admin/manage-events?id=${event.id}`);
  };

  const calendarEvents: CalendarEvent[] = events.map((event) => ({
    id: event._id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.startDate),
    allDay: false,
    resource: event.type,
  }));

  const eventPropGetter = (event: CalendarEvent): { style: CSSProperties } => {
    const backgroundColor = event.resource === 'department' ? '#f59e0b' : '#0b4f9f';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        display: 'block',
        cursor: 'pointer',
      },
    };
  };

  if (loading && !stats) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-page-container">
      <header className="admin-header">
        <h1 className="admin-main-title">System Overview</h1>
        <p className="admin-subtitle">Real-time statistics and event roadmap</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-effect clickable" onClick={() => navigate('/admin/manage-events')}>
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <span className="stat-label">Total Events</span>
            <h2 className="stat-value">{stats?.totalEvents || 0}</h2>
          </div>
        </div>

        <div className="stat-card glass-effect clickable" onClick={() => navigate('/admin/participants')}>
          <div className="stat-icon green">👥</div>
          <div className="stat-info">
            <span className="stat-label">Registrations</span>
            <h2 className="stat-value">{stats?.totalParticipants || 0}</h2>
          </div>
        </div>

        <div className="stat-card glass-effect clickable" onClick={() => setShowDeptModal(true)}>
          <div className="stat-icon orange">🏢</div>
          <div className="stat-info">
            <span className="stat-label">Active Depts</span>
            <h2 className="stat-value">{stats?.departmentParticipation?.length || 0}</h2>
            <span className="stat-subtext">Tap to view details</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="calendar-section glass-card">
          <div className="card-header">
            <h2 className="card-title">Event Roadmap</h2>
            <div className="legend">
              <span className="legend-item">
                <i className="dot common"></i> Common
              </span>
              <span className="legend-item">
                <i className="dot dept"></i> Dept
              </span>
            </div>
          </div>
          <div className="calendar-wrapper">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleSelectEvent}
              style={{ height: 600 }}
              views={['month', 'week', 'day']}
            />
          </div>
        </div>
      </div>

      {showDeptModal && (
        <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px' }}
          >
            <div
              className="modal-header"
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}
            >
              <h3 style={{ margin: 0 }}>Department Stats</h3>
              <button
                onClick={() => setShowDeptModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="dept-list">
              {stats?.departmentParticipation && stats.departmentParticipation.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Department</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.departmentParticipation.map((dept, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: '500' }}>
                          {dept.department || 'Unknown'}
                        </td>
                        <td
                          style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#0b4f9f' }}
                        >
                          {dept.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                  No department data available yet.
                </p>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={() => setShowDeptModal(false)}
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

