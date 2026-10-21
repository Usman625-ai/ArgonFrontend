import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router doesn't reset scroll position between route changes the way
 * a traditional multi-page site does — the browser keeps whatever scroll
 * offset the previous page was at. Without this, clicking a product card
 * from the bottom of a long product-list page (or the footer) lands you on
 * ProductDetailPage already scrolled down near its footer, forcing a manual
 * scroll up to see the product.
 *
 * Mount this once, above <Routes>, inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}