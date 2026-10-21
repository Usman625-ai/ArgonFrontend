import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, Package, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../types';
import { formatPrice, getEffectivePrice, getDiscountPercentage, getProductImages, truncate, cn } from '../../lib/utils';
import { SmartImage } from '../ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/cartSlice';
import api from '../../lib/api';

interface ProductCardProps { product: Product; layout?: 'grid' | 'list'; index?: number; }

function ProductCard({ product, layout = 'grid', index = 0 }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const image = getProductImages(product)[0] || '';
  const price = getEffectivePrice(product);
  const discount = getDiscountPercentage(product.price, product.discountedPrice);
  const outOfStock = product.stockQuantity <= 0;
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    if (outOfStock) { toast.error('Product is out of stock'); return; }
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      toast.success('Added to cart');
      setJustAdded(true); setTimeout(() => setJustAdded(false), 1200);
    } catch (err) { toast.error(err as string); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    setLiked(true);
    try { await api.post(`/api/customer/wishlist/${product.id}`); toast.success('Added to wishlist'); }
    catch (err: unknown) {
      setLiked(false);
      const e2 = err as { response?: { data?: { error?: string } } };
      toast.error(e2.response?.data?.error || 'Failed to add to wishlist');
    }
  };

  const wish = (cls: string) => (
    <button onClick={handleWishlist} aria-label="Add to wishlist" className={cn('flex items-center justify-center rounded-full bg-card/90 text-foreground backdrop-blur transition-transform active:scale-90 hover:bg-card', cls)}>
      <Heart className={cn('h-4 w-4 transition-colors', liked && 'fill-destructive text-destructive')} />
    </button>
  );
  const addBtn = (cls: string) => (
    <button onClick={handleAddToCart} disabled={outOfStock} aria-label="Add to cart" className={cn('flex items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-90 hover:opacity-85 disabled:opacity-40', cls)}>
      <AnimatePresence mode="wait" initial={false}>
        {justAdded
          ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-4 w-4" /></motion.span>
          : <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ShoppingBag className="h-4 w-4" /></motion.span>}
      </AnimatePresence>
    </button>
  );

  const Price = ({ small }: { small?: boolean }) => (
    <div className="flex items-baseline gap-2">
      <span className={cn('font-semibold tabular-nums', small ? 'text-sm' : 'text-[0.95rem]')}>{formatPrice(price)}</span>
      {discount > 0 && <span className="text-xs text-muted-foreground line-through tabular-nums">{formatPrice(product.price)}</span>}
    </div>
  );

  if (layout === 'list') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.24) }}>
        <Link to={`/shop/product/${product.slug}`} className="group flex gap-4 rounded-3xl bg-card p-3 ring-1 ring-border/50 transition-shadow hover:shadow-luxury-lg">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-32 sm:w-32">
            <SmartImage src={image} alt={product.name} width={300} className="h-full w-full transition-transform duration-500 group-hover:scale-105" fallbackIcon={<Package className="h-8 w-8" />} />
            {discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-[0.65rem] font-semibold text-background">−{discount}%</span>}
          </div>
          <div className="flex min-w-0 flex-1 flex-col py-1">
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{product.brand || product.categoryName || 'Argon'}</p>
            <h3 className="mt-0.5 truncate text-[0.95rem] font-medium">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription || truncate(product.description, 110)}</p>
            <div className="mt-auto flex items-end justify-between pt-3">
              <div><Price /><div className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-muted-foreground"><Star className="h-3 w-3 fill-gold text-gold" />{product.averageRating?.toFixed(1) || '0.0'} ({product.totalReviews || 0})</div></div>
              <div className="flex gap-1.5">{wish('h-9 w-9 border border-border')}{addBtn('h-9 w-9')}</div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.24), ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Link to={`/shop/product/${product.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
          <SmartImage src={image} alt={product.name} width={500} aspect="auto" className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]" fallbackIcon={<Package className="h-9 w-9" />} />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount > 0 && <span className="rounded-full bg-foreground px-2.5 py-1 text-[0.68rem] font-semibold text-background">−{discount}%</span>}
            {product.featured && <span className="rounded-full bg-gold px-2.5 py-1 text-[0.68rem] font-semibold text-white">Featured</span>}
          </div>
          {wish('absolute right-3 top-3 h-9 w-9 shadow-sm')}
          {addBtn('absolute bottom-3 right-3 h-10 w-10 shadow-md [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-all [@media(hover:hover)]:duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100')}
          {outOfStock && <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]"><span className="rounded-full bg-card px-3.5 py-1.5 text-xs font-medium shadow-sm">Sold out</span></div>}
        </div>
        <div className="px-1 pt-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[0.92rem] font-medium">{product.name}</h3>
            <span className="mt-0.5 flex shrink-0 items-center gap-0.5 text-[0.72rem] text-muted-foreground"><Star className="h-3 w-3 fill-gold text-gold" />{product.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.brand || product.categoryName || product.shopName || 'Argon'}</p>
          <div className="mt-1.5"><Price /></div>
        </div>
      </Link>
    </motion.div>
  );
}

export default memo(ProductCard);
