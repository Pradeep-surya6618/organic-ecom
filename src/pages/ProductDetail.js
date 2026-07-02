import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";

/* ─── Page ─────────────────────────────────────────────────── */

const Page = styled.section`
  background: #f4f6fb;
  min-height: 100vh;
  padding: 18px 24px 40px;
  @media (max-width: 768px) { padding: 12px 12px 32px; }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 14px;
  a {
    color: #94a3b8;
    text-decoration: none;
    &:hover { color: #0f3460; }
  }
`;

const Sep = styled.span` color: #cbd5e1; `;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 18px;
  max-width: 1000px;
  margin: 0 auto;
  align-items: start;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

/* ─── LEFT: Image Card ─────────────────────────────────────── */

const ImageCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #eef0f7;
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Stick the image column while the details column scrolls. */
  @media (min-width: 861px) {
    position: sticky;
    top: 120px;
    align-self: start;
  }
`;

const BadgeStack = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 2;
`;

const Pill = styled.span`
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  background: ${({ v }) =>
    v === "stock"   ? "#dcfce7" :
    v === "nostock" ? "#fee2e2" : "#fff7ed"};
  color: ${({ v }) =>
    v === "stock"   ? "#15803d" :
    v === "nostock" ? "#dc2626" : "#c2410c"};
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
  display: block;
`;

const ThumbRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Thumb = styled.button`
  width: 58px;
  height: 58px;
  border-radius: 8px;
  border: 2px solid ${({ $active }) => ($active ? "#0f3460" : "#eef0f7")};
  background: #f8f9fd;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s;
  flex-shrink: 0;
  &:hover { border-color: #0f3460; }
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

/* ─── RIGHT: Details Card ──────────────────────────────────── */

const DetailsCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #eef0f7;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const CatTag = styled.span`
  width: fit-content;
  padding: 4px 12px;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.55rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.2;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GreenBadge = styled.span`
  background: #166534;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 5px;
  letter-spacing: 0.3px;
`;

const StarRow = styled.span`
  display: flex;
  gap: 1px;
  font-size: 13px;
`;

const RevText = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
`;

const Hr = styled.hr`
  border: none;
  border-top: 1.5px solid #f1f5f9;
  margin: 0;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
`;

const BigPrice = styled.span`
  font-size: 1.85rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
`;

const StrikePrice = styled.span`
  font-size: 0.95rem;
  color: #b0b8cc;
  text-decoration: line-through;
`;

const OffBadge = styled.span`
  background: #fff7ed;
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 5px;
`;

const Desc = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 13.5px;
  line-height: 1.75;
`;

/* Meta 2x2 grid */
const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const MetaBox = styled.div`
  background: #f8faff;
  border: 1px solid #eef0f7;
  border-radius: 10px;
  padding: 10px 13px;
`;

const ML = styled.div`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin-bottom: 3px;
`;

const MV = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
`;

/* Delivery strip */
const DeliveryStrip = styled.div`
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #166534;
`;

/* Quantity row */
const QtyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8faff;
  border: 1px solid #eef0f7;
  border-radius: 10px;
  padding: 9px 14px;
`;

const QtyLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #475569;
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  overflow: hidden;
`;

const QtyBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 800;
  color: #0f3460;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover { background: #f1f5f9; }
  &:active { background: #e2e8f0; }
`;

const QtyNum = styled.span`
  min-width: 36px;
  text-align: center;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  border-left: 1.5px solid #e2e8f0;
  border-right: 1.5px solid #e2e8f0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Buttons */
const BtnGroup = styled.div`
  display: grid;
  gap: 9px;
`;

const CartBtn = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  background: #0f3460;
  color: #fff;
  padding: 13px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: background 0.2s, transform 0.1s;
  &:hover { background: #1e4d8c; }
  &:active { transform: scale(0.99); }
  &:disabled { background: #94a3b8; cursor: not-allowed; }
`;

const BuyBtn = styled.button`
  width: 100%;
  border: 2px solid #0f3460;
  border-radius: 12px;
  background: #fff;
  color: #0f3460;
  padding: 11px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s;
  &:hover { background: #0f3460; color: #fff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BackBtn = styled(Link)`
  text-align: center;
  display: block;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  &:hover { color: #0f3460; }
`;

/* Toast */
const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #166534;
  color: #fff;
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  animation: popUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
  @keyframes popUp {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

/* ─── Stars helper ─────────────────────────────────────────── */
function Stars({ r }) {
  return (
    <StarRow>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(r) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </StarRow>
  );
}

/* ─── Component ────────────────────────────────────────────── */
export default function ProductDetail() {
  const { products } = useProducts();
  const { id } = useParams();
  const product = products.find(p => String(p.id) === String(id));
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [gallery, setGallery] = useState([]);
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // The product list omits the full image gallery for performance — fetch the
  // single product to get all its images for the detail page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { productAPI } = await import("../services/api");
        const res = await productAPI.getProduct(id);
        const d = res?.data || {};
        const main = d.imageUrl;
        const rest = (d.imageUrls || []).filter((u) => u && u !== main);
        const all = [main, ...rest].filter(Boolean);
        if (!cancelled) {
          setGallery(all);
          setActiveThumb(0);
        }
      } catch (e) {
        /* fall back to the main image below */
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (!product) return (
    <Page>
      <h2 style={{ color: "#0f172a" }}>Product not found</h2>
      <BackBtn to="/shop">← Back to shop</BackBtn>
    </Page>
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const imgs = gallery.length ? gallery : (product.image ? [product.image] : []);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast();
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  return (
    <Page>
      <Breadcrumb>
        <Link to="/">Home</Link><Sep>/</Sep>
        <Link to="/shop">Shop</Link><Sep>/</Sep>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>{product.name}</span>
      </Breadcrumb>

      <Wrapper>
        {/* ── Left ── */}
        <ImageCard>
          <BadgeStack>
            <Pill v={product.inStock ? "stock" : "nostock"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Pill>
            {discount && <Pill v="sale">{discount}% OFF</Pill>}
          </BadgeStack>

          <MainImage src={imgs[activeThumb] || product.image} alt={product.name} />

          {imgs.length > 1 && (
            <ThumbRow>
              {imgs.map((src, i) => (
                <Thumb key={i} $active={activeThumb === i} onClick={() => setActiveThumb(i)}>
                  <img src={src} alt={`view ${i + 1}`} />
                </Thumb>
              ))}
            </ThumbRow>
          )}
        </ImageCard>

        {/* ── Right ── */}
        <DetailsCard>
          <CatTag>{product.category}</CatTag>
          <Title>{product.name}</Title>

          <RatingRow>
            <GreenBadge>{product.rating} ★</GreenBadge>
            <Stars r={product.rating} />
            <RevText>{product.reviews} reviews</RevText>
          </RatingRow>

          <Hr />

          <PriceRow>
            <BigPrice>₹{product.price.toFixed(2)}</BigPrice>
            {product.originalPrice && (
              <>
                <StrikePrice>₹{product.originalPrice.toFixed(2)}</StrikePrice>
                {discount && <OffBadge>{discount}% off</OffBadge>}
              </>
            )}
          </PriceRow>

          <Desc>{product.description}</Desc>

          <MetaGrid>
            <MetaBox><ML>Origin</ML><MV>Organic Farm</MV></MetaBox>
            <MetaBox>
              <ML>Availability</ML>
              <MV style={{ color: product.inStock ? "#15803d" : "#dc2626" }}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </MV>
            </MetaBox>
            <MetaBox><ML>Weight</ML><MV>{product.weight || "—"}</MV></MetaBox>
            <MetaBox><ML>Rating</ML><MV>{product.rating} / 5</MV></MetaBox>
          </MetaGrid>

          <DeliveryStrip>
            🚚 Free delivery in <strong style={{ marginLeft: 3 }}>10 minutes</strong>
          </DeliveryStrip>

          <QtyRow>
            <QtyLabel>Quantity</QtyLabel>
            <QtyControls>
              <QtyBtn type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>−</QtyBtn>
              <QtyNum>{qty}</QtyNum>
              <QtyBtn type="button" onClick={() => setQty(q => q + 1)}>+</QtyBtn>
            </QtyControls>
          </QtyRow>

          <BtnGroup>
            <CartBtn type="button" disabled={!product.inStock} onClick={handleAddToCart}>
              🛒 Add to Cart
            </CartBtn>
            <BuyBtn type="button" disabled={!product.inStock} onClick={handleBuyNow}>
              ⚡ Buy Now
            </BuyBtn>
            <BackBtn to="/shop">← Continue shopping</BackBtn>
          </BtnGroup>
        </DetailsCard>
      </Wrapper>

      {toast && (
        <Toast>✅ {qty} × {product.name} added to cart!</Toast>
      )}
    </Page>
  );
}