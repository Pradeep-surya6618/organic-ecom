import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Star, MessageSquarePlus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useReviews } from "../context/ReviewContext";
import { useAuth } from "../context/AuthContext";

const Page = styled.section`
  background: transparent;
  min-height: 100vh;
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
  h1 {
    font-size: 2.2rem;
    font-weight: 900;
    color: #153d2b;
    margin-bottom: 8px;
  }
  p {
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 500;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  align-items: start;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  label {
    font-size: 0.8rem;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input, textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid #cbd5e1;
    font-size: 0.9rem;
    font-weight: 600;
    outline: none;
    transition: all 0.2s;
    background: #fafafa;
    &:focus {
      border-color: #16a34a;
      background: white;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
    }
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
`;

const StarBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${props => props.$filled ? "#fbbf24" : "#cbd5e1"};
  transition: transform 0.1s;
  &:hover {
    transform: scale(1.15);
  }
`;

const SubmitButton = styled.button`
  background: #153d2b;
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background: #166534;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 101, 52, 0.15);
  }
  &:active {
    transform: translateY(0);
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ReviewCard = styled(Card)`
  padding: 24px;
  border-left: 4px solid #16a34a;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AuthorName = styled.p`
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
`;

const ReviewText = styled.p`
  font-size: 0.88rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.6;
`;
const StickyCard = styled(Card)`
  position: sticky;
  top: 120px;
  align-self: start;
  @media (max-width: 860px) {
    position: relative;
    top: 0;
  }
`;

export default function Reviews() {
  const { reviews, submitReview, updateReview, deleteReview } = useReviews();
  const { isLoggedIn, user } = useAuth();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const myEmail = user?.email;
  const displayName = user?.name || user?.fullName || "";

  // Show all approved reviews plus the signed-in user's own (even pending) so
  // they can edit/delete them right away.
  const visibleReviews = reviews.filter(
    (r) => r.status === "approved" || (myEmail && r.userEmail === myEmail)
  );

  const resetForm = () => {
    setRating(5);
    setText("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Please write your review.");
    try {
      if (editingId) {
        await updateReview(editingId, { rating, text });
        toast.success("Review updated");
      } else {
        await submitReview({ rating, text });
        toast.success("Review submitted for moderation");
      }
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Failed to save review");
    }
  };

  const handleEdit = (rev) => {
    setEditingId(rev._id);
    setRating(rev.rating);
    setText(rev.text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      if (editingId === id) resetForm();
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete review");
    }
  };

  return (
    <Page>
      <Header>
        <h1>Customer Reviews</h1>
        <p>Read what our community has to say or submit your own review!</p>
      </Header>

      <Layout>
        {/* Left column: Submit review (sticky) */}
        <StickyCard>
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 mb-5">
            <MessageSquarePlus size={20} className="text-emerald-700" />
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              {editingId ? "Edit Your Review" : "Write a Review"}
            </h3>
          </div>

          {isLoggedIn ? (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Your Name</label>
                <input
                  type="text"
                  value={displayName}
                  readOnly
                  style={{ cursor: "not-allowed", color: "#475569" }}
                />
              </FormGroup>

              <FormGroup>
                <label>Rating</label>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarBtn
                      key={star}
                      type="button"
                      $filled={star <= rating}
                      onClick={() => setRating(star)}
                    >
                      <Star size={20} fill={star <= rating ? "currentColor" : "none"} />
                    </StarBtn>
                  ))}
                </StarRating>
              </FormGroup>

              <FormGroup>
                <label>Review Description</label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </FormGroup>

              <SubmitButton type="submit">{editingId ? "Update Review" : "Submit Review"}</SubmitButton>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 -mt-2"
                >
                  Cancel edit
                </button>
              )}
            </Form>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-stone-500 font-semibold mb-4">
                Please sign in to your account to write a review.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#153d2b] text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/15"
              >
                Sign in to review
              </Link>
            </div>
          )}
        </StickyCard>

        {/* Right column: Reviews display */}
        <ReviewsList>
          {visibleReviews.length > 0 ? (
            visibleReviews.map((rev) => {
              const isOwn = myEmail && rev.userEmail === myEmail;
              return (
                <ReviewCard key={rev._id}>
                  <ReviewHeader>
                    <div>
                      <AuthorName>{rev.author}</AuthorName>
                      <span className="text-[10px] text-stone-400 font-bold">
                        {rev.status === "approved" ? "Verified Customer" : "Pending approval"}
                      </span>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </ReviewHeader>
                  <ReviewText>"{rev.text}"</ReviewText>

                  {isOwn && (
                    <div className="flex items-center gap-3 pt-1 border-t border-stone-100 mt-1">
                      <button
                        onClick={() => handleEdit(rev)}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 hover:text-emerald-900 pt-2"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-red-600 hover:text-red-700 pt-2"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </ReviewCard>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white border border-stone-200 rounded-3xl">
              <p className="text-sm font-bold text-stone-500">No reviews yet. Be the first to write one!</p>
            </div>
          )}
        </ReviewsList>
      </Layout>
    </Page>
  );
}
