import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertTriangle, Clock, TrendingUp, ArrowUpRight, Plus, Eye } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useAppSelector } from '../../store';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { SellerDashboardStats, ApiResponse } from '../../types';
import { Card, CardContent, Skeleton } from '../../components/ui';
import CountUp from '../../components/shared/CountUp';
import { formatPrice, formatNumber } from '../../lib/utils';

export default function SellerDashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<SellerDashboardStats>>('/api/seller/dashboard/stats');
        if (active) setStats(res.data.data);
      } catch {
        if (active) toast.error('Failed to load dashboard stats');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
        <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-96 rounded-3xl lg:col-span-2" /><Skeleton className="h-96 rounded-3xl" /></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="rounded-3xl"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Unable to load dashboard data. Please try again later.</p>
      </CardContent></Card>
    );
  }

  const chartData = stats.dailyRevenue
    ? Object.entries(stats.dailyRevenue).slice(-7).map(([date, amount]) => ({ date: date.slice(5), amount }))
    : [];
  const maxSale = chartData.length > 0 ? Math.max(...chartData.map((d) => d.amount), 1) : 1;
  const hasSales = chartData.some((d) => d.amount > 0);

  const kpis = [
    { label: 'Total revenue', value: stats.totalRevenue, format: formatPrice, filled: true, to: '/seller/revenue' },
    { label: 'Products', value: stats.totalProducts, sub: 'Listed in your shop', icon: Package, to: '/seller/products' },
    { label: 'Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: ShoppingCart, to: '/seller/orders' },
    { label: 'Low stock', value: stats.lowStockProducts, sub: 'Items below 10 units', icon: AlertTriangle, to: '/seller/products', alert: stats.lowStockProducts > 0 },
  ];
  const attention = [
    { label: 'Orders to fulfil', value: stats.pendingOrders, icon: Clock, to: '/seller/orders' },
    { label: 'Restock needed', value: stats.lowStockProducts, icon: AlertTriangle, to: '/seller/products' },
    { label: 'Best day this week', value: maxSale, money: true, icon: TrendingUp, to: '/seller/revenue' },
  ];
  const tip = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem', fontSize: '12px', boxShadow: '0 8px 24px -8px rgb(0 0 0 / .15)' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm text-muted-foreground">{stats.shopName || 'Your shop'}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Welcome back, {user?.name?.split(' ')[0] || 'seller'}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/seller/orders" className="inline-flex h-11 items-center gap-2 rounded-full bg-card px-5 text-sm font-medium ring-1 ring-border transition-colors hover:bg-accent"><Eye className="h-4 w-4" />Orders</Link>
          <Link to="/seller/products" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"><Plus className="h-4 w-4" />Add product</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} className="h-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={k.to} className={k.filled ? 'group relative block h-full overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground' : 'group block h-full rounded-3xl bg-card p-6 ring-1 ring-border/60 transition-shadow hover:shadow-luxury-lg'}>
              <div className="flex items-start justify-between">
                {k.icon ? <span className={k.alert ? 'flex h-10 w-10 items-center justify-center rounded-full bg-warning/15 text-warning' : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'}><k.icon className="h-[18px] w-[18px]" /></span> : <span className="text-sm text-primary-foreground/75">{k.label}</span>}
                <ArrowUpRight className={k.filled ? 'h-5 w-5 opacity-80' : 'h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'} />
              </div>
              <p className="mt-6 text-3xl font-semibold tracking-[-0.03em] tabular-nums"><CountUp value={k.value} format={k.format || formatNumber} duration={1000} /></p>
              {!k.filled && <><p className="mt-0.5 text-sm font-medium">{k.label}</p><p className="text-xs text-muted-foreground">{k.sub}</p></>}
              {k.filled && <div className="pointer-events-none absolute -bottom-14 -right-8 h-40 w-40 rounded-full bg-white/10" />}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl lg:col-span-2"><CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between"><div><h2 className="text-base font-semibold">Weekly sales</h2><p className="text-sm text-muted-foreground">Revenue over the last 7 days</p></div>
            <Link to="/seller/revenue" className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium hover:bg-accent">Full report</Link></div>
          {!hasSales ? (
            <div className="flex h-72 flex-col items-center justify-center text-center"><TrendingUp className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} /><p className="mt-4 text-sm text-muted-foreground">No sales data for this week yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="22%">
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} />
                <Tooltip cursor={false} contentStyle={tip} formatter={(v: any) => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="amount" radius={999} maxBarSize={40} background={{ fill: 'hsl(var(--muted))', radius: 999 }}>
                  {chartData.map((d) => <Cell key={d.date} fill={d.amount === maxSale ? 'hsl(var(--primary))' : 'hsl(var(--primary-300))'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent></Card>

        <Card className="rounded-3xl"><CardContent className="p-6">
          <h2 className="text-base font-semibold">Needs your attention</h2><p className="text-sm text-muted-foreground">Quick links to what matters today</p>
          <div className="mt-5 space-y-2.5">
            {attention.map((a) => (
              <Link key={a.label} to={a.to} className="group flex items-center gap-3.5 rounded-2xl bg-secondary/70 p-3.5 transition-colors hover:bg-accent">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary"><a.icon className="h-[18px] w-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{a.label}</span><span className="block text-lg font-semibold tabular-nums"><CountUp value={a.value} format={a.money ? formatPrice : formatNumber} /></span></span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
