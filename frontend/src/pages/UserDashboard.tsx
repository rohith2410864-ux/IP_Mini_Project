import { useCallback, useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/axios';
import { useAuth } from '../state/AuthContext';
import type { Event, Registration } from '../types/models';

type FullCalendarEvent = {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  allDay: boolean;
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showRegisteredModal, setShowRegisteredModal] = useState<boolean>(false);
  const [showAvailableModal, setShowAvailableModal] = useState<boolean>(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [eventsRes, regRes] = await Promise.all([
        api.get<Event[]>('/events'),
        api.get<Registration[]>('/events/my-registrations'),
      ]);
      setEvents(eventsRes.data || []);
      setRegistrations(regRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const registeredEventIds = useMemo(() => registrations.map((reg) => reg.eventId._id), [registrations]);

  const availableEvents = useMemo(() => events.filter((event) => !registeredEventIds.includes(event._id)), [events, registeredEventIds]);

  const calendarEvents: FullCalendarEvent[] = events
    .map((event) => {
      const start = event.startDate ? new Date(event.startDate).toISOString() : null;
      return (
        start
          ? {
              id: event._id,
              title: event.title,
              start,
              backgroundColor: event.category === 'Department' ? '#f59e0b' : '#3b82f6',
              borderColor: 'transparent',
              allDay: true,
            }
          : null
      );
    })
    .filter((e): e is FullCalendarEvent => e !== null);

  const nextEvent = useMemo(() => {
    const now = new Date();
    return registrations
      .map((r) => r.eventId)
      .filter((e) => !!e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  }, [registrations]);

  if (loading) return <div className="loading-overlay">Loading Dashboard...</div>;

  return (
    <div className="dashboard-content">
      <div className="welcome-banner">
        <h1 className="welcome-text">Welcome, {user?.name || 'SSN Student'}</h1>
        <span className="dept-badge">{user?.department || 'Student'}</span>
      </div>

      <div className="stats-grid-responsive">
        <div
          className="stat-card-custom shadow-sm"
          onClick={() => (nextEvent ? navigate(`/user/events/${nextEvent._id}`) : navigate('/user/events'))}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper blue-bg">
            <span role="img" aria-label="rocket">
              🚀
            </span>
          </div>
          <div className="stat-text">
            <span className="stat-label-text">Next Up</span>
            {nextEvent ? (
              <>
                <h3 className="stat-event-title">{nextEvent.title}</h3>
                <span className="stat-date">{new Date(nextEvent.startDate).toLocaleDateString()}</span>
              </>
            ) : (
              <h3 className="stat-event-title">Browse Events</h3>
            )}
          </div>
        </div>

        <div
          className="stat-card-custom shadow-sm"
          onClick={() => setShowAvailableModal(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper green-bg">
            <span role="img" aria-label="sparkles">
              ✨
            </span>
          </div>
          <div className="stat-text">
            <span className="stat-label-text">Available Events</span>
            <h2 className="stat-number">{availableEvents.length}</h2>
            <span className="tap-details">Click to explore</span>
          </div>
        </div>

        <div
          className="stat-card-custom shadow-sm"
          onClick={() => setShowRegisteredModal(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper orange-bg">
            <span role="img" aria-label="calendar">
              📅
            </span>
          </div>
          <div className="stat-text">
            <span className="stat-label-text">Registered</span>
            <h2 className="stat-number">{registrations.length}</h2>
            <span className="tap-details">Click to view details</span>
          </div>
        </div>
      </div>

      <div className="roadmap-container shadow-md" style={{ marginTop: '30px' }}>
        <div className="roadmap-header">
          <h2 className="roadmap-title">Event Roadmap</h2>
        </div>
        <div className="calendar-main-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin as unknown as never]}
            initialView="dayGridMonth"
            events={calendarEvents}
            height="auto"
            eventClick={(info: unknown) => {
              const id = (info as { event: { id: string } }).event.id;
              navigate(`/user/events/${id}`);
            }}
          />
        </div>
      </div>

      {showAvailableModal && (
        <div className="modal-overlay" onClick={() => setShowAvailableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Available for You</h3>
              <button className="close-btn" onClick={() => setShowAvailableModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {availableEvents.length > 0 ? (
                <div className="event-title-list">
                  {availableEvents.map((ev) => (
                    <div
                      key={ev._id}
                      className="clickable-list-item"
                      onClick={() => navigate(`/user/events/${ev._id}`)}
                    >
                      <div>
                        <div className="item-title">{ev.title}</div>
                        <div className="item-subtitle">📅 {new Date(ev.startDate).toLocaleDateString()}</div>
                      </div>
                      <span className="arrow-icon">→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No new events available.</p>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '15px' }}
                onClick={() => navigate('/user/events')}
              >
                View All Events
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisteredModal && (
        <div className="modal-overlay" onClick={() => setShowRegisteredModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Your Registrations</h3>
              <button className="close-btn" onClick={() => setShowRegisteredModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {registrations.length > 0 ? (
                <div className="event-title-list">
                  {registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="clickable-list-item"
                      onClick={() => navigate(`/user/events/${reg.eventId._id}`)}
                    >
                      <div>
                        <div className="item-title">{reg.eventId.title}</div>
                        <div className="item-subtitle">📍 {reg.eventId.venue}</div>
                      </div>
                      <span className="arrow-icon">→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't registered for anything yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

