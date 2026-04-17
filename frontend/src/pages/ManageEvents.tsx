1// FILE: src/pages/ManageEvents.jsx
import { useEffect, useState } from "react";
import { api } from "../api/axios";

const ManageEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  const deptOptions = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "BME", "CHEM"];

  // Question types for custom fields
  const questionTypes = [
    { value: "text", label: "📝 Short Answer" },
    { value: "textarea", label: "📄 Long Answer" },
    { value: "email", label: "📧 Email" },
    { value: "phone", label: "📱 Phone Number" },
    { value: "number", label: "🔢 Number" },
    { value: "date", label: "📅 Date" },
    { value: "select", label: "▼ Dropdown" },
    { value: "radio", label: "⭕ Multiple Choice (Single)" },
    { value: "checkbox", label: "✅ Multiple Choice (Multiple)" },
    { value: "file", label: "📎 File Upload" }
  ];

  const initialForm = {
    title: "", description: "", type: "common",
    departments: [] as string[],
    category: "Technical", startDate: "", endDate: "", time: "",
    venue: "", registrationDeadline: "", maxSeats: 0,
    isTeamEvent: false, minTeamSize: 1, maxTeamSize: 1,
    isPaid: false, amount: 0, paymentInfo: "",
    posterUrl: "", status: "open",
    // External Link Section
    externalLink: {
      url: "",
      type: "googleform",
      label: "Additional Information Form",
      required: false
    },
    customFormFields: [] as any[]
  };

  const [form, setForm] = useState(initialForm);

  const loadEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      setFilteredEvents(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    if (searchTerm) {
      result = result.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterDept !== "All") {
      result = result.filter(e =>
        filterDept === "Common" ? e.type === "common" : (e.departments && e.departments.includes(filterDept))
      );
    }
    result.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'common' ? -1 : 1;
      const deptA = a.departments?.[0] || "";
      const deptB = b.departments?.[0] || "";
      if (deptA !== deptB) return deptA.localeCompare(deptB);
      return a.title.localeCompare(b.title);
    });
    setFilteredEvents(result);
  }, [searchTerm, filterDept, events]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    // Handle nested externalLink fields
    if (name.startsWith('externalLink.')) {
      const field = name.split('.')[1];
      setForm({
        ...form,
        externalLink: {
          ...form.externalLink,
          [field]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleDeptToggle = (dept: string) => {
    setForm((prev: any) => {
      const currentDepts = prev.departments || [];
      const newDepts = currentDepts.includes(dept)
        ? currentDepts.filter((d: string) => d !== dept)
        : [...currentDepts, dept];
      return { ...prev, departments: newDepts };
    });
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, posterUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addCustomField = () => {
    setForm({
      ...form,
      customFormFields: [
        ...(form.customFormFields || []),
        {
          label: "",
          fieldType: "text",
          required: false,
          options: [] // For select/radio/checkbox
        }
      ]
    });
  };

  const updateCustomField = (index: number, key: string, value: any) => {
    const updatedFields = [...form.customFormFields];

    if (key === 'fieldType') {
      // When changing field type
      const needsOptions = ['select', 'radio', 'checkbox'].includes(value);
      updatedFields[index] = {
        ...updatedFields[index],
        [key]: value,
        // Preserve existing options if they exist, otherwise empty array
        options: needsOptions ? (updatedFields[index].options || []) : []
      };
    } else {
      // For other fields (label, required, etc.)
      updatedFields[index] = {
        ...updatedFields[index],
        [key]: value
      };
    }

    setForm({ ...form, customFormFields: updatedFields });
  };

  const addFieldOption = (index: number) => {
    const updatedFields = [...form.customFormFields];
    if (!updatedFields[index].options) {
      updatedFields[index].options = [];
    }
    updatedFields[index].options.push("");
    setForm({ ...form, customFormFields: updatedFields });
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, value: any) => {
    const updatedFields = [...form.customFormFields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options[optionIndex] = value;
    setForm({ ...form, customFormFields: updatedFields });
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...form.customFormFields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_: any, idx: number) => idx !== optionIndex);
    setForm({ ...form, customFormFields: updatedFields });
  };

  const removeCustomField = (index: number) => {
    const updatedFields = form.customFormFields.filter((_, i) => i !== index);
    setForm({ ...form, customFormFields: updatedFields });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (form.type === 'department' && (!form.departments || form.departments.length === 0)) {
        alert("⚠️ Please select at least one department.");
        return;
      }

      // Validate custom fields
      let hasError = false;
      form.customFormFields.forEach((field: any, index: number) => {
        if (!field.label.trim()) {
          alert(`⚠️ Question ${index + 1} needs a label`);
          hasError = true;
        }
        if (['select', 'radio', 'checkbox'].includes(field.fieldType) && (!field.options || field.options.length === 0 || field.options.every((opt: string) => !opt.trim()))) {
          alert(`⚠️ Question "${field.label || index + 1}" needs at least one valid option`);
          hasError = true;
        }
      });

      if (hasError) return;

      // Prepare data for submission - PRESERVE ALL FIELDS including required
      const submitData = {
        title: form.title,
        description: form.description,
        type: form.type,
        departments: form.departments,
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate,
        time: form.time,
        venue: form.venue,
        registrationDeadline: form.registrationDeadline,
        maxSeats: form.maxSeats,
        isTeamEvent: form.isTeamEvent,
        minTeamSize: form.minTeamSize,
        maxTeamSize: form.maxTeamSize,
        isPaid: form.isPaid,
        amount: form.amount,
        paymentInfo: form.paymentInfo,
        posterUrl: form.posterUrl,
        status: form.status,
        externalLink: form.externalLink,
        customFormFields: form.customFormFields.map((field: any) => ({
          label: field.label,
          fieldType: field.fieldType,
          required: field.required === true, // CRITICAL: Ensure boolean is preserved
          options: field.options ? field.options.filter((opt: string) => opt.trim() !== '') : [] // Remove empty options
        }))
      };

      console.log("Submitting event data:", submitData);

      if (editId) {
        await api.put(`/events/${editId}`, submitData);
        alert("Event Updated! ✅");
      } else {
        await api.post('/events', submitData);
        alert("Event Published! 🚀");
      }
      setForm(initialForm);
      setEditId(null);
      loadEvents();
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("Submit error:", err);
      alert("Error: " + ((err as any).response?.data?.message || (err as any).message));
    }
  };

  const handleEdit = (event: any, e: any) => {
    if (e) e.stopPropagation();
    setEditId(event.id);
    setForm({
      ...event,
      departments: event.departments || [],
      externalLink: event.externalLink || {
        url: "",
        type: "googleform",
        label: "Additional Information Form",
        required: false
      },
      startDate: event.startDate ? event.startDate.substring(0, 16) : "",
      endDate: event.endDate ? event.endDate.substring(0, 16) : "",
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.substring(0, 16) : "",
      customFormFields: (event.customFormFields || []).map((field: any) => ({
        label: field.label || "",
        fieldType: field.fieldType || "text",
        required: field.required === true, // Ensure boolean
        options: field.options ? [...field.options] : [] // Deep copy options
      }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, e: any) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      await api.delete(`/events/${id}`);
      loadEvents();
    }
  };

  const getLinkTypeIcon = (type: string) => {
    switch (type) {
      case 'googleform': return '📝';
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      case 'website': return '🌐';
      default: return '🔗';
    }
  };

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-page-container">
      <header className="admin-header">
        <h1 className="admin-main-title">Manage Events</h1>
        <p className="admin-subtitle">Complete control over campus activities</p>
      </header>

      <div className="card glass-effect" style={{ marginBottom: '2rem', borderTop: '4px solid #0b4f9f' }}>
        <h3 className="card-title" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>{editId ? "✏️ Edit Event Details" : "✨ Create New Event"}</span>
          {editId && <button onClick={() => { setEditId(null); setForm(initialForm) }} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Cancel Edit</button>}
        </h3>

        <form onSubmit={handleSubmit} className="event-form">
          <h4 className="form-section-header">📌 Basic Information</h4>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Event Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. AI Symposium 2024" required />
            </div>
            <div className="form-group span-2">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
            </div>
            <div className="form-group">
              <label>Event Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Symposium">Symposium</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
            <div className="form-group">
              <label>Audience Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="common">🌍 Open to All (Common)</option>
                <option value="department">🏢 Department Only</option>
              </select>
            </div>
            {form.type === "department" && (
              <div className="form-group span-2">
                <label>Select Departments</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                  {deptOptions.map(dept => (
                    <label key={dept} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'white', padding: '5px 10px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                      <input
                        type="checkbox"
                        checked={form.departments.includes(dept)}
                        onChange={() => handleDeptToggle(dept)}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Event Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={{ borderColor: form.status === 'closed' ? 'red' : '#ddd' }}>
                <option value="open">🟢 Open for Registration</option>
                <option value="closed">🔴 Closed</option>
                <option value="postponed">🟠 Postponed</option>
              </select>
            </div>
          </div>

          <h4 className="form-section-header" style={{ marginTop: '20px' }}>👥 Participant & Team Settings</h4>
          <div className="form-grid" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <div className="form-group span-2" style={{ display: 'flex', alignItems: 'center' }}>
              <label className="checkbox-container">
                <input type="checkbox" name="isTeamEvent" checked={form.isTeamEvent} onChange={handleChange} />
                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>Is this a Team/Group Registration Event?</span>
              </label>
            </div>

            {form.isTeamEvent && (
              <>
                <div className="form-group">
                  <label>Minimum Team Size</label>
                  <input type="number" name="minTeamSize" value={form.minTeamSize} onChange={handleChange} min="1" />
                </div>
                <div className="form-group">
                  <label>Maximum Team Size</label>
                  <input type="number" name="maxTeamSize" value={form.maxTeamSize} onChange={handleChange} min="1" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Max Total Participants/Teams (0 = Unlimited)</label>
              <input type="number" name="maxSeats" value={form.maxSeats} onChange={handleChange} />
            </div>
          </div>

          {/* 🔗 EXTERNAL LINK SECTION */}
          <h4 className="form-section-header" style={{ marginTop: '20px' }}>🔗 External Link (Optional)</h4>
          <div className="form-grid" style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <div className="form-group span-2">
              <label style={{ fontWeight: 'bold', color: '#0369a1' }}>Link Type</label>
              <select
                name="externalLink.type"
                value={form.externalLink.type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #7dd3fc'
                }}
              >
                <option value="googleform">📝 Google Form</option>
                <option value="whatsapp">💬 WhatsApp Group/Link</option>
                <option value="telegram">✈️ Telegram Group</option>
                <option value="website">🌐 Website/Portal</option>
                <option value="other">🔗 Other Link</option>
              </select>
            </div>

            <div className="form-group span-2">
              <label style={{ fontWeight: 'bold', color: '#0369a1' }}>Button/Link Label</label>
              <input
                name="externalLink.label"
                value={form.externalLink.label}
                onChange={handleChange}
                placeholder="e.g. Registration Form, WhatsApp Group, etc."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #7dd3fc'
                }}
              />
            </div>

            <div className="form-group span-2">
              <label style={{ fontWeight: 'bold', color: '#0369a1' }}>URL / Link</label>
              <input
                name="externalLink.url"
                value={form.externalLink.url}
                onChange={handleChange}
                placeholder="Paste your Google Form, WhatsApp invite, or any link here..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #7dd3fc'
                }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="externalLink.required"
                  checked={form.externalLink.required}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.9rem', color: '#0369a1' }}>Required (user must open this link before registering)</span>
              </label>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#0284c7', margin: '5px 0 0 0' }}>
              💡 Tip: You can add WhatsApp group links, Google Forms, Telegram invites, or any external page here.
            </p>
          </div>

          <h4 className="form-section-header" style={{ marginTop: '20px' }}>🕒 Logistics & Timing</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Start Date</label>
              <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date (Optional for Multi-day)</label>
              <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Time Duration (Display text)</label>
              <input name="time" value={form.time} onChange={handleChange} placeholder="e.g. 9:00 AM - 4:00 PM" required />
            </div>
            <div className="form-group">
              <label>Venue / Location</label>
              <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" required />
            </div>
            <div className="form-group">
              <label>Registration Deadline</label>
              <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required />
            </div>
          </div>

          <h4 className="form-section-header" style={{ marginTop: '20px' }}>💰 Payment Details</h4>
          <div className="form-grid">
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <label className="checkbox-container">
                <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={handleChange} />
                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>Is this a Paid Event?</span>
              </label>
            </div>
            {form.isPaid && (
              <>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                </div>
                <div className="form-group span-2">
                  <label>Payment Instructions / Link</label>
                  <input name="paymentInfo" value={form.paymentInfo} onChange={handleChange} placeholder="UPI ID or Payment Gateway Link" />
                </div>
              </>
            )}
          </div>

          <h4 className="form-section-header" style={{ marginTop: '20px' }}>📝 Custom Registration Questions</h4>
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>
              Add custom questions for registration. <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Required questions must be filled by users</span>
            </p>

            {/* Custom Fields List */}
            {(form.customFormFields || []).map((field: any, index: number) => (
              <div key={index} style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                borderLeft: field.required ? '4px solid #ef4444' : '4px solid #0b4f9f'
              }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <input
                    placeholder="Question Label (e.g., Email Address, Phone Number)"
                    value={field.label || ''}
                    onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                    style={{ flex: '2', minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    required
                  />
                  <select
                    value={field.fieldType || 'text'}
                    onChange={(e) => updateCustomField(index, 'fieldType', e.target.value)}
                    style={{ flex: '1', minWidth: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {questionTypes.map(qt => (
                      <option key={qt.value} value={qt.value}>{qt.label}</option>
                    ))}
                  </select>

                  {/* REQUIRED CHECKBOX */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    background: field.required ? '#fee2e2' : '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={field.required === true}
                      onChange={(e) => {
                        console.log(`Setting required for ${field.label} to:`, e.target.checked);
                        updateCustomField(index, 'required', e.target.checked);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: field.required ? 'bold' : 'normal',
                      color: field.required ? '#ef4444' : '#64748b'
                    }}>
                      {field.required ? 'Required' : 'Optional'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
                  >
                    ✕ Remove
                  </button>
                </div>

                {/* Options for select/radio/checkbox */}
                {['select', 'radio', 'checkbox'].includes(field.fieldType) && (
                  <div style={{ marginLeft: '20px', marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '6px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: '#0b4f9f' }}>
                      Options (users will choose from these):
                    </p>

                    {/* Display existing options */}
                    {(field.options || []).map((option: any, optIndex: number) => (
                      <div key={optIndex} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={option || ''}
                          onChange={(e) => updateFieldOption(index, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeFieldOption(index, optIndex)}
                          style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add new option button */}
                    <button
                      type="button"
                      onClick={() => addFieldOption(index)}
                      style={{ marginTop: '8px', background: '#0b4f9f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      + Add Option
                    </button>

                    {/* Helper text */}
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                      {field.fieldType === 'radio' ? '✓ Users can select ONE option' :
                        field.fieldType === 'checkbox' ? '✓ Users can select MULTIPLE options' :
                          '✓ Users can choose from dropdown'}
                      {field.required && <span style={{ color: '#ef4444', marginLeft: '8px' }}>(Required)</span>}
                    </p>
                  </div>
                )}

                {/* Show hint for required fields */}
                {field.required && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚠️</span>
                    <span>Users must answer this question to register</span>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addCustomField}
              style={{ background: '#0b4f9f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              + Add Question
            </button>
          </div>

          <div className="form-group">
            <label>Event Poster (Upload Image)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {form.posterUrl && <img src={form.posterUrl} alt="Preview" style={{ height: '100px', marginTop: '10px', borderRadius: '6px' }} />}
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              {editId ? "Update Event Details" : "🚀 Publish Event"}
            </button>
          </div>
        </form>
      </div>

      {/* --- SEARCH & LIST SECTION --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search events by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '150px' }}
        >
          <option value="All">All Events</option>
          <option value="Common">Common</option>
          {deptOptions.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredEvents.map(event => (
          <div
            key={event.id}
            className="event-card-horizontal"
            onClick={() => setSelectedEvent(event)}
            style={{
              display: 'flex', background: 'white', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', border: '1px solid #e2e8f0',
              padding: '15px', alignItems: 'center', gap: '20px'
            }}
          >
            {event.posterUrl && (
              <img src={event.posterUrl} alt="Poster" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span className={`badge ${event.type === 'common' ? 'common' : 'dept'}`} style={{ fontSize: '0.7rem' }}>
                  {event.type === 'common' ? 'Common' : (event.departments?.join(', ') || 'Dept')}
                </span>
                {event.isTeamEvent && (
                  <span className="badge" style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#4338ca' }}>
                    👥 Team ({event.minTeamSize}-{event.maxTeamSize})
                  </span>
                )}
                <span className="badge" style={{ fontSize: '0.7rem', background: event.status === 'open' ? '#dcfce7' : '#fee2e2', color: event.status === 'open' ? '#166534' : '#991b1b' }}>
                  {event.status.toUpperCase()}
                </span>
                {event.externalLink?.url && (
                  <span className="badge" style={{
                    fontSize: '0.7rem',
                    background: event.externalLink.required ? '#fee2e2' : '#e0f2fe',
                    color: event.externalLink.required ? '#991b1b' : '#0369a1',
                    border: event.externalLink.required ? '1px solid #fecaca' : '1px solid #7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    {getLinkTypeIcon(event.externalLink.type)} {event.externalLink.type === 'googleform' ? 'Form' :
                      event.externalLink.type === 'whatsapp' ? 'WhatsApp' :
                        event.externalLink.type === 'telegram' ? 'Telegram' : 'Link'}
                    {event.externalLink.required && ' (Required)'}
                  </span>
                )}
                {event.customFormFields?.length > 0 && (
                  <span className="badge" style={{ fontSize: '0.7rem', background: '#f3e8ff', color: '#6b21a8' }}>
                    📋 {event.customFormFields.filter((f: any) => f.required).length} Required Fields
                  </span>
                )}
              </div>
              <h3 style={{ margin: '0', color: '#1e293b', fontSize: '1.2rem' }}>{event.title}</h3>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '15px', marginTop: '5px', flexWrap: 'wrap' }}>
                <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                <span>📍 {event.venue}</span>
                <span>💰 {event.isPaid ? `₹${event.amount}` : 'Free'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={(e) => handleEdit(event, e)} style={{ padding: '8px 15px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
              <button onClick={(e) => handleDelete(event.id, e)} style={{ padding: '8px 15px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FOR FULL DETAILS --- */}
      {selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', maxWidth: '600px', width: '100%', borderRadius: '15px', overflow: 'hidden', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedEvent(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>

            {selectedEvent.posterUrl && <img src={selectedEvent.posterUrl} style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt="Poster" />}

            <div style={{ padding: '25px' }}>
              <h2 style={{ margin: '0 0 10px 0' }}>{selectedEvent.title}</h2>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span className="badge dept">{selectedEvent.category}</span>
                <span className={`badge ${selectedEvent.type}`}>{selectedEvent.type.toUpperCase()}</span>
                {selectedEvent.isTeamEvent && (
                  <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>👥 Team: {selectedEvent.minTeamSize} to {selectedEvent.maxTeamSize}</span>
                )}
              </div>

              <p style={{ color: '#475569', lineHeight: '1.6' }}>{selectedEvent.description}</p>

              {selectedEvent.externalLink?.url && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#0369a1' }}>
                    {getLinkTypeIcon(selectedEvent.externalLink.type)} {selectedEvent.externalLink.label}
                    {selectedEvent.externalLink.required && <span style={{ color: '#ef4444', marginLeft: '8px' }}>(Required)</span>}
                  </p>
                  <a
                    href={selectedEvent.externalLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0284c7',
                      textDecoration: 'underline',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                      display: 'block',
                      padding: '8px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd'
                    }}
                  >
                    {selectedEvent.externalLink.url}
                  </a>
                </div>
              )}

              {/* Show custom fields in preview */}
              {selectedEvent.customFormFields?.length > 0 && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>📋 Registration Questions:</p>
                  {selectedEvent.customFormFields.map((field: any, idx: number) => (
                    <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '8px', padding: '5px', background: 'white', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{field.label}</span>
                      {field.required && <span style={{ color: '#ef4444', marginLeft: '5px' }}>*</span>}
                      <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '0.75rem' }}>
                        ({questionTypes.find(q => q.value === field.fieldType)?.label || field.fieldType})
                      </span>
                      {['select', 'radio', 'checkbox'].includes(field.fieldType) && field.options?.length > 0 && (
                        <div style={{ marginTop: '4px', color: '#475569', fontSize: '0.75rem' }}>
                          Options: {field.options.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
                <p><strong>📍 Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>🕒 Time:</strong> {selectedEvent.time}</p>
                <p><strong>📅 Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                <p><strong>💰 Amount:</strong> {selectedEvent.isPaid ? `₹${selectedEvent.amount}` : 'Free'}</p>
                <p><strong>🏢 Depts:</strong> {selectedEvent.departments?.join(', ') || 'All'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;

