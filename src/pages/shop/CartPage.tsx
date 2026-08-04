import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import type { Cart } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { Button, Skeleton, Badge, SmartImage } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/cartSlice';
import EmptyState from '../../components/shop/EmptyState';
import CouponSelector, { type AppliedCoupon } from '../../components/shop/CouponSelector';
import PageHeader from '../../components/shop/PageHeader';

const FREE_SHIPPING_THRESHOLD = 5000;

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit: { opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.22, ease: 'easeIn' } },
} as const;

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { cart, isLoading } = useAppSelector((s) => s.cart);
  const [localCart, setLocalCart] = useState<Cart | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | undefined>();
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) return;
    await dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => { loadCart(); }, [loadCart]);
  useEffect(() => { setLocalCart(cart); }, [cart]);

  const handleQuantity = async (itemId: number, quantity: number, stock: number) => {
    if (quantity < 1) return;
    if (quantity > stock) { toast.error('Cannot exceed available stock'); return; }
    setUpdatingIds((p) => [...p, itemId]);
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      await dispatch(fetchCart());
    } catch (err) { toast.error(err as string); } finally { setUpdatingIds((p) => p.filter((id) => id !== itemId)); }
  };

  const handleRemove = async (itemId: number) => {
    setRemovingIds((p) => [...p, itemId]);
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      await dispatch(fetchCart());
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err as string);
      setRemovingIds((p) => p.filter((id) => id !== itemId));
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(undefined);
    toast.success('Coupon removed');
  };

  const goToCheckout = () => navigate('/shop/checkout', { state: appliedCoupon ? { couponCode: appliedCoupon.code } : undefined });

  if (!isAuthenticated) {
    return <EmptyState icon={ShoppingBag} title="Please login to view your cart" description="You need to be logged in to access your shopping cart." actionLabel="Login" onAction={() => navigate('/login')} />;
  }

  if (isLoading && !localCart) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!localCart || !localCart.items || localCart.items.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Looks like you haven't added anything to your cart yet." actionLabel="Start Shopping" onAction={() => navigate('/shop/products')} />;
  }

  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Math.max(0, localCart.total - discount);
  const shipping = discountedSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : 200;
  const grandTotal = discountedSubtotal + shipping;
  const shippingProgress = Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="pb-28 lg:pb-10">
      <PageHeader
        icon={ShoppingBag}
        eyebrow="Your Selections"
        title="Shopping Cart"
        subtitle={`${localCart.items.length} item${localCart.items.length !== 1 ? 's' : ''} reserved for you`}
        crumbs={[{ label: 'Cart' }]}
        right={<div className="flex items-baseline gap-2"><span className="text-sm text-muted-foreground">Subtotal</span><span className="font-editorial text-3xl font-medium text-primary">{formatPrice(localCart.subtotal)}</span></div>}
      />

      <div className="mx-auto max-w-7xl space-y-7 px-4 pt-8 sm:px-6 lg:px-8">

      {/* Free shipping progress */}
      <motion.div layout className="surface-panel overflow-hidden rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {shipping === 0 ? (
                <motion.span key="unlocked" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }} className="absolute">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </motion.span>
              ) : (
                <motion.span key="locked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }} className="absolute">
                  <Truck className="h-4 w-4 text-primary" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <AnimatePresence mode="wait" initial={false}>
            {shipping === 0 ? (
              <motion.span key="unlocked-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="font-medium text-success">
                You've unlocked free shipping!
              </motion.span>
            ) : (
              <motion.span key="locked-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                Add <strong className="text-foreground">{formatPrice(FREE_SHIPPING_THRESHOLD - discountedSubtotal)}</strong> more for free shipping
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${shippingProgress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className={cn('h-full rounded-full', shipping === 0 ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-primary')}
          />
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div variants={listVariants} initial="hidden" animate="show" className="divide-y divide-border/70 border-y border-border/70">
            <AnimatePresence initial={false}>
              {localCart.items.map((item) => {
                const isUpdating = updatingIds.includes(item.id);
                const isRemoving = removingIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="relative flex gap-4 overflow-hidden rounded-lg px-2 py-5 -mx-2 transition-colors active:bg-accent/40 sm:hover:bg-accent/30"
                  >
                    <motion.div
                      animate={{ scale: isUpdating ? [1, 1.04, 1] : 1 }}
                      transition={{ duration: 0.35 }}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-transparent transition-shadow sm:h-28 sm:w-28"
                    >
                      {item.productImage
                        ? <SmartImage src={item.productImage} alt={item.productName} width={150} className="rounded-lg" fallbackIcon={<Package className="h-8 w-8" />} />
                        : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>}
                    </motion.div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-editorial text-lg font-medium leading-snug">{item.productName}</p>
                          {!item.inStock && <p className="mt-0.5 text-xs text-destructive">Out of stock</p>}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          whileHover={{ scale: 1.08 }}
                          onClick={() => handleRemove(item.id)}
                          disabled={isRemoving}
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
                          title="Remove"
                        >
                          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </motion.button>
                      </div>
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                        <div className={cn('flex items-center rounded-full border transition-colors', isUpdating ? 'border-primary/50' : 'border-border')}>
                          <motion.button
                            whileTap={{ scale: 0.82 }}
                            onClick={() => handleQuantity(item.id, item.quantity - 1, item.availableStock)}
                            className="flex h-9 w-9 items-center justify-center rounded-l-full hover:bg-accent disabled:opacity-40"
                            disabled={isUpdating}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </motion.button>
                          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden text-sm font-medium">
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={item.quantity}
                                initial={{ y: 14, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -14, opacity: 0 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                className="absolute"
                              >
                                {item.quantity}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.82 }}
                            onClick={() => handleQuantity(item.id, item.quantity + 1, item.availableStock)}
                            className="flex h-9 w-9 items-center justify-center rounded-r-full hover:bg-accent disabled:opacity-40"
                            disabled={isUpdating}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatPrice(item.effectivePrice)} each</p>
                          <motion.p
                            key={item.itemTotal}
                            initial={{ color: 'hsl(var(--success))', scale: 1.08 }}
                            animate={{ color: 'hsl(var(--primary))', scale: 1 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                            className="font-editorial text-lg font-medium"
                          >
                            {formatPrice(item.itemTotal)}
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          <div className="mt-5 flex justify-between">
            <Link to="/shop/products"><Button variant="outline">Continue Shopping</Button></Link>
            <Button variant="ghost" onClick={async () => { try { await api.delete('/api/customer/cart/clear'); await dispatch(fetchCart()); toast.success('Cart cleared'); } catch { toast.error('Failed to clear cart'); } }}><Trash2 className="h-4 w-4" /> Clear Cart</Button>
          </div>
        </div>

        {/* Receipt-style order summary */}
        <div>
          <div className="sticky top-20 md:top-28 lg:top-36 overflow-hidden rounded-lg border border-border/70 bg-card shadow-luxury">
            <div className="border-b border-dashed border-border p-5">
              <h2 className="font-editorial text-xl font-medium">Order Summary</h2>
            </div>
            <div className="space-y-4 p-5">
              <CouponSelector orderAmount={localCart.total} appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} onRemove={removeCoupon} />
              <div className="space-y-2 border-t border-dashed border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(localCart.subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Discount ({appliedCoupon?.code})</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{shipping === 0 ? <Badge variant="success">FREE</Badge> : formatPrice(shipping)}</span></div>
              </div>
              <div className="flex justify-between border-t border-dashed border-border pt-4">
                <span className="font-semibold">Total</span>
                <span className="relative inline-block overflow-hidden text-right align-bottom">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={grandTotal}
                      initial={{ y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -16, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="block font-editorial text-2xl font-medium text-primary"
                    >
                      {formatPrice(grandTotal)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
              <Button size="lg" className="w-full" onClick={goToCheckout}>Proceed to Checkout <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32, delay: 0.15 }}
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border/70 bg-card/95 px-4 py-3 shadow-luxury-lg backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Total</p>
          <span className="relative inline-block overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={grandTotal}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="block font-editorial text-lg font-medium text-primary"
              >
                {formatPrice(grandTotal)}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <Button size="lg" className="shrink-0" onClick={goToCheckout}>
          Checkout <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}