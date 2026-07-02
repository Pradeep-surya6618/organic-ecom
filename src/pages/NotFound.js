import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaHome, FaSearch, FaLeaf } from 'react-icons/fa';

const float = keyframes`
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-12px)}
`;
const fadeUp = keyframes`
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
`;

const Page = styled.div`
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:40px 20px;
  background:linear-gradient(180deg,#f0fdf4 0%,#fff 60%);
`;
const Card = styled.div`
  text-align:center;
  max-width:480px;
  animation:${fadeUp} 0.6s ease;
`;

const IconWrap = styled.div`
  width:120px;
  height:120px;
  border-radius:50%;
  background:linear-gradient(135deg,#dcfce7,#bbf7d0);
  display:flex;
  align-items:center;
  justify-content:center;
  margin:0 auto 28px;
  animation:${float} 3s ease-in-out infinite;
  box-shadow:0 8px 32px rgba(22,163,74,0.15);
`;
const Icon = styled.div`
  font-size:48px;
  color:#16a34a;
`;

const Code = styled.h1`
  margin:0;
  font-size:clamp(5rem,12vw,7rem);
  font-weight:900;
  color:#0f172a;
  line-height:1;
  letter-spacing:-4px;
`;
const Title = styled.h2`
  margin:12px 0 16px;
  font-size:1.5rem;
  font-weight:800;
  color:#0f172a;
`;
const Text = styled.p`
  margin:0 0 32px;
  color:#64748b;
  font-size:15px;
  line-height:1.8;
`;

const BtnGroup = styled.div`
  display:flex;
  gap:12px;
  justify-content:center;
  flex-wrap:wrap;
`;
const Btn = styled(Link)`
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:13px 28px;
  border-radius:12px;
  font-size:14px;
  font-weight:800;
  text-decoration:none;
  transition:all 0.2s;
  cursor:pointer;
`;
const PrimaryBtn = styled(Btn)`
  background:#0f172a;
  color:#fff;
  &:hover{background:#1e293b;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15);}
`;
const GhostBtn = styled(Btn)`
  background:#fff;
  color:#374151;
  border:1.5px solid #e2e8f0;
  &:hover{border-color:#16a34a;color:#16a34a;}
`;

const Suggestions = styled.div`
  margin-top:40px;
  padding-top:32px;
  border-top:1px solid #e2e8f0;
`;
const SuggestTitle = styled.p`
  margin:0 0 16px;
  font-size:13px;
  font-weight:700;
  color:#94a3b8;
  text-transform:uppercase;
  letter-spacing:1px;
`;
const SuggestLinks = styled.div`
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
`;
const SuggestLink = styled(Link)`
  padding:8px 16px;
  background:#f8fafc;
  border:1.5px solid #f1f5f9;
  border-radius:999px;
  font-size:13px;
  font-weight:600;
  color:#475569;
  text-decoration:none;
  transition:all 0.2s;
  &:hover{background:#dcfce7;border-color:#bbf7d0;color:#16a34a;}
`;

export default function NotFound() {
  return (
    <Page>
      <Card>
        <IconWrap>
          <Icon><FaLeaf/></Icon>
        </IconWrap>
        <Code>404</Code>
        <Title>Page Not Found</Title>
        <Text>Oops! The page you're looking for seems to have wandered off into the organic fields. Let's get you back on track.</Text>

        <BtnGroup>
          <PrimaryBtn to="/"><FaHome/> Back to Home</PrimaryBtn>
          <GhostBtn to="/shop"><FaSearch/> Browse Shop</GhostBtn>
        </BtnGroup>

        <Suggestions>
          <SuggestTitle>Popular Pages</SuggestTitle>
          <SuggestLinks>
            <SuggestLink to="/shop">All Products</SuggestLink>
            <SuggestLink to="/cart">My Cart</SuggestLink>
            <SuggestLink to="/about">About Us</SuggestLink>
            <SuggestLink to="/contact">Contact</SuggestLink>
          </SuggestLinks>
        </Suggestions>
      </Card>
    </Page>
  );
}