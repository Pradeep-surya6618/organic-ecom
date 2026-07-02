import React from 'react';

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop', alt: 'Healthy Greens' },
  { src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=400&fit=crop', alt: 'Fresh Salad' },
  { src: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&h=400&fit=crop', alt: 'Chocolate' },
  { src: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=400&fit=crop', alt: 'Goji Berries' },
  { src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=400&fit=crop', alt: 'Smoothies' },
  { src: 'https://images.unsplash.com/photo-1536591375315-19604c9ca854?w=500&h=400&fit=crop', alt: 'Mixed Nuts' },
];

const TopSelling = () => {
  return (
    <section style={{ padding: '56px 0', background: '#fff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>

        {/* Section Title */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6cb24b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', margin: '0 0 6px 0' }}>
            Our Collection
          </p>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 800, color: '#1b4332', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>
            Top Selling Products
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <div style={{ height: '3px', width: '36px', borderRadius: '99px', background: '#6cb24b' }} />
            <div style={{ height: '3px', width: '16px', borderRadius: '99px', background: '#a8d88a' }} />
            <div style={{ height: '3px', width: '8px', borderRadius: '99px', background: '#d4efc4' }} />
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '480px', lineHeight: '1.7', margin: 0 }}>
            Handpicked organic products loved by our customers — fresh, nutritious, and delivered with care.
          </p>
        </div>

        {/* Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {galleryImages.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '14px',
                aspectRatio: '4/3',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              className="gallery-card"
            >
              <img
                src={img.src}
                alt={img.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                className="gallery-img"
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(108,178,75,0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s ease',
                }}
                className="gallery-overlay"
              >
                <div style={{
                  width: '44px', height: '44px', background: 'rgba(255,255,255,0.25)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.3s ease',
                }} className="gallery-plus">
                  <span style={{ color: '#fff', fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover styles */}
      <style>{`
        .gallery-card:hover .gallery-img { transform: scale(1.08); }
        .gallery-card:hover .gallery-overlay { background: rgba(108,178,75,0.55) !important; }
        .gallery-card:hover .gallery-plus { opacity: 1 !important; }
      `}</style>
    </section>
  );
};

export default TopSelling;