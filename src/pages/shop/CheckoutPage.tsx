import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MapPin, Plus, CreditCard, Truck, Check, Package, ShoppingBag, ArrowLeft, Lock, NotebookPen } from 'lucide-react';
import api from '../../lib/api';
import type { Address, Order, ApiResponse, PaymentMethod } from '../../types';
import { cn, formatPrice } from '../../lib/utils';
import { Button, Input, Textarea, Field, Modal, Badge, SmartImage, Skeleton } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCart } from '../../store/cartSlice';
import EmptyState from '../../components/shop/EmptyState';
import CouponSelector, { type AppliedCoupon } from '../../components/shop/CouponSelector';
import Confetti from '../../components/shop/Confetti';

interface AddrForm {
  fullName: string; phoneNumber: string; addressLine1: string; addressLine2: string;
  city: string; state: string; pincode: string; country: string; defaultAddress: boolean;
}
const emptyAddr: AddrForm = { fullName: '', phoneNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'Pakistan', defaultAddress: false };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { cart } = useAppSelector((s) => s.cart);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [notes, setNotes] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | undefined>();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order[] | null>(null);
  const [addrForm, setAddrForm] = useState<AddrForm>(emptyAddr);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Address[]>>('/api/customer/addresses');
      const list = res.data.data || [];
      setAddresses(list);
      const def = list.find((a) => a.defaultAddress);
      setSelectedAddress(def?.id || list[0]?.id || null);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const loadCart = useCallback(async () => { if (isAuthenticated) await dispatch(fetchCart()); }, [dispatch, isAuthenticated]);

  useEffect(() => { loadAddresses(); loadCart(); }, [loadAddresses, loadCart]);

  // If a coupon was applied on the Cart page, re-validate it here to get an accurate discount
  useEffect(() => {
    const carriedCode = (location.state as { couponCode?: string } | null)?.couponCode;
    if (!carriedCode || !cart || appliedCoupon) return;
    (async () => {
      try {
        const res = await api.post<ApiResponse<{ code: string; applicableDiscount: number }>>('/api/customer/coupons/validate', {
          couponCode: carriedCode,
          orderAmount: cart.total,
        });
        const data = res.data.data;
        if (data) setAppliedCoupon({ code: data.code, discount: data.applicableDiscount || 0 });
      } catch {
        // coupon no longer valid at checkout total — silently drop it, user can reapply
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const openAddAddress = () => { setEditingAddress(null); setAddrForm(emptyAddr); setShowAddressModal(true); };
  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddrForm({ fullName: addr.fullName, phoneNumber: addr.phoneNumber, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, defaultAddress: addr.defaultAddress });
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    if (!addrForm.fullName || !addrForm.addressLine1 || !addrForm.city || !addrForm.phoneNumber) { toast.error('Please fill all required fields'); return; }
    try {
      if (editingAddress) {
        await api.put(`/api/customer/addresses/${editingAddress.id}`, addrForm);
        toast.success('Address updated');
      } else {
        await api.post('/api/customer/addresses', addrForm);
        toast.success('Address added');
      }
      setShowAddressModal(false); loadAddresses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to save address');
    }
  };

  const deleteAddress = async (id: number) => {
    try { await api.delete(`/api/customer/addresses/${id}`); toast.success('Address deleted'); loadAddresses(); }
    catch { toast.error('Failed to delete address'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a shipping address'); return; }
    if (!cart || cart.items.length === 0) { toast.error('Your cart is empty'); return; }
    setPlacing(true);
    try {
      const res = await api.post<ApiResponse<Order[]>>('/api/customer/orders/checkout', { addressId: selectedAddress, paymentMethod, couponCode: appliedCoupon?.code, notes });
      const orders = res.data.data || [];
      if (paymentMethod === 'JAZZCASH' && orders.length > 0) {
        try {
          const payRes = await api.post<ApiResponse<{ hostedPageUrl: string; formParams: Record<string, string>; orderNumber: string }>>(`/api/customer/orders/${orders[0].id}/payment/initiate`);
          const payData = payRes.data.data;
          if (payData?.hostedPageUrl) { window.location.href = payData.hostedPageUrl; return; }
        } catch { toast.error('Payment initiation failed. Order placed with pending payment.'); }
      }
      await dispatch(fetchCart());
      setSuccessOrder(orders); toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (!isAuthenticated) return <EmptyState icon={ShoppingBag} title="Please login to checkout" description="You need to be logged in to place an order." actionLabel="Login" onAction={() => navigate('/login')} />;
  if (loading) return (
    <div className="mx-auto max-w-[88rem] px-4 pt-10 sm:px-8"><Skeleton className="mb-8 h-12 w-56" />
      <div className="grid gap-8 lg:grid-cols-[1fr_26rem]"><div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div><Skeleton className="h-96 rounded-3xl" /></div></div>
  );

  if (successOrder) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <Confetti count={30} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 16 }} className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-background"><Check className="h-9 w-9" /></motion.div>
          </div>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.035em]">Order <em className="font-editorial font-normal italic text-gold">confirmed</em></h1>
          <p className="mt-2 text-sm text-muted-foreground">Thank you — your order{successOrder.length > 1 ? 's have' : ' has'} been placed.</p>
          <div className="mt-6 space-y-2">
            {successOrder.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-sm ring-1 ring-border/60">
                <span className="font-medium">Order #{o.orderNumber}</span>
                <Badge variant={o.paymentStatus === 'PAID' ? 'success' : 'warning'}>{o.paymentStatus}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-7 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/shop/orders')}>View orders</Button>
            <Button className="flex-1" onClick={() => navigate('/shop/products')}>Keep shopping</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) return <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add items to your cart before checking out." actionLabel="Start Shopping" onAction={() => navigate('/shop/products')} />;

  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Math.max(0, cart.total - discount);
  const shipping = discountedSubtotal > 5000 ? 0 : 200;
  const grandTotal = discountedSubtotal + shipping;
  const steps = ['Cart', 'Details', 'Confirmation'];

  const Section = ({ n, icon: Icon, title, action, children }: { n: number; icon: typeof MapPin; title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <section className="rounded-3xl bg-card p-5 ring-1 ring-border/60 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{n}</span>{title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
  const radio = (on: boolean) => (
    <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors', on ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/50')}>{on && <Check className="h-3 w-3" />}</span>
  );

  return (
    <div className="mx-auto max-w-[88rem] px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <button onClick={() => navigate('/shop/cart')} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to cart</button>
          <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">Check<em className="font-editorial font-normal italic text-gold">out</em></h1>
        </div>
        <ol className="flex items-center gap-2 text-xs font-medium sm:text-sm">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className={cn('flex items-center gap-2 rounded-full px-3.5 py-2', i === 1 ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground')}>
                {i === 0 ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}<span className={i === 1 ? '' : 'hidden sm:inline'}>{label}</span>
              </span>
              {i < steps.length - 1 && <span className="h-px w-4 bg-border sm:w-8" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_26rem] xl:gap-12">
        <div className="space-y-5">
          <Section n={1} icon={MapPin} title="Shipping address" action={<Button size="sm" variant="outline" onClick={openAddAddress}><Plus className="h-4 w-4" /> Add new</Button>}>
            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center"><MapPin className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.4} /><p className="mt-3 text-sm text-muted-foreground">No addresses yet. Add one to continue.</p></div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((addr) => {
                  const on = selectedAddress === addr.id;
                  return (
                    <div key={addr.id} role="radio" aria-checked={on} tabIndex={0} onClick={() => setSelectedAddress(addr.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAddress(addr.id); } }}
                      className={cn('cursor-pointer rounded-2xl p-4 ring-2 transition-all focus-visible:outline-none', on ? 'bg-secondary/60 ring-foreground' : 'ring-border/70 hover:ring-foreground/40')}>
                      <div className="flex items-start gap-3">
                        {radio(on)}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{addr.fullName}</span>{addr.defaultAddress && <Badge variant="secondary">Default</Badge>}</div>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} {addr.pincode}, {addr.country}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{addr.phoneNumber}</p>
                          <div className="mt-3 flex gap-4 text-xs font-medium">
                            <button onClick={(e) => { e.stopPropagation(); openEditAddress(addr); }} className="underline-offset-4 hover:underline">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }} className="text-destructive underline-offset-4 hover:underline">Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section n={2} icon={CreditCard} title="Payment method">
            <div className="grid gap-3 sm:grid-cols-2">
              {([['CASH_ON_DELIVERY', 'Cash on delivery', Truck, true], ['JAZZCASH', 'JazzCash', CreditCard, false]] as const).map(([val, label, Icon, enabled]) => {
                const on = enabled && paymentMethod === val;
                return (
                  <div key={val} role="radio" aria-checked={on} aria-disabled={!enabled} tabIndex={enabled ? 0 : -1}
                    onClick={() => enabled ? setPaymentMethod(val) : toast.error("Sorry, JazzCash isn't available right now. It'll be back soon — please use Cash on Delivery for now.")}
                    onKeyDown={(e) => { if (enabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPaymentMethod(val); } }}
                    className={cn('rounded-2xl p-4 ring-2 transition-all focus-visible:outline-none', !enabled ? 'cursor-not-allowed opacity-55 ring-border/70' : on ? 'cursor-pointer bg-secondary/60 ring-foreground' : 'cursor-pointer ring-border/70 hover:ring-foreground/40')}>
                    <div className="flex items-start gap-3">
                      {radio(on)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-semibold">{label}</p>{!enabled && <Badge variant="secondary" className="text-[0.62rem]">Coming soon</Badge>}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{val === 'CASH_ON_DELIVERY' ? 'Pay when you receive your order' : "Not available right now — we're working on it"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section n={3} icon={NotebookPen} title="Order notes">
            <Textarea rows={3} placeholder="Any special instructions for the seller or courier (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-3xl bg-card p-6 shadow-luxury ring-1 ring-border/60">
            <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
            <ul className="scrollbar-thin mt-5 max-h-64 space-y-3.5 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                    {item.productImage ? <SmartImage src={item.productImage} alt={item.productName} width={128} aspect="auto" className="h-full w-full" fallbackIcon={<Package className="h-6 w-6" />} /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Package className="h-6 w-6" /></div>}
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.65rem] font-semibold text-background">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{formatPrice(item.effectivePrice)} each</p></div>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(item.itemTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-border pt-5">
              <CouponSelector orderAmount={cart.total} appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} onRemove={() => { setAppliedCoupon(undefined); toast.success('Coupon removed'); }} />
            </div>

            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium tabular-nums">{formatPrice(cart.subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({appliedCoupon?.code})</dt><dd className="tabular-nums">−{formatPrice(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium">{shipping === 0 ? <Badge variant="success">Free</Badge> : formatPrice(shipping)}</dd></div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-5"><span className="font-medium">Total</span><span className="text-3xl font-semibold tracking-tight tabular-nums">{formatPrice(grandTotal)}</span></div>

            <Button size="lg" className="mt-6 w-full" onClick={placeOrder} loading={placing} disabled={!selectedAddress}>
              {placing ? 'Placing order…' : <><Lock className="h-4 w-4" /> Place order</>}
            </Button>
            {!selectedAddress && <p className="mt-3 text-center text-xs text-muted-foreground">Select a shipping address to continue.</p>}
          </div>
        </aside>
      </div>

      <Modal open={showAddressModal} onClose={() => setShowAddressModal(false)} title={editingAddress ? 'Edit Address' : 'Add New Address'} size="lg"
        footer={<><Button variant="outline" onClick={() => setShowAddressModal(false)}>Cancel</Button><Button onClick={saveAddress}>{editingAddress ? 'Update' : 'Add'} Address</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required><Input placeholder="John Doe" value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} /></Field>
          <Field label="Phone Number" required><Input placeholder="03XX-XXXXXXX" value={addrForm.phoneNumber} onChange={(e) => setAddrForm({ ...addrForm, phoneNumber: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Address Line 1" required><Input placeholder="House #, Street, Area" value={addrForm.addressLine1} onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Address Line 2"><Input placeholder="Apt, Floor (optional)" value={addrForm.addressLine2} onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })} /></Field></div>
          <Field label="City" required><Input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></Field>
          <Field label="State/Province"><Input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></Field>
          <Field label="Pincode"><Input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} /></Field>
          <Field label="Country"><Input value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={addrForm.defaultAddress} onChange={(e) => setAddrForm({ ...addrForm, defaultAddress: e.target.checked })} className="rounded" /> Set as default address</label>
        </div>
      </Modal>
    </div>
  );
}
