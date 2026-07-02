import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { contactAPI, siteSettingsAPI } from '../services/api';

const Page = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  gap: 32px;

  @media (min-width: 768px) {
    padding: 60px 24px;
    gap: 40px;
  }
`;

const PageHeader = styled.div`
  display: grid;
  gap: 12px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  color: #1b4332;

  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.7;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
`;

const ContactInfo = styled.div`
  display: grid;
  gap: 16px;
  position: sticky;
  top: 110px;
  @media (max-width: 900px) {
    position: relative;
    top: 0;
  }
`;

const InfoCard = styled.div`
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  background: #f8fbf8;
  border-radius: 14px;
  border: 1px solid #e8f4e8;
`;

const IconWrapper = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #6cb24b;
  display: grid;
  place-items: center;
  color: #ffffff;
  flex-shrink: 0;
  font-size: 0.85rem;
`;

const InfoText = styled.div`
  display: grid;
  gap: 3px;
`;

const InfoTitle = styled.h3`
  margin: 0;
  color: #1b4332;
  font-weight: 700;
  font-size: 0.9rem;
`;

const InfoValue = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
`;

const FormWrapper = styled.div`
  display: grid;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  color: #1b4332;
  font-weight: 600;
  font-size: 0.85rem;
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #6cb24b;
    box-shadow: 0 0 0 3px rgba(108, 178, 75, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 110px;

  &:focus {
    outline: none;
    border-color: #6cb24b;
    box-shadow: 0 0 0 3px rgba(108, 178, 75, 0.1);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  padding: 11px 28px;
  background: #6cb24b;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  letter-spacing: 0.02em;

  &:hover {
    background: #5fa03d;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [info, setInfo] = useState({
    phone: '9942585985',
    email: 'organicstore@gmail.com',
    address: '123 Organic Street, Tech City, Hyderabad',
  });

  useEffect(() => {
    let alive = true;
    siteSettingsAPI.get()
      .then((res) => { if (alive && res?.data) setInfo((prev) => ({ ...prev, ...res.data })); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error('Please fill in your name, email and message.');
    }
    try {
      const res = await contactAPI.send(formData);
      toast.success(res?.message || 'Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <Page>
      <PageHeader>
        <Title>Contact Us</Title>
        <Description>We'd love to hear from you. Get in touch with us today!</Description>
      </PageHeader>

      <Content>
        <ContactInfo>
          <InfoCard>
            <IconWrapper><FaPhone /></IconWrapper>
            <InfoText>
              <InfoTitle>Phone</InfoTitle>
              <InfoValue>{info.phone}</InfoValue>
            </InfoText>
          </InfoCard>

          <InfoCard>
            <IconWrapper><FaEnvelope /></IconWrapper>
            <InfoText>
              <InfoTitle>Email</InfoTitle>
              <InfoValue>{info.email}</InfoValue>
            </InfoText>
          </InfoCard>

          <InfoCard>
            <IconWrapper><FaMapMarkerAlt /></IconWrapper>
            <InfoText>
              <InfoTitle>Address</InfoTitle>
              <InfoValue>{info.address}</InfoValue>
            </InfoText>
          </InfoCard>
        </ContactInfo>

        <FormWrapper>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="message">Message</Label>
              <TextArea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="Write your message here..." />
            </FormGroup>

            <ButtonRow>
              <SubmitButton type="submit">Send Message →</SubmitButton>
            </ButtonRow>
          </form>
        </FormWrapper>
      </Content>
    </Page>
  );
}