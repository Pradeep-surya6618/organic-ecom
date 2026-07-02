import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets the scroll position to the top whenever the route (path) changes.
// Without this, React Router keeps the previous scroll position — so navigating
// from the footer to another page would leave you at the bottom.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
