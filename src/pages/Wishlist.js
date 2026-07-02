import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowRight, FaHeartBroken } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Page = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 24px;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 900;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Count = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
`;

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #fff;
  border: 1.5px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  }
`;

const ImageWrap = styled.div`
  position: relative;
  padding: 16px 16px 0;
`;

const Image = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
  background: #f8fafc;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.95);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
  &:hover { transform: scale(1.1); background: #fef2f2; }
`;

const Body = styled.div`
  padding: 16px;
`;

const Category = styled.div`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #16a34a;
  margin-bottom: 6px;
`;

const Name = styled(Link)`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  text-decoration: none;
  line-height: 1.4;
  display: block;
  margin-bottom: 8px;
  &:hover { color: #16a34a; }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
`;

const OldPrice = styled.span`
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 600;
`;

const AddBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #1e293b;
    transform: scale(1.02);
  }
  &:active { transform: scale(0.98); }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 40px;
  color: #ef4444;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1.4rem;
  color: #0f172a;
  font-weight: 900;
`;

const EmptyText = styled.p`
  margin: 0 0 24px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
`;

const ShopBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
  }
`;

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <Page>
        <Inner>
          <EmptyState>
            <EmptyIcon><FaHeartBroken /></EmptyIcon>
            <EmptyTitle>Your Wishlist is Empty</EmptyTitle>
            <EmptyText>Save your favorite organic products here and shop them anytime.</EmptyText>
            <ShopBtn to="/shop">Browse Products <FaArrowRight size={12} /></ShopBtn>
          </EmptyState>
        </Inner>
      </Page>
    );
  }

  return (
    <Page>
      <Inner>
        <Header>
          <div>
            <Title><FaHeart color="#ef4444" /> My Wishlist</Title>
            <Count>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</Count>
          </div>
          <ClearBtn onClick={clearWishlist}>
            <FaTrash size={12} /> Clear All
          </ClearBtn>
        </Header>

        <Grid>
          {wishlist.map(product => (
            <Card key={product.id}>
              <ImageWrap>
                <Image src={product.image} alt={product.name} loading="lazy" />
                <RemoveBtn onClick={() => removeFromWishlist(product.id)}>
                  <FaTrash size={12} />
                </RemoveBtn>
              </ImageWrap>
              <Body>
                <Category>{product.category}</Category>
                <Name to={`/product/${product.id}`}>{product.name}</Name>
                <PriceRow>
                  <Price>₹{product.price.toFixed(2)}</Price>
                  {product.originalPrice && (
                    <OldPrice>₹{product.originalPrice.toFixed(2)}</OldPrice>
                  )}
                </PriceRow>
                <AddBtn onClick={() => addToCart(product, 1)}>
                  <FaShoppingCart size={12} /> Add to Cart
                </AddBtn>
              </Body>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Page>
  );
}