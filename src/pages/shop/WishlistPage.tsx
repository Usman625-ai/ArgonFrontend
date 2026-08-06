import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2, Package, Check } from 'lucide-react';
import api from '../../lib/api';
import type { Product, ApiResponse, PagedResponse } from '../../types';
import { Button, Skeleton, Badge, SmartImage } from '../../components/ui';
import { useAppDispatch } from '../../store';
import { addToCart } from '../../store/cartSlice';
import { formatPrice, getEffectivePrice, getProductImages, getDiscountPercentage } from '../../lib/utils';
import EmptyState from '../../components/shop/EmptyState';
import Pagination from '../../components/shop/Pagination';
import PageHeader from '../../components/shop/PageHeader';

export default function WishlistPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [movingIds, setMovingIds] = useState<number[]>([]);
  const [movedIds, setMovedIds] = useState<number[]>([]);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PagedResponse<Product>>>('/api/customer/wishlist', { params: { page, size: 12 } });
      setItems(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
      setTotalElements(res.data.data.totalElements || 0);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const removeFromWishlist = async (productId: number) => {
    try {
      await api.delete(`/api/customer/wishlist/${productId}`);
      setItems((prev) => prev.filter((p) => p.id !== productId));
      setTotalElements((prev) => prev - 1);
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove from wishlist'); }
  };

  const moveToCart = async (product: Product) => {
    setMovingIds((p) => [...p, product.id]);
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      await api.delete(`/api/customer/wishlist/${product.id}`);
      setMovedIds((p) => [...p, product.id]);
      toast.success('Moved to cart');
      setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== product.id));
        setTotalElements((prev) => prev - 1);
        setMovedIds((p) => p.filter((id) => id !== product.id));
      }, 550);
    } catch (err) { toast.error(err as string); } finally { setMovingIds((p) => p.filter((id) => id !== product.id)); }
  };

  return (
    <div className="pb-10">
      <PageHeader
        icon={Heart}
        eyebrow="Saved For Later"
        title="My Wishlist"
        subtitle={`${totalElements} item${totalElements !== 1 ? 's' : ''} saved`}
        crumbs={[{ label: 'Wishlist' }]}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border/70 bg-card">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="mt-2 h-8 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love to your wishlist for later." actionLabel="Browse Products" onAction={() => navigate('/shop/products')} />
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {items.map((product, i) => {
                  const images = getProductImages(product);
                  const image = images[0] || '';
                  const effPrice = getEffectivePrice(product);
                  const discount = getDiscountPercentage(product.price, product.discountedPrice);
                  const outOfStock = product.stockQuantity <= 0;
                  const isMoving = movingIds.includes(product.id);
                  const isMoved = movedIds.includes(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      whileHover={{ y: -4 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3), type: 'spring', stiffness: 260, damping: 22 }}
                    >
                      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
                        <AnimatePresence>
                          {isMoved && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-success/95 text-success-foreground backdrop-blur-sm"
                            >
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <Check className="h-5 w-5" />
                              </motion.div>
                              <p className="text-xs font-medium">Moved to cart!</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button onClick={() => navigate(`/shop/product/${product.slug}`)} className="relative aspect-square overflow-hidden bg-muted">
                          {image ? <SmartImage src={image} alt={product.name} className="transition-transform duration-500 group-hover:scale-110" fallbackIcon={<Package className="h-10 w-10" />} /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-10 w-10" /></div>}
                          {discount > 0 && <Badge variant="destructive" className="absolute left-2 top-2">-{discount}%</Badge>}
                          {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-background/60"><Badge variant="secondary">Out of Stock</Badge></div>}
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                            whileTap={{ scale: 0.85 }}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-destructive backdrop-blur transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Remove"
                          >
                            <Heart className="h-3.5 w-3.5 fill-current" />
                          </motion.button>
                        </button>
                        <div className="flex flex-1 flex-col p-3">
                          <p className="text-xs text-muted-foreground">{product.brand || 'Generic'}</p>
                          <button onClick={() => navigate(`/shop/product/${product.slug}`)} className="mt-0.5 line-clamp-2 text-left text-sm font-medium transition-colors hover:text-primary">{product.name}</button>
                          <div className="mt-auto flex items-end justify-between pt-2">
                            <div><span className="text-base font-semibold text-primary">{formatPrice(effPrice)}</span>{discount > 0 && <span className="ml-1 text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>}</div>
                          </div>
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-2">
                            <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:flex-1">
                              <Button size="sm" className="w-full" onClick={() => moveToCart(product)} disabled={outOfStock || isMoving || isMoved} loading={isMoving}><ShoppingCart className="h-3.5 w-3.5" /> <span className="truncate">{isMoving ? 'Moving...' : 'Move to Cart'}</span></Button>
                            </motion.div>
                            <Button size="sm" variant="outline" className="sm:hidden" onClick={() => removeFromWishlist(product.id)} title="Remove"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {totalPages > 1 && <div className="mt-6"><Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} /></div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

