import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Clock, Tag } from 'lucide-react';

const newsItems = [
  {
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&h=350&fit=crop',
    category: 'Healthy',
    date: '21st Aug, 2015',
    comments: 26,
    title: 'You should add 5 things in your daily meals.',
    excerpt: 'As more and more people are turning to organic lifestyles & trying improve their health...'
  },
  {
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=500&h=350&fit=crop',
    category: 'Healthy',
    date: '21st Aug, 2015',
    comments: 26,
    title: 'You should add 5 things in your daily meals.',
    excerpt: 'As more and more people are turning to organic lifestyles & trying improve their health...'
  },
  {
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&h=350&fit=crop',
    category: 'Healthy',
    date: '21st Aug, 2015',
    comments: 26,
    title: 'You should add 5 things in your daily meals.',
    excerpt: 'As more and more people are turning to organic lifestyles & trying improve their health...'
  }
];

const LatestNews = () => {
  return (
    <section style={{ padding: '56px 0', background: '#f7faf7' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6cb24b', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
            Stay Updated
          </p>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 800, color: '#1b4332', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>
            Our Latest News
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <div style={{ height: '3px', width: '36px', borderRadius: '99px', background: '#6cb24b' }} />
            <div style={{ height: '3px', width: '16px', borderRadius: '99px', background: '#a8d88a' }} />
            <div style={{ height: '3px', width: '8px', borderRadius: '99px', background: '#d4efc4' }} />
          </div>
        </div>

        {/* News Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {newsItems.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                border: '1px solid #e8f0e8',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              className="news-card"
            >
              {/* Image */}
              <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
                  className="news-img"
                />
                <div
                  style={{ position: 'absolute', inset: 0, background: 'rgba(108,178,75,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s ease' }}
                  className="news-overlay"
                >
                  <span style={{ color: '#fff', fontSize: '32px', fontWeight: 300, opacity: 0, transition: 'opacity 0.3s ease' }} className="news-plus">+</span>
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid #f1f5f1', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                  <Tag size={12} color="#6cb24b" /> {item.category}
                </span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                  <Clock size={12} color="#6cb24b" /> {item.date}
                </span>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                  <MessageCircle size={12} color="#6cb24b" /> {item.comments}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '18px 16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#1b4332', lineHeight: 1.4 }}>
                  {item.title}
                </h3>
                <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>
                  {item.excerpt}
                </p>
                <Link
                  to="/news"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1b4332', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.05em' }}
                >
                  Read More <span style={{ fontSize: '10px' }}>▶</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .news-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
        .news-card:hover .news-img { transform: scale(1.07); }
        .news-card:hover .news-overlay { background: rgba(108,178,75,0.45) !important; }
        .news-card:hover .news-plus { opacity: 1 !important; }
      `}</style>
    </section>
  );
};

export default LatestNews;