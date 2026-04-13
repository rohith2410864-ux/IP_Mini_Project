import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search, X } from 'lucide-react';

import { api } from '../api/axios';
import { useAuth } from '../state/AuthContext';
import type { Department, Event, ExternalLinkType } from '../types/models';

const BrowseEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowSearch(false);
      } else {
        setShowSearch(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getLinkTypeIcon = (type: ExternalLinkType | string): string => {
    switch (type) {
      case 'googleform':
        return '📝';
      case 'whatsapp':
        return '💬';
      case 'telegram':
        return '✈️';
      case 'website':
        return '🌐';
      default:
        return '🔗';
    }
  };

  const getLinkTypeLabel = (type: ExternalLinkType | string): string => {
    switch (type) {
      case 'googleform':
        return 'Form';
      case 'whatsapp':
        return 'WhatsApp';
      case 'telegram':
        return 'Telegram';
      case 'website':
        return 'Website';
      default:
        return 'Link';
    }
  };

  useEffect(() => {
    const fetchEvents = async (): Promise<void> => {
      try {
        const res = await api.get<Event[]>('/events');
        const dept = user?.department;
        const accessible = res.data.filter(
          (ev) =>
            ev.type === 'common' ||
            (ev.departments && dept && ev.departments.includes(dept as Department)),
        );
        setEvents(accessible);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        searchTerm === '' ||
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = activeCategory === 'All' || ev.category === activeCategory;

      const matchesType =
        filterType === 'All' ||
        (filterType === 'Paid' && ev.isPaid) ||
        (filterType === 'Free' && !ev.isPaid);

      return matchesSearch && matchesCat && matchesType;
    });
  }, [activeCategory, events, filterType, searchTerm]);

  const clearSearch = (): void => setSearchTerm('');

  if (loading) return <div className="admin-content">Loading Portal...</div>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '12px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '64px',
          borderBottom: '1px solid #e2e8f0',
          transform: showSearch ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <h2
          style={{
            color: '#0b4f9f',
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}
        >
          SSN Portal
        </h2>

        <div
          style={{
            flex: 1,
            position: 'relative',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              outline: 'none',
              fontSize: '14px',
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '4px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          Dept: <span style={{ color: '#0b4f9f', fontWeight: '500' }}>{user?.department || 'All'}</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          maxWidth: '1200px',
          margin: showSearch ? '20px auto' : '0 auto',
          padding: '0 20px',
          width: '100%',
          gap: '24px',
          transition: 'margin 0.3s ease-in-out',
        }}
      >
        <aside
          style={{
            width: '220px',
            flexShrink: 0,
            position: 'sticky',
            top: showSearch ? '84px' : '20px',
            height: 'fit-content',
            alignSelf: 'flex-start',
            transition: 'top 0.3s ease-in-out',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
            }}
          >
            <p
              style={{
                color: '#64748b',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}
            >
              EVENT CATEGORIES
            </p>

            {['All', 'Technical', 'Non-Technical', 'Workshop', 'Cultural'].map((cat) => (
              <div
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  background: activeCategory === cat ? '#f0f9ff' : 'transparent',
                  color: activeCategory === cat ? '#0b4f9f' : '#475569',
                  fontWeight: activeCategory === cat ? '500' : '400',
                  fontSize: '0.9rem',
                }}
              >
                {cat}
              </div>
            ))}

            <p
              style={{
                color: '#64748b',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '24px',
                marginBottom: '12px',
              }}
            >
              PAYMENT TYPE
            </p>

            {['All', 'Paid', 'Free'].map((type) => (
              <div
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  background: filterType === type ? '#f0f9ff' : 'transparent',
                  color: filterType === type ? '#0b4f9f' : '#475569',
                  fontWeight: filterType === type ? '500' : '400',
                  fontSize: '0.9rem',
                }}
              >
                {type === 'Paid' ? '💰 Paid' : type === 'Free' ? '🎉 Free' : '📋 All'}
              </div>
            ))}

            <div
              style={{
                marginTop: '24px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                textAlign: 'center',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0b4f9f' }}>{filtered.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Events Found</div>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1 }}>
          {filtered.length > 0 ? (
            filtered.map((ev) => (
              <div
                key={ev._id}
                style={{
                  display: 'flex',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  minHeight: '160px',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onClick={() => navigate(`/user/events/${ev._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '160px',
                    minWidth: '160px',
                    background: ev.posterUrl
                      ? `url(${ev.posterUrl}) center/cover`
                      : 'linear-gradient(135deg, #0b4f9f, #1e40af)',
                    position: 'relative',
                  }}
                >
                  {!ev.posterUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        opacity: 0.8,
                      }}
                    >
                      {ev.title.charAt(0)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                      }}
                    >
                      {ev.title}
                    </h3>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          background: ev.type === 'common' ? '#dcfce7' : '#fee2e2',
                          color: ev.type === 'common' ? '#166534' : '#991b1b',
                        }}
                      >
                        {ev.type.toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          background: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {ev.category}
                      </span>
                      {ev.externalLink?.url && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          {getLinkTypeIcon(ev.externalLink.type)} {getLinkTypeLabel(ev.externalLink.type)}
                        </span>
                      )}
                      {ev.isTeamEvent && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            background: '#e0e7ff',
                            color: '#4338ca',
                          }}
                        >
                          👥 Team
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      color: '#64748b',
                      fontSize: '0.8rem',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>📍 {ev.venue}</span>
                    <span>📅 {new Date(ev.startDate).toLocaleDateString()}</span>
                    <span>🕒 {ev.time}</span>
                  </div>

                  <p
                    style={{
                      margin: '0 0 12px 0',
                      color: '#475569',
                      fontSize: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      lineHeight: '1.4',
                    }}
                  >
                    {ev.description}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {ev.isPaid ? (
                        <span style={{ color: '#b45309', fontWeight: '600', fontSize: '0.9rem' }}>₹{ev.amount}</span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>Free</span>
                      )}

                      {ev.isTeamEvent && (
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                          {ev.minTeamSize}-{ev.maxTeamSize} members
                        </span>
                      )}

                      {ev.registrationDeadline && (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                          ⏰ Deadline: {new Date(ev.registrationDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <button
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        background: '#0b4f9f',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/events/${ev._id}`);
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Search size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#64748b' }}>No events found</p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    marginTop: '12px',
                    padding: '6px 16px',
                    background: '#0b4f9f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseEvents;

