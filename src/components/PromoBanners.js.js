import React from 'react';
import styled from 'styled-components';

const BannerWrapper = styled.div`
  padding: 0 20px;
  margin-top: 40px;
`;

const BannerSection = styled.section`
  border-radius: 36px;
  background: linear-gradient(135deg, #d8f1d8 0%, #eef6ef 100%);
  padding: 42px 36px;
  display: grid;
  gap: 22px;
  align-items: center;
  grid-template-columns: 1fr auto;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
    padding: 28px 24px;
  }
`;

const BannerText = styled.div`
  display: grid;
  gap: 14px;
`;

const BannerTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  color: #1b4332;

  @media (max-width: 780px) {
    font-size: 1.35rem;
  }
`;

const BannerDescription = styled.p`
  margin: 0;
  color: #475569;
  line-height: 1.8;
  font-size: 0.95rem;
`;

const BannerButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 26px;
  border-radius: 999px;
  background: #2d6a4f;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  white-space: nowrap;
  width: fit-content;
  transition: background 0.2s ease;

  &:hover {
    background: #1b4332;
  }
`;

export default function Banner() {
  return (
    <BannerWrapper>
      <BannerSection>
        <BannerText>
          <BannerTitle>Limited time: organic grocery bundles</BannerTitle>
          <BannerDescription>
            Save more with curated bundles of fresh produce, pantry staples, and wellness picks chosen for everyday enjoyment.
          </BannerDescription>
        </BannerText>
        <BannerButton href="/shop">Explore bundles</BannerButton>
      </BannerSection>
    </BannerWrapper>
  );
}