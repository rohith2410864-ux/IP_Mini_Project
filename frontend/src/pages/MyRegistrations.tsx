import { useEffect, useState } from 'react';

import { api } from '../api/axios';
import type { Registration } from '../types/models';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyEvents = async (): Promise<void> => {
    try {
      const res = await api.get<Registration[]>('/events/my-registrations');
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyEvents();
  }, []);

  const handleWithdraw = async (eventId: string, eventTitle: string): Promise<void> => {
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw from "${eventTitle}"? This cannot be undone.`,
    );

    if (!confirmWithdraw) return;

    try {
      await api.delete(`/events/${eventId}/withdraw`);
      alert('Successfully withdrawn.');
      setRegistrations((prev) => prev.filter((reg) => reg.eventId?.id !== eventId));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Withdrawal failed';
      alert(message);
    }
  };

  if (loading) return <div className="admin-content">Loading your events...</div>;

  return (
    <div className="admin-page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <h1 className="admin-main-title">My Registered Events</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>
        You can manage or withdraw from your joined events here.
      </p>

      <div style={{ maxWidth: '900px' }}>
        {registrations.length > 0 ? (
          registrations.map((reg) => (
            <div
              key={reg.id}
              style={{
                display: 'flex',
                background: '#fff',
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: '12px', background: reg.attendanceStatus === 'present' ? '#10b981' : '#3b82f6' }} />

              <div style={{ padding: '25px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{reg.eventId.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
                      📅 {new Date(reg.eventId.startDate).toLocaleDateString()} | 📍 {reg.eventId.venue}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: reg.attendanceStatus === 'pending' ? '#fef3c7' : '#d1fae5',
                        color: reg.attendanceStatus === 'pending' ? '#92400e' : '#065f46',
                      }}
                    >
                      {(reg.attendanceStatus || 'pending').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                  <button
                    className="btn-secondary"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={() => handleWithdraw(reg.eventId?.id, reg.eventId.title)}
                  >
                    Withdraw from Event
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px' }}>
            <p style={{ color: '#94a3b8' }}>You haven't registered for any events yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;

