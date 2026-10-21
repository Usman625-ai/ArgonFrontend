import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpRight, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { Logo } from '../ui';

const linkGroups = [
  { title: 'Shop', links: [
    { label: 'All Products', to: '/shop/products' }, { label: 'Cart', to: '/shop/cart' },
    { label: 'Wishlist', to: '/shop/wishlist' }, { label: 'Track Order', to: '/shop/orders' } ] },
  { title: 'Account', links: [
    { label: 'Profile', to: '/shop/profile' }, { label: 'Order History', to: '/shop/orders' },
    { label: 'Notifications', to: '/shop/notifications' } ] },
  { title: 'Company', links: [
    { label: 'About Argon', to: '/shop/about' }, { label: 'Become a Seller', to: '/register' },
    { label: 'Privacy Policy', to: '#' }, { label: 'Terms of Service', to: '#' } ] },
];

const Facebook = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.8v3h2.7V21z" /></svg>;
const XIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M17.8 3h3L14.3 10.4 22 21h-6l-4.7-6.2L5.9 21h-3l7-7.9L2.5 3h6.1l4.3 5.7zm-1 16.2h1.7L7.8 4.7H6z" /></svg>;
const Instagram = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" /></svg>;

export default function Footer() {
  const [email, setEmail] = useState('');
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { toast.error('Enter a valid email address'); return; }
    toast.success("You're on the list — welcome to Argon.");
    setEmail('');
  };
  const social = 'flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background';

  return (
    <footer className="mt-24 bg-secondary/70">
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 border-b border-border/70 sm:grid-cols-3">
        {[{ icon: Truck, t: 'Nationwide delivery', s: 'Fast shipping across Pakistan' },
          { icon: ShieldCheck, t: 'Verified sellers', s: 'Every storefront is reviewed' },
          { icon: CreditCard, t: 'Secure checkout', s: 'Pay when your order arrives' }].map((f) => (
          <div key={f.t} className="flex items-center gap-4 px-6 py-7 sm:px-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card"><f.icon className="h-[18px] w-[18px]" strokeWidth={1.6} /></span>
            <div><p className="text-sm font-semibold">{f.t}</p><p className="text-xs text-muted-foreground">{f.s}</p></div>
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-[88rem] gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <h3 className="font-editorial text-4xl leading-[1.05] sm:text-5xl">Good things,<br /><em className="text-gold">delivered.</em></h3>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">New arrivals, seller drops and members-only offers. No noise — twice a month.</p>
          <form onSubmit={handleSubscribe} className="mt-7 flex max-w-md items-center gap-1 rounded-full bg-card p-1.5 shadow-luxury">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
            <button type="submit" className="flex h-10 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85">Subscribe<ArrowUpRight className="h-3.5 w-3.5" /></button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {linkGroups.map((g) => (
            <div key={g.title}>
              <h4 className="eyebrow mb-4">{g.title}</h4>
              <ul className="space-y-2.5 text-sm">{g.links.map((l) => <li key={l.label}><Link to={l.to} className="text-foreground/75 transition-colors hover:text-foreground">{l.label}</Link></li>)}</ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="eyebrow mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-foreground/75">
              <li className="break-all">mrusmanhussain101@gmail.com</li><li>+92 33535 80298</li><li>Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[88rem] flex-col items-start justify-between gap-6 border-t border-border/70 px-6 py-7 sm:flex-row sm:items-center sm:px-8">
        <Link to="/shop"><Logo size={26} wordmarkClassName="text-xl" /></Link>
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Argon. All rights reserved.</p>
        <div className="flex gap-2">
          <a href="#" aria-label="Facebook" className={social}><Facebook /></a>
          <a href="#" aria-label="X" className={social}><XIcon /></a>
          <a href="https://www.instagram.com/_usmanhussainn?igsh=MWlqa2l4a3pscTNhdA==" aria-label="Instagram" className={social}><Instagram /></a>
        </div>
      </div>
    </footer>
  );
}
