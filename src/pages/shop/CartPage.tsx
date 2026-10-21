import { useEffect, useState, useCallback, useRef } from 'react';
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

  const pendingQty = useRef<Record<number, number>>({});
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Cleanup any in-flight debounce timers if the user navigates away mid-click.
  useEffect(() => () => { Object.values(debounceTimers.current).forEach(clearTimeout); }, []);

  const commitQuantity = useCallback(async (itemId: number) => {
    const quantity = pendingQty.current[itemId];
    if (quantity === undefined) return;
    setUpdatingIds((p) => [...p, itemId]);
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
    } catch (err) {
      toast.error(err as string);
      dispatch(fetchCart()); // resync with the server if the update failed
    } finally {
      setUpdatingIds((p) => p.filter((id) => id !== itemId));
      delete pendingQty.current[itemId];
    }
  }, [dispatch]);

  const handleQuantity = (itemId: number, quantity: number, stock: number) => {
    if (quantity < 1) return;
    if (quantity > stock) { toast.error('Cannot exceed available stock'); return; }

    // Update the visible cart immediately — no waiting on the network for the
    // number or the totals to change. The API call is debounced below so
    // rapid +/- clicks collapse into a single request instead of one per tap.
    setLocalCart((prev) => {
      if (!prev) return prev;
      const idx = prev.items.findIndex((i) => i.id === itemId);
      if (idx === -1) return prev;
      const item = prev.items[idx];
      const newItemTotal = item.effectivePrice * quantity;
      const delta = newItemTotal - item.itemTotal;
      const items = [...prev.items];
      items[idx] = { ...item, quantity, itemTotal: newItemTotal };
      return { ...prev, items, subtotal: prev.subtotal + delta, total: prev.total + delta };
    });

    pendingQty.current[itemId] = quantity;
    if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
    debounceTimers.current[itemId] = setTimeout(() => commitQuantity(itemId), 350);
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

  const itemCount = localCart.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="pb-32 lg:pb-16">
      <PageHeader
        icon={ShoppingBag}
        eyebrow="Your selections"
        title="Cart"
        subtitle={`${itemCount} item${itemCount !== 1 ? 's' : ''} reserved for you`}
        crumbs={[{ label: 'Cart' }]}
      />

      <div className="mx-auto max-w-[88rem] px-4 pt-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_26rem] xl:gap-12">
          <div>
            {/* Free shipping progress */}
            <div className="mb-5 rounded-3xl bg-card p-5 ring-1 ring-border/60">
              <div className="flex items-center gap-2.5 text-sm">
                {shipping === 0 ? <CheckCircle2 className="h-[18px] w-[18px] text-success" /> : <Truck className="h-[18px] w-[18px]" />}
                {shipping === 0
                  ? <span className="font-medium text-success">You've unlocked free shipping</span>
                  : <span>Add <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - discountedSubtotal)}</strong> more for free shipping</span>}
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div initial={{ width: 0 }} animate={{ width: `${shippingProgress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} className={cn('h-full rounded-full', shipping === 0 ? 'bg-success' : 'bg-foreground')} />
              </div>
            </div>

            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {localCart.items.map((item) => {
                  const isUpdating = updatingIds.includes(item.id);
                  const isRemoving = removingIds.includes(item.id);
                  return (
                    <motion.li key={item.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      className="flex gap-4 rounded-3xl bg-card p-3 ring-1 ring-border/60 sm:p-4">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-32 sm:w-32">
                        {item.productImage
                          ? <SmartImage src={item.productImage} alt={item.productName} width={260} aspect="auto" className="h-full w-full" fallbackIcon={<Package className="h-8 w-8" />} />
                          : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col py-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[0.95rem] font-medium leading-snug">{item.productName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatPrice(item.effectivePrice)} each</p>
                            {!item.inStock && <p className="mt-0.5 text-xs text-destructive">Out of stock</p>}
                          </div>
                          <button onClick={() => handleRemove(item.id)} disabled={isRemoving} aria-label="Remove item" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60">
                            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                            <button onClick={() => handleQuantity(item.id, item.quantity - 1, item.availableStock)} disabled={isUpdating} aria-label="Decrease" className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm transition-transform active:scale-90 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                            <button onClick={() => handleQuantity(item.id, item.quantity + 1, item.availableStock)} disabled={isUpdating} aria-label="Increase" className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-90 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <p className="text-lg font-semibold tabular-nums">{formatPrice(item.itemTotal)}</p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <Link to="/shop/products" className="text-sm font-medium underline underline-offset-4 hover:text-gold">Continue shopping</Link>
              <Button variant="ghost" size="sm" onClick={async () => { try { await api.delete('/api/customer/cart/clear'); await dispatch(fetchCart()); toast.success('Cart cleared'); } catch { toast.error('Failed to clear cart'); } }}><Trash2 className="h-4 w-4" /> Clear cart</Button>
            </div>
          </div>

          {/* Order summary */}
          <aside>
            <div className="sticky top-28 rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-luxury">
              <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
              <div className="mt-5 space-y-5">
                <CouponSelector orderAmount={localCart.total} appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} onRemove={removeCoupon} />
                <dl className="space-y-3 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium tabular-nums">{formatPrice(localCart.subtotal)}</dd></div>
                  {discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({appliedCoupon?.code})</dt><dd className="tabular-nums">−{formatPrice(discount)}</dd></div>}
                  <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium">{shipping === 0 ? <Badge variant="success">Free</Badge> : formatPrice(shipping)}</dd></div>
                </dl>
                <div className="flex items-end justify-between border-t border-border pt-5">
                  <span className="font-medium">Total</span>
                  <span className="relative inline-block overflow-hidden text-right">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={grandTotal} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="block text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(grandTotal)}</motion.span>
                    </AnimatePresence>
                  </span>
                </div>
                <Button size="lg" className="w-full" onClick={goToCheckout}>Proceed to checkout <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile floating checkout pill */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 lg:hidden" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 32, delay: 0.1 }}
          className="pointer-events-auto flex items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-6 pr-2 text-background shadow-luxury-lg">
          <div className="min-w-0"><p className="text-[0.65rem] uppercase tracking-[0.14em] text-background/60">Total</p><p className="text-lg font-semibold tabular-nums leading-tight">{formatPrice(grandTotal)}</p></div>
          <button onClick={goToCheckout} className="flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground active:scale-95">Checkout<ArrowRight className="h-4 w-4" /></button>
        </motion.div>
      </div>
    </div>
  );
}
