import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCheckCircle, FaPlus, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, orderAPI, addressAPI } from '../services/api';

const EMPTY_ADDRESS = { fullName: '', phone: '', address: '', city: '', state: '', pincode: '', landmark: '', type: 'home' };

const CheckoutLayout = styled.section`
  padding: 40px 24px;
  display: grid;
  gap: 40px;
  grid-template-columns: 1.35fr 0.85fr;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e7e5e4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e7e5e4;

  h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #1b4332;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.3rem;
    }
  }
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  color: #1b4332;
  font-size: 1.3rem;
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.cols || '1fr'};
  gap: 18px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1b4332;
  margin-bottom: 6px;
`;

const Field = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fafaf9;

  &:focus {
    border-color: #16a34a;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }

  &::placeholder {
    color: #a8a29e;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: #ffffff;
  padding: 14px 24px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  font-size: 0.95rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #a8a29e;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #16a34a;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 16px;
  transition: all 0.2s;

  &:hover {
    gap: 12px;
    color: #15803d;
  }
`;

const SummaryWrapper = styled.div`
  align-self: start;
  position: sticky;
  top: 90px;
  height: fit-content;

  @media (max-width: 920px) {
    position: relative;
    top: auto;
  }
`;

const SummaryCard = styled(Card)`
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
  border: 2px solid #bbf7d0;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.08);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(186, 247, 208, 0.3);
  color: #1b4332;
  font-weight: 600;
  font-size: 0.95rem;

  &:last-of-type {
    border-bottom: 2px solid #16a34a;
    font-size: 1.1rem;
    color: #16a34a;
    padding: 14px 0;
    margin-top: 8px;
  }
`;

const EmptyCheckout = styled.div`
  text-align: center;
  padding: 60px 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 2px dashed #bbf7d0;
  grid-column: 1 / -1;

  h1 {
    margin: 0 0 16px 0;
    font-size: 1.8rem;
    color: #1b4332;
  }

  p {
    margin: 0 0 32px 0;
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  a {
    display: inline-block;
    padding: 12px 32px;
    background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 700;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
    }
  }
`;

const PaymentOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid rgba(255, 255, 255, 0.05);
  border-left-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 32px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const OverlayText = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const OverlaySubText = styled.p`
  color: #a3a3a3;
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const LeftCol = styled.div`
  display: grid;
  gap: 20px;
  align-content: start;
`;

const AddressList = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
`;

const AddressOption = styled.label`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${(p) => (p.$selected ? '#16a34a' : '#e7e5e4')};
  background: ${(p) => (p.$selected ? '#f0fdf4' : '#ffffff')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(p) => (p.$selected ? '#16a34a' : '#bbf7d0')};
  }

  input {
    margin-top: 3px;
    accent-color: #16a34a;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
  }
`;

const AddrBody = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

const AddrTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const AddrName = styled.span`
  font-weight: 700;
  color: #1b4332;
  font-size: 0.95rem;
`;

const Tag = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${(p) => (p.$accent ? '#16a34a' : '#f1f5f9')};
  color: ${(p) => (p.$accent ? '#ffffff' : '#64748b')};
`;

const AddrLine = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.5;
`;

const AddrPhone = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AddNewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  border: 2px dashed #bbf7d0;
  background: #f8fbf8;
  color: #16a34a;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;

  &:hover {
    background: #f0fdf4;
    border-color: #16a34a;
  }
`;

const AddrForm = styled.form`
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e7e5e4;
  background: #fafaf9;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  outline: none;
  font-size: 0.95rem;
  background: #ffffff;
  color: #1b4332;
  cursor: pointer;

  &:focus {
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const GhostButton = styled.button`
  padding: 11px 20px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  background: #ffffff;
  color: #64748b;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #f8fafc; }
`;

const SaveButton = styled.button`
  padding: 11px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { transform: translateY(-1px); }
  &:disabled { background: #a8a29e; cursor: not-allowed; transform: none; }
`;

const HelperText = styled.p`
  margin: 0 0 18px 0;
  color: #64748b;
  font-size: 0.85rem;
`;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, tax, total, placeOrder } = useCart();
  const { user, isLoggedIn } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddr(true);
    try {
      const res = await addressAPI.getAll();
      const list = res?.data || [];
      setAddresses(list);
      setSelectedId((prev) => {
        if (prev && list.some((a) => a._id === prev)) return prev;
        const def = list.find((a) => a.isDefault);
        return def?._id || list[0]?._id || null;
      });
      setShowForm(list.length === 0);
    } catch (e) {
      setAddresses([]);
      setShowForm(true);
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchAddresses();
    else setLoadingAddr(false);
  }, [isLoggedIn, fetchAddresses]);

  const handleAddrChange = (field, value) => setAddrForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const { fullName, phone, address, city, state, pincode } = addrForm;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      return toast.error('Please fill all required address fields');
    }
    setSavingAddr(true);
    try {
      const res = await addressAPI.create(addrForm);
      const createdId = res?.data?._id;
      toast.success('Address saved to your account');
      setAddrForm(EMPTY_ADDRESS);
      setShowForm(false);
      await fetchAddresses();
      if (createdId) setSelectedId(createdId);
    } catch (err) {
      toast.error(err?.message || 'Failed to save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const sel = addresses.find((a) => a._id === selectedId);
    if (!sel) {
      return toast.error('Please select or add a delivery address');
    }

    setIsProcessing(true);

    try {
      // 1. Create order on the backend
      const data = await paymentAPI.createOrder(total);

      if (!data.success) {
        toast.error('Failed to initiate payment. Please try again.');
        setIsProcessing(false);
        return;
      }

      // 2. Set up Razorpay Checkout SDK options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
        amount: data.amount,
        currency: data.currency,
        name: 'Organic Store',
        description: 'Payment for Organic Products',
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify signature on the backend
            const verifyData = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyData.success) {
              // Create order in backend database with the verified payment record
              const orderPayload = {
                items,
                shippingAddress: {
                  fullName: sel.fullName,
                  phone: sel.phone,
                  address: sel.address,
                  city: sel.city,
                  state: sel.state,
                  pincode: sel.pincode,
                  landmark: sel.landmark
                },
                paymentMethod: 'online',
                totalAmount: total,
                payment: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  amount: total
                }
              };

              const backendOrder = await orderAPI.placeOrder(orderPayload);

              placeOrder(total);
              navigate('/payment-success', {
                state: {
                  paymentId: response.razorpay_payment_id,
                  orderId: backendOrder?.data?.orderNumber || backendOrder?.data?.data?.orderNumber || data.orderId
                }
              });
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error('An error occurred while verifying the payment.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: sel.fullName,
          email: user?.email || '',
          contact: sel.phone || ''
        },
        theme: {
          color: '#153d2b'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment order creation error:', error);
      toast.error('Error connecting to payment gateway.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <CheckoutLayout>
        <EmptyCheckout>
          <h1>No items to checkout</h1>
          <p>Your cart is empty. Add products before proceeding to checkout.</p>
          <Link to="/shop">Browse Products</Link>
        </EmptyCheckout>
      </CheckoutLayout>
    );
  }

  return (
    <>
      {isProcessing && (
        <PaymentOverlay>
          <Spinner />
          <OverlayText>Awaiting Payment</OverlayText>
          <OverlaySubText>Please complete the transaction in the secure window</OverlaySubText>
        </PaymentOverlay>
      )}
      <CheckoutLayout>
        <LeftCol>
          <Card>
            <HeaderSection>
              <h1>
                <FaMapMarkerAlt /> Delivery Address
              </h1>
            </HeaderSection>

            {!isLoggedIn ? (
              <HelperText>
                Please <Link to="/login" style={{ color: '#16a34a', fontWeight: 700 }}>sign in</Link> to use your saved addresses and place an order.
              </HelperText>
            ) : loadingAddr ? (
              <HelperText>Loading your saved addresses…</HelperText>
            ) : (
              <>
                {addresses.length > 0 && (
                  <>
                    <HelperText>Select where you'd like this order delivered.</HelperText>
                    <AddressList>
                      {addresses.map((a) => (
                        <AddressOption key={a._id} $selected={selectedId === a._id}>
                          <input
                            type="radio"
                            name="delivery-address"
                            checked={selectedId === a._id}
                            onChange={() => setSelectedId(a._id)}
                          />
                          <AddrBody>
                            <AddrTop>
                              <AddrName>{a.fullName}</AddrName>
                              <Tag>{a.type}</Tag>
                              {a.isDefault && <Tag $accent>Default</Tag>}
                            </AddrTop>
                            <AddrLine>
                              {a.address}, {a.city}, {a.state} - {a.pincode}
                              {a.landmark ? ` (${a.landmark})` : ''}
                            </AddrLine>
                            <AddrPhone><FaPhone size={11} /> {a.phone}</AddrPhone>
                          </AddrBody>
                        </AddressOption>
                      ))}
                    </AddressList>
                  </>
                )}

                {showForm ? (
                  <AddrForm onSubmit={handleSaveAddress}>
                    <div>
                      <Label>Full Name *</Label>
                      <Field value={addrForm.fullName} onChange={(e) => handleAddrChange('fullName', e.target.value)} placeholder="John Doe" />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Field value={addrForm.phone} onChange={(e) => handleAddrChange('phone', e.target.value)} placeholder="9876543210" />
                    </div>
                    <div>
                      <Label>Address (house no, street, area) *</Label>
                      <Field value={addrForm.address} onChange={(e) => handleAddrChange('address', e.target.value)} placeholder="123 Green Street" />
                    </div>
                    <FieldGroup cols="1fr 1fr">
                      <div>
                        <Label>City *</Label>
                        <Field value={addrForm.city} onChange={(e) => handleAddrChange('city', e.target.value)} placeholder="Hyderabad" />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Field value={addrForm.state} onChange={(e) => handleAddrChange('state', e.target.value)} placeholder="Telangana" />
                      </div>
                    </FieldGroup>
                    <FieldGroup cols="1fr 1fr">
                      <div>
                        <Label>Pincode *</Label>
                        <Field value={addrForm.pincode} onChange={(e) => handleAddrChange('pincode', e.target.value)} placeholder="500001" />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={addrForm.type} onChange={(e) => handleAddrChange('type', e.target.value)}>
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </Select>
                      </div>
                    </FieldGroup>
                    <div>
                      <Label>Landmark (optional)</Label>
                      <Field value={addrForm.landmark} onChange={(e) => handleAddrChange('landmark', e.target.value)} placeholder="Near the park" />
                    </div>
                    <FormActions>
                      {addresses.length > 0 && (
                        <GhostButton type="button" onClick={() => { setShowForm(false); setAddrForm(EMPTY_ADDRESS); }}>Cancel</GhostButton>
                      )}
                      <SaveButton type="submit" disabled={savingAddr}>{savingAddr ? 'Saving…' : 'Save Address'}</SaveButton>
                    </FormActions>
                  </AddrForm>
                ) : (
                  <AddNewButton type="button" onClick={() => { setAddrForm(EMPTY_ADDRESS); setShowForm(true); }}>
                    <FaPlus size={12} /> Add New Address
                  </AddNewButton>
                )}
              </>
            )}
          </Card>

          {isLoggedIn && addresses.length > 0 && (
            <SubmitButton type="button" onClick={handleSubmit} disabled={isProcessing || !selectedId}>
              <FaCheckCircle size={18} />
              {isProcessing ? 'Processing Payment...' : `Place Order for ₹${total.toFixed(2)}`}
            </SubmitButton>
          )}

          <BackLink to="/cart">
            <FaArrowLeft size={14} />
            Back to Cart
          </BackLink>
        </LeftCol>

      <SummaryWrapper>
        <SummaryCard>
          <Title>Order Summary</Title>
          <Description>
            {items.length} item{items.length !== 1 ? 's' : ''} ready to ship
          </Description>
          <SummaryRow>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </SummaryRow>
          <SummaryRow style={{ fontWeight: 500, color: '#64748b', borderBottom: '1px solid rgba(186, 247, 208, 0.3)' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
          </SummaryRow>
          <SummaryRow style={{ fontWeight: 500, color: '#64748b', borderBottom: '1px solid rgba(186, 247, 208, 0.3)' }}>
            <span>Tax (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </SummaryRow>
        </SummaryCard>
      </SummaryWrapper>
      </CheckoutLayout>
    </>
  );
}