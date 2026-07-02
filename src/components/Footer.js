import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaLeaf } from 'react-icons/fa';
import { siteSettingsAPI, categoryAPI } from '../services/api';

const FooterWrap = styled.footer`
  background:#0f172a;
  color:#cbd5e1;
  font-size:14px;
`;

const Main = styled.div`
  max-width:1200px;
  margin:0 auto;
  padding:56px 40px 32px;
  display:grid;
  grid-template-columns:1.3fr 1fr 1fr 1fr;
  gap:40px;
  @media(max-width:960px){grid-template-columns:1fr 1fr;}
  @media(max-width:500px){grid-template-columns:1fr;padding:40px 16px 24px;}
`;

const Col = styled.div``;
const Logo = styled.div`
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:16px;
  font-size:1.3rem;
  font-weight:900;
  color:#fff;
`;
const LogoIcon = styled.div`
  width:36px;
  height:36px;
  border-radius:10px;
  background:linear-gradient(135deg,#16a34a,#22c55e);
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-size:16px;
`;
const Desc = styled.p`
  margin:0 0 20px;
  line-height:1.8;
  color:#94a3b8;
  font-size:13px;
`;

const ContactItem = styled.div`
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:10px;
  font-size:13px;
  color:#94a3b8;
`;
const ContactIcon = styled.div`
  width:28px;
  height:28px;
  border-radius:8px;
  background:rgba(255,255,255,0.05);
  display:flex;
  align-items:center;
  justify-content:center;
  color:#22c55e;
  font-size:12px;
  flex-shrink:0;
`;

const ColTitle = styled.h4`
  margin:0 0 18px;
  font-size:13px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:1px;
  color:#fff;
`;
const LinkList = styled.ul`
  list-style:none;
  margin:0;
  padding:0;
`;
const LinkItem = styled.li`
  margin-bottom:10px;
`;
const FooterLink = styled(Link)`
  color:#94a3b8;
  text-decoration:none;
  font-size:13px;
  font-weight:600;
  transition:color 0.2s;
  display:flex;
  align-items:center;
  gap:6px;
  &:hover{color:#22c55e;}
`;

const Socials = styled.div`
  display:flex;
  gap:8px;
  margin-top:16px;
`;
const SocialBtn = styled.a`
  width:34px;
  height:34px;
  border-radius:8px;
  background:rgba(255,255,255,0.05);
  display:flex;
  align-items:center;
  justify-content:center;
  color:#94a3b8;
  font-size:13px;
  transition:all 0.2s;
  text-decoration:none;
  &:hover{background:#16a34a;color:#fff;}
`;

const Bottom = styled.div`
  border-top:1px solid rgba(255,255,255,0.06);
  padding:20px 40px;
  @media(max-width:768px){padding:16px;}
`;
const BottomInner = styled.div`
  max-width:1200px;
  margin:0 auto;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
`;
const Copyright = styled.p`
  margin:0;
  font-size:12px;
  color:#64748b;
`;
const BottomLinks = styled.div`
  display:flex;
  gap:20px;
`;
const BottomLink = styled(Link)`
  font-size:12px;
  color:#64748b;
  text-decoration:none;
  font-weight:600;
  transition:color 0.2s;
  &:hover{color:#22c55e;}
`;

export default function Footer() {
  const year = new Date().getFullYear();
  const [info, setInfo] = useState({
    phone: '9942585985',
    email: 'organicstore@gmail.com',
    address: '123 Organic Street, Tech City, Hyderabad',
    social: { facebook: '', twitter: '', instagram: '', pinterest: '' },
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let alive = true;
    siteSettingsAPI.get()
      .then((res) => { if (alive && res?.data) setInfo((prev) => ({ ...prev, ...res.data, social: { ...prev.social, ...(res.data.social || {}) } })); })
      .catch(() => {});
    categoryAPI.getAll()
      .then((res) => {
        if (!alive) return;
        const list = res?.data?.categories || res?.data || [];
        // Show the 5 most recently added categories.
        const recent = [...list]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);
        setCategories(recent);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const social = info.social || {};
  const socialProps = (url) => (url ? { href: url, target: '_blank', rel: 'noreferrer' } : { href: '#' });

  return (
    <FooterWrap>
      <Main>
        <Col>
          <Logo>
            <LogoIcon><FaLeaf/></LogoIcon>
            Organic Store
          </Logo>
          <Desc>The AI-powered organic grocery. Chat with our smart assistant to discover products, turn recipes into a ready cart, and track orders — with farm-fresh delivery in 10 minutes.</Desc>
          <ContactItem>
            <ContactIcon><FaPhone/></ContactIcon>
            {info.phone}
          </ContactItem>
          <ContactItem>
            <ContactIcon><FaEnvelope/></ContactIcon>
            {info.email}
          </ContactItem>
          <ContactItem>
            <ContactIcon><FaMapMarkerAlt/></ContactIcon>
            {info.address}
          </ContactItem>
          <Socials>
            <SocialBtn {...socialProps(social.facebook)}><FaFacebookF/></SocialBtn>
            <SocialBtn {...socialProps(social.twitter)}><FaTwitter/></SocialBtn>
            <SocialBtn {...socialProps(social.instagram)}><FaInstagram/></SocialBtn>
            <SocialBtn {...socialProps(social.pinterest)}><FaPinterestP/></SocialBtn>
          </Socials>
        </Col>

        <Col>
          <ColTitle>Quick Links</ColTitle>
          <LinkList>
            <LinkItem><FooterLink to="/">Home</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/shop">Shop</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/recipes">Organic Recipes</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/about">About Us</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/reviews">Customer Reviews</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/contact">Contact</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/cart">My Cart</FooterLink></LinkItem>
          </LinkList>
        </Col>

        <Col>
          <ColTitle>Categories</ColTitle>
          <LinkList>
            {categories.length === 0 ? (
              <LinkItem><FooterLink to="/shop">All Products</FooterLink></LinkItem>
            ) : (
              categories.map((c) => (
                <LinkItem key={c._id || c.slug}>
                  <FooterLink to={`/shop?category=${c.slug}`}>{c.name}</FooterLink>
                </LinkItem>
              ))
            )}
          </LinkList>
        </Col>

        <Col>
          <ColTitle>Support</ColTitle>
          <LinkList>
            <LinkItem><FooterLink to="/page/faq">FAQ</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/page/shipping">Shipping Info</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/page/returns">Returns</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/page/privacy">Privacy Policy</FooterLink></LinkItem>
            <LinkItem><FooterLink to="/page/terms">Terms of Service</FooterLink></LinkItem>
          </LinkList>
        </Col>
      </Main>

      <Bottom>
        <BottomInner>
          <Copyright>© {year} Organic Store. All rights reserved.</Copyright>
          <BottomLinks>
            <BottomLink to="/page/privacy">Privacy</BottomLink>
            <BottomLink to="/page/terms">Terms</BottomLink>
            <BottomLink to="/page/cookies">Cookies</BottomLink>
          </BottomLinks>
        </BottomInner>
      </Bottom>
    </FooterWrap>
  );
}