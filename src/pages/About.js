import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  display: grid;
  gap: 60px;
`;

const Header = styled.div`
  display: grid;
  gap: 16px;
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 20px;
  border: 1px solid #bbf7d0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 500;
`;

const Content = styled.div`
  display: grid;
  gap: 48px;
`;

const Section = styled.section`
  display: grid;
  gap: 12px;
  padding: 32px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e7e5e4;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #16a34a;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #16a34a 0%, #22c55e 100%);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const SectionText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.8;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ValueCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #f3faf8 100%);
  border-radius: 12px;
  border-left: 4px solid #16a34a;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1b4332;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
  }
`;

export default function About() {
  const values = [
    {
      title: '🌱 Organic Farming',
      description: 'All products are certified organic, using sustainable practices without harmful pesticides.'
    },
    {
      title: '♻️ Environmental Care',
      description: 'We are committed to protecting our planet through eco-friendly practices and packaging.'
    },
    {
      title: '🤝 Community Support',
      description: 'Direct partnerships with local farmers ensure fair pricing and community growth.'
    },
    {
      title: '✓ Quality Assured',
      description: 'Every product meets strict quality standards for freshness and nutritional value.'
    }
  ];

  return (
    <Page>
      <Header>
        <Title>About Organic Store</Title>
        <Description>
          Bringing fresh, organic products directly from farm to your table since 1964.
        </Description>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Our Story</SectionTitle>
          <SectionText>
            Since 1964, Organic Store has been committed to providing the highest quality organic products sourced directly from local farmers. We believe in sustainable farming practices and delivering fresh, healthy options to our community. Our journey started with a simple belief: that everyone deserves access to clean, nutritious food without compromising on taste or quality.
          </SectionText>
        </Section>

        <Section>
          <SectionTitle>Our Mission</SectionTitle>
          <SectionText>
            Our mission is to make organic, healthy food accessible to everyone while supporting sustainable agriculture and local farming communities. We work directly with farmers who share our commitment to environmental stewardship and quality. By eliminating unnecessary middlemen, we can offer competitive prices while ensuring farmers receive fair compensation.
          </SectionText>
        </Section>

        <Section>
          <SectionTitle>Our Core Values</SectionTitle>
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard key={index}>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </ValueCard>
            ))}
          </ValuesGrid>
        </Section>

        <Section>
          <SectionTitle>Quality Commitment</SectionTitle>
          <SectionText>
            Every product in our store is carefully selected to meet our high standards for quality and freshness. We conduct regular inspections with our farmer partners to ensure compliance with organic certification requirements. Our dedicated team works tirelessly to bring you the best selection of organic products available in the market.
          </SectionText>
        </Section>
      </Content>
    </Page>
  );
}
