import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Link } from 'react-router-dom';
import { Store, Users, Package, ShoppingCart, AlertCircle, ShieldCheck, Clock3, ArrowUpRight, UserRound } from 'lucide-react';
import { useAppSelector } from '../../store';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { DashboardStats, ApiResponse } from '../../types';
import { Card, CardContent, Skeleton } from '../../components/ui';
import CountUp from '../../components/shared/CountUp';
import { formatPrice, formatNumber } from '../../lib/utils';

const statusColors: Record<string, string> = {
  PENDING: '#f5a524', CONFIRMED: '#38bdf8', PROCESSING: '#818cf8', SHIPPED: '#a78bfa', DELIVERED: '#22c55e', CANCELLED: '#f43f5e',
};

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<DashboardStats>>('/api/admin/dashboard/stats');
        if (!cancelled) setStats(res.data.data);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string; message?: string } } };
        const msg = e.response?.data?.error || e.response?.data?.message || 'Failed to load dashboard stats';
        if (!cancelled) { setError(msg); toast.error(msg); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dailyRevenueData = stats?.dailyRevenue
    ? Object.entries(stats.dailyRevenue).map(([date, amount]) => ({ date, amount }))
    : [];
  const ordersByStatusData = stats?.ordersByStatus
    ? Object.entries(stats.ordersByStatus).map(([status, count]) => ({ status, count }))
    : [];

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
        <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-96 rounded-3xl lg:col-span-2" /><Skeleton className="h-96 rounded-3xl" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg font-medium">{error}</p>
        <p className="mt-1 text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  const peak = dailyRevenueData.reduce((m, d) => Math.max(m, d.amount), 0);
  const totalOrdersChart = ordersByStatusData.reduce((a, b) => a + b.count, 0);
  const hero = [
    { label: 'Total revenue', value: stats?.totalRevenue ?? 0, filled: true },
    { label: "Today's revenue", value: stats?.todayRevenue ?? 0 },
    { label: 'Monthly revenue', value: stats?.monthlyRevenue ?? 0 },
  ];
  const tiles = [
    { label: 'Sellers', value: stats?.totalSellers ?? 0, sub: `${stats?.approvedSellers ?? 0} approved`, icon: Store, to: '/admin/sellers' },
    { label: 'Pending approvals', value: stats?.pendingSellerApprovals ?? 0, sub: 'Awaiting review', icon: Clock3, to: '/admin/sellers', alert: (stats?.pendingSellerApprovals ?? 0) > 0 },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, sub: `${stats?.totalUsers ?? 0} users total`, icon: Users, to: '/admin/customers' },
    { label: 'Products', value: stats?.totalProducts ?? 0, sub: 'Across all sellers', icon: Package, to: '/admin/products' },
    { label: 'Orders', value: stats?.totalOrders ?? 0, sub: `${stats?.pendingOrders ?? 0} pending`, icon: ShoppingCart, to: '/admin/orders' },
  ];
  const tip = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem', fontSize: '12px', boxShadow: '0 8px 24px -8px rgb(0 0 0 / .15)' };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Hello, {user?.name?.split(' ')[0] || 'Admin'} <span className="text-primary">·</span> overview</h1>
        </div>
        <Link to="/admin/reports" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.7)] transition-transform hover:-translate-y-0.5">View reports<ArrowUpRight className="h-4 w-4" /></Link>
      </div>

      {/* Revenue trio — first card filled, as in the Ascend reference */}
      <div className="grid gap-4 md:grid-cols-3">
        {hero.map((h, i) => (
          <motion.div key={h.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={h.filled ? 'relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.8)]' : 'rounded-3xl bg-card p-6 ring-1 ring-border/60'}>
            <div className="flex items-start justify-between"><p className={h.filled ? 'text-sm text-primary-foreground/80' : 'text-sm text-muted-foreground'}>{h.label}</p>
              <span className={h.filled ? 'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary' : 'flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground'}><ArrowUpRight className="h-4 w-4" /></span></div>
            <p className="mt-6 text-3xl font-medium tracking-[-0.03em] tabular-nums sm:text-[2.2rem]"><CountUp value={h.value} format={formatPrice} duration={1000} /></p>
            {h.filled && <div className="pointer-events-none absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-white/10" />}
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl lg:col-span-2"><CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-base font-semibold">Revenue</h2><p className="text-sm text-muted-foreground">Daily trend over recent days</p></div>
            {peak > 0 && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Peak {formatPrice(peak)}</span>}</div>
          {dailyRevenueData.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">No revenue data available</div> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRevenueData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="18%">
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip cursor={false} contentStyle={tip} formatter={(v: any) => [formatPrice(v), 'Revenue']} labelFormatter={(l) => new Date(l as string).toLocaleDateString()} />
                <Bar dataKey="amount" radius={999} maxBarSize={34} background={{ fill: 'hsl(var(--muted))', radius: 999 }}>
                  {dailyRevenueData.map((d) => <Cell key={d.date} fill={d.amount === peak ? 'hsl(var(--primary))' : 'hsl(var(--primary-300))'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>

        <Card className="rounded-3xl"><CardContent className="p-6">
          <h2 className="text-base font-semibold">Orders by status</h2><p className="text-sm text-muted-foreground">{formatNumber(totalOrdersChart)} orders in total</p>
          {ordersByStatusData.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">No order data available</div> : (<>
            <div className="relative mx-auto mt-2 h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={ordersByStatusData} dataKey="count" nameKey="status" innerRadius={62} outerRadius={84} paddingAngle={3} cornerRadius={8} stroke="none">
                  {ordersByStatusData.map((e) => <Cell key={e.status} fill={statusColors[e.status] || 'hsl(var(--primary))'} />)}
                </Pie><Tooltip contentStyle={tip} /></PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold tabular-nums">{formatNumber(totalOrdersChart)}</span><span className="text-xs text-muted-foreground">orders</span></div>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ordersByStatusData.map((e) => (
                <li key={e.status} className="flex items-center justify-between"><span className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[e.status] || 'hsl(var(--primary))' }} /><span className="capitalize">{e.status.toLowerCase()}</span></span>
                  <span className="tabular-nums text-muted-foreground">{totalOrdersChart ? Math.round((e.count / totalOrdersChart) * 100) : 0}% · {e.count}</span></li>
              ))}
            </ul></>)}
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
            <Link to={t.to} className="group block rounded-3xl bg-card p-5 ring-1 ring-border/60 transition-shadow hover:shadow-luxury-lg">
              <div className="flex items-center justify-between"><span className={t.alert ? 'flex h-10 w-10 items-center justify-center rounded-full bg-warning/15 text-warning' : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'}><t.icon className="h-[18px] w-[18px]" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></div>
              <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums"><CountUp value={t.value} format={formatNumber} duration={800} /></p>
              <p className="mt-0.5 text-sm font-medium">{t.label}</p><p className="text-xs text-muted-foreground">{t.sub}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
