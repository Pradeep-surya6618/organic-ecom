import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { testimonialAPI, adminTestimonialAPI } from '../services/api';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);        // approved + own (storefront)
  const [adminReviews, setAdminReviews] = useState([]); // all reviews (admin panel)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await testimonialAPI.getAll();
      setReviews(res?.data || []);
    } catch (e) {
      console.error('Failed to load reviews:', e.message || e);
    }
  }, []);

  const fetchAdminReviews = useCallback(async () => {
    try {
      const res = await adminTestimonialAPI.getAll();
      setAdminReviews(res?.data || []);
    } catch (e) {
      console.error('Failed to load admin reviews:', e.message || e);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  // ── Customer actions (own reviews) ──
  const submitReview = async ({ rating, text }) => {
    await testimonialAPI.create({ rating, text });
    await fetchReviews();
  };
  const updateReview = async (id, data) => {
    await testimonialAPI.update(id, data);
    await fetchReviews();
  };
  const deleteReview = async (id) => {
    await testimonialAPI.remove(id);
    await fetchReviews();
  };

  // ── Admin moderation ──
  const approveReview = async (id) => {
    await adminTestimonialAPI.approve(id);
    await Promise.all([fetchAdminReviews(), fetchReviews()]);
  };
  const adminDeleteReview = async (id) => {
    await adminTestimonialAPI.remove(id);
    await Promise.all([fetchAdminReviews(), fetchReviews()]);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        adminReviews,
        approvedReviews,
        fetchReviews,
        fetchAdminReviews,
        submitReview,
        updateReview,
        deleteReview,
        approveReview,
        adminDeleteReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};
