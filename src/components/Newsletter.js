import React, { useState } from 'react';

const Newsletter = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setName('');
    setEmail('');
  };

  return (
    <section style={{ background: '#6cb24b', padding: '20px' }}>
      {/* ← this outer div is what adds the 20px side margin */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '60px', paddingRight: '60px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>

          {/* Left text */}
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
              Subscribe For Newsletter
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              We send you latest news couple a month ( No Spam).
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, maxWidth: '680px' }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <input
                type="text"
                placeholder="Your Name*"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 18px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: '#fff',
                  color: '#374151',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>👤</span>
            </div>

            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <input
                type="email"
                placeholder="Email Address*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 18px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: '#fff',
                  color: '#374151',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>✉</span>
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 28px',
                background: '#fff',
                color: '#1b4332',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.background = '#f0fdf4'}
              onMouseLeave={e => e.target.style.background = '#fff'}
            >
              SUBMIT NOW
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};

export default Newsletter;