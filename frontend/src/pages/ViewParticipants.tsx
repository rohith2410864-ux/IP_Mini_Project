import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { CSSProperties } from 'react';
import type { Department, Event, Registration } from '../types/models';

const ViewParticipants = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [eventSearch, setEventSearch] = useState<string>('');
  const [scopeFilter, setScopeFilter] = useState<string>('All');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentDeptFilter, setStudentDeptFilter] = useState<string>('All');

  const departments: Department[] = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'BME', 'CHEM'];

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<Registration[]>('/registrations');
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const eventMap: Record<string, Event> = useMemo(() => {
    const map: Record<string, Event> = {};
    for (const r of registrations) {
      const eventObj = r.eventId;
      // Added safety check for eventObj existence
      if (eventObj && typeof eventObj === 'object' && eventObj.id) {
        if (!map[eventObj.id]) {
          map[eventObj.id] = eventObj;
        }
      }
    }
    return map;
  }, [registrations]);

  const allEvents: Event[] = useMemo(() => Object.values(eventMap), [eventMap]);

  const filteredEvents: Event[] = useMemo(() => {
    return allEvents.filter((e) => {
      const title = e.title || 'Untitled Event';
      const matchesSearch = title.toLowerCase().includes(eventSearch.toLowerCase());

      const eventType = e.type?.toLowerCase();
      let matchesScope = true;
      if (scopeFilter === 'Common') {
        matchesScope = eventType === 'common';
      } else if (scopeFilter !== 'All') {
        matchesScope = !!e.departments?.includes(scopeFilter as Department);
      }

      const matchesCat = catFilter === 'All' || e.category === catFilter;
      return matchesSearch && matchesScope && matchesCat;
    });
  }, [allEvents, catFilter, eventSearch, scopeFilter]);

  const participants: Registration[] = useMemo(() => {
    return registrations
      .filter((r) => {
        const regEventId = r.eventId?.id;
        return selectedEvent ? regEventId === selectedEvent.id : false;
      })
      .filter((r) => {
        const name = r.userId?.name?.toLowerCase() || '';
        const matchesName = name.includes(studentSearch.toLowerCase());
        const matchesDept = studentDeptFilter === 'All' || r.userId?.department === studentDeptFilter;
        return matchesName && matchesDept;
      })
      .sort((a, b) => (a.userId?.name || '').localeCompare(b.userId?.name || ''));
  }, [registrations, selectedEvent, studentDeptFilter, studentSearch]);

  const downloadPDF = (): void => {
    if (!selectedEvent || participants.length === 0) {
      alert('No data available to download.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(`${selectedEvent.title} - Participant List`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Participants: ${participants.length}`, 14, 27);

    const tableRows = participants.map((p) => [
      p.userId?.name || 'N/A',
      p.userId?.department || 'N/A',
      p.userId?.email || 'N/A',
      p.responses?.map((res) => `${res.label}: ${res.answer}`).join(' | ') || 'None',
    ]);

    (autoTable as unknown as (doc: unknown, options: unknown) => void)(doc, {
      head: [['Name', 'Dept', 'Email', 'Form Responses']],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [11, 79, 159], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 35 },
    });

    const safeFileName = selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeFileName}_participants.pdf`);
  };

  if (loading) return <div style={centerMsg}>Loading Participant Portal...</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{selectedEvent ? 'Participant Directory' : 'Select an Event'}</h1>
          <p style={subtitleStyle}>SSN Event Management Admin</p>
        </div>
        {selectedEvent && (
          <button onClick={() => setSelectedEvent(null)} style={backBtn}>
            &larr; Switch Event
          </button>
        )}
      </header>

      {!selectedEvent ? (
        <>
          <div style={filterCard}>
            <input
              placeholder="Search event title..."
              style={inputStyle}
              onChange={(e) => setEventSearch(e.target.value)}
            />
            <select style={selectStyle} onChange={(e) => setScopeFilter(e.target.value)}>
              <option value="All">All Scopes</option>
              <option value="Common">Common</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select style={selectStyle} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {['Technical', 'Non-Technical', 'Workshop', 'Seminar', 'Symposium', 'Cultural'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={listWrapper}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} style={listRow}>
                  <div style={rowLeft}>
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt="Poster" style={rowThumb} />
                    ) : (
                      <div style={thumbFallback}>No Image</div>
                    )}
                    <div style={rowInfo}>
                      <div style={badgeContainer}>
                        <span
                          style={{
                            ...typeBadge,
                            background: event.type === 'common' ? '#dcfce7' : '#fee2e2',
                            color: event.type === 'common' ? '#166534' : '#991b1b',
                          }}
                        >
                          {event.type === 'common' ? 'Common' : 'Department'}
                        </span>
                        <span style={{ ...typeBadge, background: '#f1f5f9', color: '#475569' }}>
                          {event.category}
                        </span>
                        {event.isTeamEvent && (
                          <span style={{ ...typeBadge, background: '#e0e7ff', color: '#4338ca' }}>
                            👥 Team ({event.minTeamSize}-{event.maxTeamSize})
                          </span>
                        )}
                        {event.externalLink?.url && (
                          <span
                            style={{
                              ...typeBadge,
                              background: event.externalLink.required ? '#fee2e2' : '#e0f2fe',
                              color: event.externalLink.required ? '#991b1b' : '#0369a1',
                            }}
                          >
                            {event.externalLink.required ? '🔗 Required' : '🔗 Optional'} Link
                          </span>
                        )}
                        <span
                          style={{
                            ...typeBadge,
                            background: event.status === 'open' ? '#dcfce7' : '#fee2e2',
                            color: event.status === 'open' ? '#166534' : '#991b1b',
                          }}
                        >
                          {event.status?.toUpperCase() || 'OPEN'}
                        </span>
                      </div>
                      <h4 style={rowTitle}>{event.title}</h4>
                      <div style={rowMeta}>
                        <span>📅 {new Date(event.startDate).toLocaleDateString('en-GB')}</span>
                        <span style={{ marginLeft: '15px' }}>📍 {event.venue || 'Main Audi'}</span>
                        <span style={{ marginLeft: '15px' }}>💰 {event.isPaid ? `₹${event.amount}` : 'Free'}</span>
                      </div>
                      {event.registrationDeadline && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                          ⏰ Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={rowRight}>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#0b4f9f',
                        fontWeight: '600',
                        marginRight: '10px',
                      }}
                    >
                      {/* FIXED: Added optional chaining here to prevent the crash at line 239/236 */}
                      {registrations.filter((r) => r.eventId?.id === event.id).length} Registered
                    </span>
                    <button onClick={() => setSelectedEvent(event)} style={selectBtn}>
                      View Participants
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={emptyMsg}>No events found.</div>
            )}
          </div>
        </>
      ) : (
        <div style={tableCard}>
          <div style={tableHeader}>
            <div>
              <h2 style={{ margin: 0 }}>{selectedEvent.title} Participants</h2>
              <div
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  marginTop: '8px',
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <span>📅 {new Date(selectedEvent.startDate).toLocaleDateString()}</span>
                <span>📍 {selectedEvent.venue}</span>
                <span>💰 {selectedEvent.isPaid ? `₹${selectedEvent.amount}` : 'Free'}</span>
                {selectedEvent.isTeamEvent && (
                  <span>
                    👥 Team ({selectedEvent.minTeamSize}-{selectedEvent.maxTeamSize} members)
                  </span>
                )}
              </div>
            </div>
            <button onClick={downloadPDF} style={pdfBtn}>
              Download List (PDF)
            </button>
          </div>

          <div style={tableFilters}>
            <input
              placeholder="Filter by student name..."
              style={tableInput}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <select style={tableSelect} onChange={(e) => setStudentDeptFilter(e.target.value)}>
              <option value="All">All Depts</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={mainTable}>
              <thead>
                <tr>
                  <th style={th}>Student Name</th>
                  <th style={th}>Department</th>
                  <th style={th}>Email</th>
                  <th style={th}>Status</th>
                  <th style={th}>Form Answers</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} style={tr}>
                    <td style={tdName}>{p.userId?.name || 'Unknown'}</td>
                    <td style={td}>{p.userId?.department || 'N/A'}</td>
                    <td style={td}>{p.userId?.email || 'N/A'}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background:
                            p.attendanceStatus === 'present'
                              ? '#dcfce7'
                              : p.attendanceStatus === 'pending'
                                ? '#fef3c7'
                                : '#fee2e2',
                          color:
                            p.attendanceStatus === 'present'
                              ? '#166534'
                              : p.attendanceStatus === 'pending'
                                ? '#92400e'
                                : '#991b1b',
                        }}
                      >
                        {p.attendanceStatus || 'pending'}
                      </span>
                    </td>
                    <td style={td}>
                      {p.responses?.map((res, i) => (
                        <div key={i} style={resBadge}>
                          <strong>{res.label}:</strong> {res.answer}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES (Unchanged) ---
const containerStyle: CSSProperties = { padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' };
const titleStyle: CSSProperties = { margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' };
const subtitleStyle: CSSProperties = { margin: 0, color: '#64748b' };
const centerMsg: CSSProperties = { padding: '100px', textAlign: 'center', fontSize: '18px' };
const filterCard: CSSProperties = { display: 'flex', gap: '15px', background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const inputStyle: CSSProperties = { flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const selectStyle: CSSProperties = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const listWrapper: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const listRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const rowLeft: CSSProperties = { display: 'flex', alignItems: 'center', gap: '20px' };
const rowThumb: CSSProperties = { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' };
const thumbFallback: CSSProperties = { width: '60px', height: '60px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' };
const rowInfo: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' };
const rowTitle: CSSProperties = { margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' };
const rowMeta: CSSProperties = { fontSize: '13px', color: '#64748b' };
const badgeContainer: CSSProperties = { display: 'flex', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' };
const typeBadge: CSSProperties = { color: '#3b82f6', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' };
const rowRight: CSSProperties = { display: 'flex', gap: '10px', alignItems: 'center' };
const selectBtn: CSSProperties = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const tableCard: CSSProperties = { background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const tableHeader: CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' };
const pdfBtn: CSSProperties = { background: '#0b4f9f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };
const backBtn: CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' };
const tableFilters: CSSProperties = { display: 'flex', gap: '15px', marginBottom: '20px' };
const tableInput: CSSProperties = { flex: 3, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const tableSelect: CSSProperties = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const mainTable: CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const th: CSSProperties = { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' };
const tr: CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const td: CSSProperties = { padding: '12px', fontSize: '14px' };
const tdName: CSSProperties = { ...td, fontWeight: 'bold', color: '#0b4f9f' };
const resBadge: CSSProperties = { fontSize: '11px', background: '#f8fafc', padding: '2px 5px', borderRadius: '4px', marginBottom: '3px', border: '1px solid #e2e8f0' };
const emptyMsg: CSSProperties = { padding: '40px', color: '#94a3b8', textAlign: 'center', width: '100%' };

export default ViewParticipants;