// FILE: src/pages/EventDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [hasOpenedLink, setHasOpenedLink] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});

  const getLinkTypeIcon = (type: string) => {
    switch(type) {
      case 'googleform': return '📝';
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      case 'website': return '🌐';
      default: return '🔗';
    }
  };

  const getLinkTypeLabel = (type: string) => {
    switch(type) {
      case 'googleform': return 'Form';
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'website': return 'Website';
      default: return 'Link';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        
        // Initialize answers with empty values for all fields
        if (res.data.customFormFields) {
          const initialAnswers: any = {};
          const initialTouched: any = {};
          res.data.customFormFields.forEach((field: any) => {
            if (field.fieldType === 'checkbox') {
              initialAnswers[field.label] = [];
            } else {
              initialAnswers[field.label] = '';
            }
            initialTouched[field.label] = false;
          });
          setAnswers(initialAnswers);
          setTouchedFields(initialTouched);
        }
        
        const myRegs = await api.get('/events/my-registrations');
        if (myRegs.data.find((r: any) => r.eventId?.id === id)) setIsRegistered(true);
      } catch (e: any) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (label: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [label]: value }));
    setTouchedFields((prev: any) => ({ ...prev, [label]: true }));
    if (validationErrors[label]) {
      setValidationErrors((prev: any) => ({ ...prev, [label]: null }));
    }
  };

  const handleCheckboxChange = (label: string, option: string, checked: boolean) => {
    setAnswers((prev: any) => {
      const currentValues = prev[label] || [];
      if (checked) {
        return { ...prev, [label]: [...currentValues, option] };
      } else {
        return { ...prev, [label]: currentValues.filter((v: any) => v !== option) };
      }
    });
    setTouchedFields((prev: any) => ({ ...prev, [label]: true }));
    if (validationErrors[label]) {
      setValidationErrors((prev: any) => ({ ...prev, [label]: null }));
    }
  };

  const handleBlur = (label: string) => {
    setTouchedFields((prev: any) => ({ ...prev, [label]: true }));
    validateField(label);
  };

  const validateField = (label: string) => {
    if (!event?.customFormFields) return true;
    
    const field = event.customFormFields.find((f: any) => f.label === label);
    if (!field || !field.required) return true;
    
    const value = answers[label];
    let error = null;
    
    if (value === undefined || value === null || value === '') {
      error = `${field.label} is required`;
    }
    
    if (field.fieldType === 'checkbox' && (!value || value.length === 0)) {
      error = `Please select at least one option for ${field.label}`;
    }
    
    if (field.fieldType === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
      error = `Please enter a valid email address`;
    }
    
    if (field.fieldType === 'phone' && value && !/^[\d\s\+\-\(\)]{10,}$/.test(value)) {
      error = `Please enter a valid phone number`;
    }
    
    setValidationErrors((prev: any) => ({ ...prev, [label]: error }));
    return !error;
  };

  const validateForm = () => {
    const errors: any = {};
    let isValid = true;
    
    if (event?.externalLink?.required && !hasOpenedLink) {
      errors.externalLink = `You must open the ${getLinkTypeLabel(event.externalLink.type)} first`;
      isValid = false;
    }

    if (event?.customFormFields?.length > 0) {
      event.customFormFields.forEach((field: any) => {
        if (field.required) {
          const value = answers[field.label];
          
          if (value === undefined || value === null || value === '') {
            errors[field.label] = `${field.label} is required`;
            isValid = false;
          }
          else if (field.fieldType === 'checkbox' && (!value || value.length === 0)) {
            errors[field.label] = `Please select at least one option for ${field.label}`;
            isValid = false;
          }
          else if (field.fieldType === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
            errors[field.label] = `Please enter a valid email address`;
            isValid = false;
          }
          else if (field.fieldType === 'phone' && value && !/^[\d\s\+\-\(\)]{10,}$/.test(value)) {
            errors[field.label] = `Please enter a valid phone number`;
            isValid = false;
          }
        }
      });
    }

    setValidationErrors(errors);
    return isValid;
  };

  const initializeRazorpay = (orderData: any) => {
    const options = {
      key: "rzp_test_SNwjqZRKmjXYe2", 
      amount: orderData.amount, 
      currency: "INR",
      name: "SSN Event Portal",
      description: `Registration for ${event?.title}`,
      order_id: orderData.id, 
      handler: async function (response: any) {
        await verifyPayment(response, orderData.id);
      },
      prefill: { 
        name: "Student Name", 
        email: "student@ssn.edu.in" 
      },
      theme: { color: "#0b4f9f" },
      modal: {
        ondismiss: function() {
          setProcessing(false);
          alert("Payment cancelled");
        }
      }
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (paymentResponse: any, orderId: string) => {
    try {
      setProcessing(true);
      
      const verifyRes = await api.post('/payments/verify', {
        order_id: orderId,
        payment_id: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature
      });

      if (verifyRes.data.success) {
        await completeRegistration(paymentResponse.razorpay_payment_id);
      } else {
        alert("Payment verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      alert("Payment verification failed: " + ((err as any).response?.data?.message || (err as any).message));
    } finally {
      setProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      alert("Please fill all required fields correctly before registering.");
      
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                       document.querySelector(`[data-label="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setProcessing(true);

    if (event?.isPaid && event?.amount > 0) {
      try {
        const amount = Number(event.amount);
        const orderRes = await api.post(`/payments/create-order`, { 
          amount: amount,
          eventId: event.id
        });
        
        initializeRazorpay(orderRes.data);
      } catch (err: any) { 
        console.error("Payment initiation error:", err);
        alert("Failed to initialize payment: " + ((err as any).response?.data?.message || (err as any).message));
        setProcessing(false);
      }
    } else {
      await completeRegistration("FREE_EVENT");
      setProcessing(false);
    }
  };

  const completeRegistration = async (paymentId: string) => {
    try {
      if (!validateForm()) {
        alert("Please fill all required fields before registering.");
        setProcessing(false);
        return;
      }
      
      const formattedResponses = [];
      
      for (const [label, value] of Object.entries(answers)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          continue;
        }
        
        if (Array.isArray(value)) {
          formattedResponses.push({ label, answer: value.join(', ') });
        } else {
          formattedResponses.push({ label, answer: value });
        }
      }
      
      const responsePayload = {
        paymentId,
        responses: formattedResponses
      };
      
      await api.post(`/events/${id}/register`, responsePayload);
      setIsRegistered(true);
      alert("Registration Successful!");
    } catch (err: any) { 
      console.error("Registration error:", err);
      alert((err as any).response?.data?.message || "Registration failed"); 
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm("Are you sure you want to withdraw?")) {
      try {
        await api.delete(`/events/${id}/withdraw`);
        setIsRegistered(false);
        setAnswers({});
        setHasOpenedLink(false);
        alert("Withdrawn successfully.");
      } catch (err: any) { 
        alert("Withdrawal failed"); 
      }
    }
  };

  const renderCustomField = (field: any) => {
    const value = answers[field.label] || (field.fieldType === 'checkbox' ? [] : '');
    const hasError = validationErrors[field.label] && touchedFields[field.label];
    
    const fieldStyle = {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: hasError ? '2px solid #ef4444' : '1px solid #cbd5e1',
      background: '#fff',
      outline: 'none',
      transition: 'border 0.2s'
    };

    const commonProps = {
      onBlur: () => handleBlur(field.label),
      'data-label': field.label,
      required: field.required
    };

    switch(field.fieldType) {
      case 'textarea':
        return (
          <div>
            <textarea
              {...commonProps}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={{ ...fieldStyle, minHeight: '80px' }}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div>
            <select
              {...commonProps}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            >
              <option value="">Select an option</option>
              {field.options?.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'radio':
        return (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {field.options?.map((opt: string, i: number) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={field.label}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                    onBlur={() => handleBlur(field.label)}
                    required={field.required}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {field.options?.map((opt: string, i: number) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value={opt}
                    checked={Array.isArray(value) && value.includes(opt)}
                    onChange={(e) => handleCheckboxChange(field.label, opt, e.target.checked)}
                    onBlur={() => handleBlur(field.label)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
            {field.required && (
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                You can select multiple options
              </span>
            )}
          </div>
        );
      
      case 'email':
        return (
          <div>
            <input
              type="email"
              {...commonProps}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'phone':
        return (
          <div>
            <input
              type="tel"
              {...commonProps}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div>
            <input
              type="number"
              {...commonProps}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'date':
        return (
          <div>
            <input
              type="date"
              {...commonProps}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    handleInputChange(field.label, reader.result);
                    handleBlur(field.label);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onBlur={() => handleBlur(field.label)}
              style={fieldStyle}
              required={field.required}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
      
      default:
        return (
          <div>
            <input
              type="text"
              {...commonProps}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              style={fieldStyle}
            />
            {hasError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                {validationErrors[field.label]}
              </span>
            )}
          </div>
        );
    }
  };

  const allRequiredFieldsFilled = () => {
    if (!event) return false;
    
    if (event.externalLink?.required && !hasOpenedLink) return false;
    
    if (event.customFormFields?.length > 0) {
      for (const field of event.customFormFields) {
        if (field.required) {
          const value = answers[field.label];
          
          if (value === undefined || value === null || value === '') {
            return false;
          }
          
          if (field.fieldType === 'checkbox' && (!value || value.length === 0)) {
            return false;
          }
          
          if (field.fieldType === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
            return false;
          }
          
          if (field.fieldType === 'phone' && value && !/^[\d\s\+\-\(\)]{10,}$/.test(value)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  if (loading) return <div className="admin-content">Loading...</div>;
  if (!event) return <div className="admin-content">Event not found.</div>;

  const canRegister = allRequiredFieldsFilled();

  return (
    <div className="admin-page-container" style={{ maxWidth: '1100px', margin: '20px auto' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '20px' }}>← Back</button>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px' }}>
        <div style={{ 
          height: '350px', 
          background: event.posterUrl ? `url(${event.posterUrl}) center/cover` : 'linear-gradient(135deg, #0b4f9f, #3b82f6)',
          display: 'flex', alignItems: 'flex-end', padding: '40px', color: '#fff'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', backdropFilter: 'blur(5px)' }}>
              {event.category} Event
            </span>
            <h1 style={{ margin: '10px 0 0 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)', fontSize: '2.5rem' }}>{event.title}</h1>
          </div>
        </div>

        <div style={{ padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '2', minWidth: '300px' }}>
            <h3 style={{ color: '#0b4f9f' }}>Event Description</h3>
            <p style={{ lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>{event.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '25px', borderRadius: '16px', marginTop: '30px' }}>
              <div>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Registration Deadline</p>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'Not Set'}</p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Participation</p>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{event.isTeamEvent ? `Team (${event.minTeamSize}-${event.maxTeamSize} members)` : 'Individual'}</p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Available Seats</p>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{event.maxSeats > 0 ? event.maxSeats : 'Unlimited'}</p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>Allowed Departments</p>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{event.departments?.length > 0 ? event.departments.join(', ') : 'All Departments'}</p>
              </div>
            </div>

            {!isRegistered && (
              <div style={{ marginTop: '30px' }}>
                {/* External Link Section */}
                {event.externalLink?.url && (
                  <div style={{ 
                    padding: '20px', 
                    background: hasOpenedLink ? '#f0fdf4' : '#f0f9ff', 
                    border: hasOpenedLink ? '1px solid #bbf7d0' : '1px solid #bae6fd', 
                    borderRadius: '12px', 
                    marginBottom: '20px' 
                  }}>
                    <h4 style={{ 
                      color: hasOpenedLink ? '#166534' : '#0369a1', 
                      marginTop: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getLinkTypeIcon(event.externalLink.type)} Step 1: {event.externalLink.label}
                      {event.externalLink.required && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>(Required)</span>}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: hasOpenedLink ? '#166534' : '#0369a1' }}>
                      Please open and complete this {getLinkTypeLabel(event.externalLink.type)} before proceeding.
                    </p>
                    <a 
                      href={event.externalLink.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => setHasOpenedLink(true)}
                      className="btn-primary" 
                      style={{ 
                        textDecoration: 'none', 
                        display: 'inline-block', 
                        background: hasOpenedLink ? '#10b981' : '#0b4f9f',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    >
                      {hasOpenedLink ? '✓ Opened - Continue' : `Open ${getLinkTypeLabel(event.externalLink.type)}`}
                    </a>
                  </div>
                )}

                {/* Custom Form Fields */}
                {event.customFormFields?.length > 0 && (
                  <div style={{ padding: '25px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ marginBottom: '20px', color: '#1e293b' }}>Step 2: Registration Details</h4>
                    {event.customFormFields.map((field: any, index: number) => (
                      <div key={index} style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                          {!field.required && <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '8px' }}>(Optional)</span>}
                        </label>
                        {renderCustomField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isRegistered && (
              <div style={{ marginTop: '30px', padding: '30px', background: '#f0fdf4', borderRadius: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <h3 style={{ color: '#166534' }}>✓ You are registered!</h3>
                <p>Registration is complete. See you at the event!</p>
                {event.externalLink?.url && (
                  <a 
                    href={event.externalLink.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: '#15803d', textDecoration: 'underline' }}
                  >
                    Access {getLinkTypeLabel(event.externalLink.type)} again
                  </a>
                )}
              </div>
            )}
          </div>

          <aside style={{ flex: '1', minWidth: '280px', background: '#f1f5f9', padding: '30px', borderRadius: '20px', height: 'fit-content' }}>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${event.type}`}>{event.type.toUpperCase()}</span>
              <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{event.category}</span>
            </div>
            
            <p><strong>📍 Venue:</strong> {event.venue}</p>
            <p><strong>📅 Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
            <p><strong>🕒 Time:</strong> {event.time || "Not specified"}</p>
            
            {event.isTeamEvent && (
              <p><strong>👥 Team Size:</strong> {event.minTeamSize} - {event.maxTeamSize} members</p>
            )}
            
            <p style={{ fontSize: '1.2rem' }}>
              <strong>💰 Fee:</strong> {event.isPaid ? 
                <span style={{ color: '#b45309' }}>₹{event.amount}</span> : 
                <span style={{ color: '#10b981' }}>Free</span>
              }
            </p>

            {event.paymentInfo && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  <strong>Payment Info:</strong> {event.paymentInfo}
                </p>
              </div>
            )}

            <hr style={{ margin: '25px 0', border: '0', borderTop: '1px solid #cbd5e1' }} />

            {!isRegistered ? (
              <button 
                onClick={handleRegister} 
                disabled={processing || !canRegister}
                className="btn-primary" 
                style={{ 
                  width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '12px',
                  opacity: !canRegister || processing ? 0.6 : 1,
                  cursor: !canRegister || processing ? 'not-allowed' : 'pointer',
                  background: !canRegister ? '#94a3b8' : '#0b4f9f'
                }}
              >
                {processing ? "Processing..." : 
                 !canRegister ? "Complete all required fields first" : 
                 (event.isPaid ? "Pay & Register" : "Register Now")}
              </button>
            ) : (
              <button onClick={handleWithdraw} className="btn-secondary" style={{ width: '100%', color: '#dc2626' }}>
                Withdraw Registration
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

