import React from 'react';
import { Sprout, Truck, Heart, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Sprout,
    title: '100% Organic Products',
    description: 'All our products are certified organic, grown without harmful pesticides or chemicals — straight from trusted farms to your table.',
    accent: true,
  },
  {
    icon: Truck,
    title: 'Any Time, Anywhere Delivery',
    description: 'We deliver fresh organic products right to your doorstep on your schedule — fast, reliable, and always on time.',
    accent: false,
  },
  {
    icon: Heart,
    title: 'Keeps Your Family Healthy',
    description: 'Our carefully curated selection supports healthy living for the whole family — clean ingredients, zero compromise.',
    accent: false,
  },
  {
    icon: ShieldCheck,
    title: 'Clean, Fresh and Safety',
    description: "Every product passes strict quality checks to ensure it's clean, fresh, and safe — because your health matters most.",
    accent: false,
  },
];

const WhyChooseUs = () => {
  return (
    <section style={{ padding: '56px 0', background: '#f7faf7' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>

        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6cb24b', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Our Promise
          </p>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 800, color: '#1b4332', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>
            Why Choose Us
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <div style={{ height: '3px', width: '36px', borderRadius: '99px', background: '#6cb24b' }} />
            <div style={{ height: '3px', width: '16px', borderRadius: '99px', background: '#a8d88a' }} />
            <div style={{ height: '3px', width: '8px', borderRadius: '99px', background: '#d4efc4' }} />
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
            We're committed to delivering the freshest organic produce with transparency, care, and integrity — every single time.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const bg = feature.accent ? '#6cb24b' : '#ffffff';
            const titleColor = feature.accent ? '#ffffff' : '#1b4332';
            const descColor = feature.accent ? 'rgba(255,255,255,0.82)' : '#64748b';
            const iconBg = feature.accent ? 'rgba(255,255,255,0.2)' : '#f0f9eb';
            const iconColor = feature.accent ? '#ffffff' : '#6cb24b';

            return (
              <div
                key={index}
                style={{
                  background: bg,
                  borderRadius: '16px',
                  padding: '28px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '18px',
                  boxShadow: feature.accent ? '0 4px 20px rgba(108,178,75,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                  border: feature.accent ? 'none' : '1px solid #e8f0e8',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                className="why-card"
              >
                {/* Icon */}
                <div style={{
                  flexShrink: 0,
                  width: '48px', height: '48px',
                  borderRadius: '12px',
                  background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: iconColor,
                }}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>

                {/* Text */}
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: titleColor, lineHeight: 1.3 }}>
                    {feature.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: descColor, lineHeight: '1.7' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .why-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;