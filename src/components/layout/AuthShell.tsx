import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ShieldCheck, Truck, Store } from 'lucide-react';
import { Logo } from '../ui';

/** Split-screen shell for login / register / password flows. */
export default function AuthShell({ title, accent, subtitle, children, footer }: { title: string; accent?: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link to="/" className="inline-flex w-fit"><Logo size={30} wordmarkClassName="text-2xl" /></Link>
        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-10">
          <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{title}{accent && <> <em className="font-editorial font-normal italic text-gold">{accent}</em></>}</h1>
          {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
        <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Argon</p>
      </div>

      <aside className="relative m-3 hidden overflow-hidden rounded-[2.25rem] bg-foreground text-background lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--gold)/0.28),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="mt-16 aspect-[3/4] rounded-t-full bg-background/10 ring-1 ring-background/15" />
            <div className="aspect-[3/4] rounded-t-full bg-gold/80" />
            <div className="mt-8 aspect-[3/4] rounded-t-full bg-background/90" />
          </div>
          <div>
            <p className="font-editorial text-5xl leading-[1.05]">A marketplace built on <em className="text-gold">trust.</em></p>
            <ul className="mt-8 space-y-3 text-sm text-background/75">
              <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-gold" />Verified sellers, secure checkout</li>
              <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-gold" />Nationwide delivery & cash on delivery</li>
              <li className="flex items-center gap-3"><Store className="h-4 w-4 text-gold" />Open your own storefront in minutes</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
