import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaShoppingBag, FaArrowRight, FaDownload } from 'react-icons/fa';

const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050505;
  color: #ffffff;
  padding: 24px;
  position: relative;
  overflow: hidden;
`;

const BackgroundEffect = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  z-index: 0;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  z-index: 1;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  animation: ${slideUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const IconWrapper = styled.div`
  color: #22c55e;
  font-size: 80px;
  margin-bottom: 24px;
  animation: ${scaleIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  justify-content: center;
  filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.4));
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${fadeIn} 0.6s ease-out 0.2s forwards;
  opacity: 0;
`;

const Description = styled.p`
  color: #a3a3a3;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 32px 0;
  animation: ${fadeIn} 0.6s ease-out 0.3s forwards;
  opacity: 0;
`;

const DetailBox = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
  animation: ${fadeIn} 0.6s ease-out 0.4s forwards;
  opacity: 0;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  span.label {
    color: #737373;
    font-size: 0.9rem;
  }

  span.value {
    color: #e5e5e5;
    font-weight: 600;
    font-size: 0.95rem;
    font-family: monospace;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeIn} 0.6s ease-out 0.5s forwards;
  opacity: 0;
`;

const PrimaryButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
    background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  color: #e5e5e5;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get payment details from location state, fallback to null
  const paymentId = location.state?.paymentId || 'PAY-XXXX-XXXX';
  const orderId = location.state?.orderId || 'ORD-XXXX-XXXX';

  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container>
      <BackgroundEffect />
      <ContentCard>
        <IconWrapper>
          <FaCheckCircle />
        </IconWrapper>
        
        <Title>Payment Successful!</Title>
        <Description>
          Thank you for your purchase. We've received your order and will begin processing it right away.
        </Description>

        <DetailBox>
          <DetailRow>
            <span className="label">Order ID</span>
            <span className="value">{orderId}</span>
          </DetailRow>
          <DetailRow>
            <span className="label">Payment ID</span>
            <span className="value">{paymentId}</span>
          </DetailRow>
        </DetailBox>

        <ButtonGroup>
          <PrimaryButton onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/orders/${orderId}/invoice`, '_blank')}>
            <FaDownload /> Download Invoice
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/account')} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <FaShoppingBag /> View My Orders
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate('/shop')}>
            Continue Shopping <FaArrowRight size={14} />
          </SecondaryButton>
        </ButtonGroup>
      </ContentCard>
    </Container>
  );
}
