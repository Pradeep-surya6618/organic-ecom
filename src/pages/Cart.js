import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Page = styled.section`
  padding: 40px 16px;
  display: grid;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  @media (min-width: 768px) { padding: 40px 24px; }
`;

const CartPageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e7e5e4;
  h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #1b4332;
    display: flex;
    align-items: center;
    gap: 12px;
    @media (min-width: 768px) { font-size: 2rem; }
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 920px) {
    grid-template-columns: 1.4fr 0.85fr;
    gap: 32px;
  }
`;

const CartCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 16px;
  border: 1px solid #e7e5e4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow-x: auto;
  @media (min-width: 768px) { padding: 28px; }
`;

const CartTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  min-width: 480px;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 12px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.8rem;
  border-bottom: 2px solid #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.9rem;
`;

const ProductImage = styled.img`
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  background: #f5f5f4;
  flex-shrink: 0;
  @media (min-width: 768px) { width: 80px; height: 80px; }
`;

const QuantityButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #16a34a;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #f0fdf4; border-color: #16a34a; }
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover { background: #dc2626; transform: translateY(-1px); }
`;

const SummaryCard = styled.aside`
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px 20px;
  border: 2px solid #bbf7d0;
  box-shadow: 0 4px 16px rgba(34,197,94,0.08);
  height: fit-content;
  @media (min-width: 920px) { position: sticky; top: 100px; padding: 32px; }
`;

const SummaryTitle = styled.h2`
  margin: 0 0 8px 0;
  color: #1b4332;
  font-size: 1.2rem;
  font-weight: 700;
`;

const SummaryDesc = styled.p`
  color: #64748b;
  font-size: 0.85rem;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 0;
  color: #1b4332;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(186,247,208,0.4);
  &:last-of-type {
    border-bottom: 2px solid #16a34a;
    font-size: 1.05rem;
    color: #16a34a;
    padding-top: 14px;
    padding-bottom: 14px;
  }
`;

const CheckoutButton = styled(Link)`
  display: inline-flex;
  width: 100%;
  margin-top: 24px;
  padding: 13px 24px;
  border-radius: 10px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(22,163,74,0.2);
  box-sizing: border-box;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(22,163,74,0.3); }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 2px dashed #bbf7d0;
  h2 { margin: 0 0 12px 0; font-size: 1.5rem; color: #1b4332; }
  p { margin: 0 0 28px 0; color: #64748b; font-size: 0.9rem; line-height: 1.6; }
`;

const ShopLink = styled(Link)`
  display: inline-block;
  padding: 11px 28px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(22,163,74,0.2); }
`;

export default function Cart() {
  // CartContext stores items as flat objects: { id, name, price, image, category, quantity }
  // NOT nested as item.product — so we use item.id, item.name, item.image etc. directly
  const { items, subtotal, shipping, tax, total, updateQuantity, removeItem } = useCart();

  // Filter out any corrupted items that may be in localStorage
  const validItems = items.filter(item => item && item.id && item.name);

  if (validItems.length === 0) {
    return (
      <Page>
        <CartPageHeader>
          <h1><FaShoppingCart /> Shopping Cart</h1>
        </CartPageHeader>
        <EmptyCart>
          <h2>Your cart is empty</h2>
          <p>
            Looks like you haven't added any products yet.<br />
            Browse our collection of fresh, organic products.
          </p>
          <ShopLink to="/shop">Continue Shopping</ShopLink>
        </EmptyCart>
      </Page>
    );
  }

  return (
    <Page>
      <CartPageHeader>
        <h1>
          <FaShoppingCart /> Shopping Cart ({validItems.length} item{validItems.length !== 1 ? 's' : ''})
        </h1>
      </CartPageHeader>

      <Grid>
        <CartCard>
          <h3 style={{ margin: '0 0 4px 0', color: '#1b4332', fontSize: '1rem' }}>Items in Cart</h3>
          <CartTable>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Price</Th>
                <Th>Qty</Th>
                <Th>Total</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {validItems.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {item.image && (
                        <ProductImage src={item.image} alt={item.name} />
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>
                          {item.name}
                        </p>
                        {item.category && (
                          <p style={{ margin: '3px 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>
                            {item.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td style={{ whiteSpace: 'nowrap' }}>₹{Number(item.price).toFixed(2)}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <QuantityButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</QuantityButton>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <QuantityButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</QuantityButton>
                    </div>
                  </Td>
                  <Td style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </Td>
                  <Td>
                    <RemoveButton onClick={() => removeItem(item.id)}>Remove</RemoveButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </CartTable>
        </CartCard>

        <SummaryCard>
          <SummaryTitle>Order Summary</SummaryTitle>
          <SummaryDesc>Review your order before checkout</SummaryDesc>

          <SummaryLine>
            <span>Subtotal</span>
            <span>₹{Number(subtotal).toFixed(2)}</span>
          </SummaryLine>
          <SummaryLine style={{ fontWeight: 500, color: '#64748b', borderBottom: '1px solid rgba(186,247,208,0.4)' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${Number(shipping).toFixed(2)}`}</span>
          </SummaryLine>
          <SummaryLine style={{ fontWeight: 500, color: '#64748b', borderBottom: '1px solid rgba(186,247,208,0.4)' }}>
            <span>Tax (5%)</span>
            <span>₹{Number(tax).toFixed(2)}</span>
          </SummaryLine>
          <SummaryLine>
            <span>Total</span>
            <span>₹{Number(total).toFixed(2)}</span>
          </SummaryLine>

          <CheckoutButton to="/checkout">
            Proceed to Checkout <FaArrowRight size={13} />
          </CheckoutButton>
        </SummaryCard>
      </Grid>
    </Page>
  );
}