import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../ui';
import { cn } from '../../lib/utils';

const linkGroups = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/shop/products' },
      { label: 'Cart', to: '/shop/cart' },
      { label: 'Wishlist', to: '/shop/wishlist' },
      { label: 'Track Order', to: '/shop/orders' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Profile', to: '/shop/profile' },
      { label: 'Order History', to: '/shop/orders' },
      { label: 'Notifications', to: '/shop/notifications' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Argon', to: '/shop/about' },
      { label: 'Become a Seller', to: '/register' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  },
];

/** Collapsible section — accordion on mobile, always-open column on desktop. */
function FooterGroup({ title, links }: (typeof linkGroups)[number]) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border py-4 sm:border-none sm:py-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left sm:pointer-events-none sm:cursor-default"
      >
        <h3 className="eyebrow">{title}</h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-300 sm:hidden',
            open && 'rotate-180'
          )}
        />
      </button>
      <ul
        className={cn(
          'grid overflow-hidden text-sm transition-all duration-300 sm:mt-4 sm:grid-rows-[1fr] sm:opacity-100',
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 sm:opacity-100'
        )}
      >
        <div className="min-h-0 space-y-2.5">
          {links.map((l) => (
            <li key={l.label}>
              <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    toast.success("You're on the list — welcome to Argon.");
    setEmail('');
  };

  return (
    <footer className="border-t border-border bg-card">
      {/* Trust strip */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          {[
            { icon: Truck, t: 'Nationwide Delivery', s: 'Fast shipping across Pakistan' },
            { icon: ShieldCheck, t: 'Verified Sellers', s: 'Quality checked marketplace' },
            { icon: CreditCard, t: 'Secure Checkout', s: 'JazzCash & Cash on Delivery' },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 px-6 py-5">
              <f.icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium">{f.t}</p>
                <p className="text-xs text-muted-foreground">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-border bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h3 className="font-editorial text-xl font-medium tracking-tight sm:text-2xl">Stay in the loop</h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              New arrivals, seller drops, and members-only offers — straight to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2 sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-11 w-full min-w-0 rounded-md border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              Subscribe
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-2">
            <Link to="/shop" className="inline-flex">
              <Logo size={30} wordmarkClassName="text-xl" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your trusted multi-vendor marketplace. Curated goods from thousands of sellers across Pakistan.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/_usmanhussainn?igsh=MWlqa2l4a3pscTNhdA=="
                aria-label="Instagram"
                className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {linkGroups.map((g) => (
            <FooterGroup key={g.title} title={g.title} links={g.links} />
          ))}

          <div className="border-b border-border py-4 sm:border-none sm:py-0">
            <h3 className="eyebrow">Contact</h3>
            <ul className="mt-3 space-y-3 text-sm sm:mt-4">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" /> mrusmanhussain101@gmail.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" /> +92 33535 80298
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" /> Karachi, Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs tracking-wide text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Argon. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}