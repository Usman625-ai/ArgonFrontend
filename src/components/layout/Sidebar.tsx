import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, FolderTree, Ticket, Settings, FileBarChart, Store, LogOut, X, ChevronsLeft, UserCircle, Users, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/authSlice';
import { cn } from '../../lib/utils';
import { Logo } from '../ui';

interface P { collapsed: boolean; mobileOpen?: boolean; onClose?: () => void; onToggleCollapse?: () => void; }
interface NavGroup { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard }[]; }

const adminNav: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Marketplace', items: [
    { to: '/admin/sellers', label: 'Sellers', icon: Store }, { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/products', label: 'Products', icon: Package }, { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree }, { to: '/admin/coupons', label: 'Coupons', icon: Ticket } ] },
  { label: 'Insights', items: [{ to: '/admin/reports', label: 'Reports', icon: FileBarChart }] },
  { label: 'System', items: [{ to: '/admin/settings', label: 'Settings', icon: Settings }, { to: '/admin/profile', label: 'My Profile', icon: UserCircle }] },
];
const sellerNav: NavGroup[] = [
  { label: 'Overview', items: [{ to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Shop', items: [{ to: '/seller/products', label: 'Products', icon: Package }, { to: '/seller/orders', label: 'Orders', icon: ShoppingCart }] },
  { label: 'Insights', items: [{ to: '/seller/revenue', label: 'Revenue', icon: TrendingUp }, { to: '/seller/reports', label: 'Reports', icon: FileBarChart }] },
  { label: 'System', items: [{ to: '/seller/settings', label: 'Shop Settings', icon: Settings }, { to: '/seller/profile', label: 'My Profile', icon: UserCircle }] },
];

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggleCollapse }: P) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const groups = user?.role === 'ADMIN' ? adminNav : sellerNav;
  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  return (
    <>
      {mobileOpen && <div onClick={onClose} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col p-3 transition-[transform,width] duration-300',
        collapsed ? 'w-[5.5rem]' : 'w-[17rem]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0'
      )}>
        <div className="flex h-full flex-col rounded-3xl bg-card p-3 shadow-luxury ring-1 ring-border/50">
          <div className={cn('flex h-14 shrink-0 items-center px-2', collapsed ? 'justify-center' : 'justify-between')}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Logo size={30} withWordmark={false} />
              {!collapsed && (
                <div className="leading-tight">
                  <span className="block font-logo text-[1.15rem] font-medium">Argon</span>
                  <span className="text-[0.68rem] font-medium text-primary">{user?.role === 'ADMIN' ? 'Administration' : 'Seller console'}</span>
                </div>
              )}
            </div>
            {mobileOpen && <button onClick={onClose} className="rounded-full p-1.5 hover:bg-accent lg:hidden"><X className="h-5 w-5" /></button>}
          </div>

          <nav className="scrollbar-thin mt-2 flex-1 space-y-5 overflow-y-auto px-1 py-2">
            {groups.map((g) => (
              <div key={g.label}>
                {!collapsed && <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{g.label}</p>}
                <div className="space-y-1">
                  {g.items.map((i) => (
                    <NavLink key={i.to} to={i.to} onClick={onClose} title={collapsed ? i.label : undefined}
                      className={({ isActive }) => cn('relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors', collapsed && 'justify-center px-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
                      {({ isActive }) => (<>
                        {isActive && <motion.span layoutId={`nav-pill-${user?.role}`} transition={{ type: 'spring', stiffness: 420, damping: 36 }} className="absolute inset-0 rounded-full bg-primary shadow-[0_6px_16px_-6px_hsl(var(--primary)/0.7)]" />}
                        <i.icon className="relative h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                        {!collapsed && <span className="relative">{i.label}</span>}
                      </>)}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-1 border-t border-border/60 pt-3">
            <button onClick={handleLogout} className={cn('flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive', collapsed && 'justify-center px-0')}>
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />{!collapsed && 'Log out'}
            </button>
            {onToggleCollapse && (
              <button onClick={onToggleCollapse} className="hidden w-full items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-accent lg:flex" aria-label="Collapse sidebar">
                <ChevronsLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
