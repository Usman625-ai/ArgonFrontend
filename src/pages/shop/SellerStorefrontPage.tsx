import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronLeft, CalendarDays, CheckCircle2, Store } from 'lucide-react';
import api from '../../lib/api';
import type { SellerPublicProfile, Product, ApiResponse, PagedResponse } from '../../types';
import { formatDate } from '../../lib/utils';
import { Badge, SmartImage, SkeletonCard, Skeleton, StarRating } from '../../components/ui';
import ProductCard from '../../components/shop/ProductCard';
import Pagination from '../../components/shop/Pagination';
import EmptyState from '../../components/shop/EmptyState';

const PAGE_SIZE = 12;

export default function SellerStorefrontPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerPublicProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setProfileLoading(true);
    setNotFound(false);
    try {
      const res = await api.get<ApiResponse<SellerPublicProfile>>(`/api/sellers/${id}`);
      setProfile(res.data.data);
    } catch {
      setProfile(null);
      setNotFound(true);
    } finally {
      setProfileLoading(false);
    }
  }, [id]);

  const loadProducts = useCallback(async () => {
    if (!id) return;
    setProductsLoading(true);
    try {
      const res = await api.get<ApiResponse<PagedResponse<Product>>>(`/api/sellers/${id}/products`, { params: { page, size: PAGE_SIZE } });
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [id, page]);

  useEffect(() => { setPage(0); loadProfile(); }, [loadProfile]);
  useEffect(() => { if (!notFound) loadProducts(); }, [loadProducts, notFound]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState icon={Store} title="Seller not found" description="This shop isn't available right now — it may no longer be active." actionLabel="Browse Products" onAction={() => navigate('/shop/products')} />
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-[#1a1410] via-[#15110d] to-[#0d0a07]">
        {profile?.shopBanner && (
          <div className="absolute inset-0">
            <img src={profile.shopBanner} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a07] via-[#0d0a07]/60 to-transparent" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#d4a857 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-white"><ChevronLeft className="h-4 w-4" /> Back</button>

          {profileLoading ? (
            <div className="mt-6 flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-32" /></div>
            </div>
          ) : profile && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                {profile.shopLogo ? (
                  <SmartImage src={profile.shopLogo} alt={profile.shopName || profile.name} width={80} className="h-20 w-20 shrink-0 rounded-full ring-2 ring-white/20" fallbackIcon={<Store className="h-8 w-8" />} />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary-300 ring-2 ring-white/20">
                    {(profile.shopName || profile.name).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-editorial text-2xl font-normal text-white sm:text-3xl">{profile.shopName || profile.name}</h1>
                    <Badge variant="outline" className="gap-1 border-white/15 bg-white/5 text-white/80"><CheckCircle2 className="h-3 w-3 text-primary-300" /> Verified Seller</Badge>
                  </div>
                  <p className="mt-1 text-sm text-white/55">{profile.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="flex items-center gap-1.5 text-xs text-white/45"><CalendarDays className="h-3.5 w-3.5" /> Selling since {formatDate(profile.memberSince)}</p>
                    {profile.averageRating != null && (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={profile.averageRating} size={13} />
                        <span className="text-xs text-white/60">{profile.averageRating.toFixed(1)} ({profile.totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 sm:gap-8">
                <div>
                  <p className="font-editorial text-2xl font-medium text-white">{profile.totalProducts}</p>
                  <p className="text-xs text-white/50">Products</p>
                </div>
                <div>
                  <p className="font-editorial text-2xl font-medium text-white">{profile.ordersDelivered}</p>
                  <p className="text-xs text-white/50">Orders Delivered</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
        {profile?.shopDescription && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{profile.shopDescription}</p>
        )}

        <div>
          <div className="mb-5">
            <span className="eyebrow">From this shop</span>
            <h2 className="mt-1.5 font-editorial text-2xl font-normal tracking-tight">Products</h2>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : products.length === 0 ? (
            <EmptyState icon={Package} title="No products yet" description="This seller hasn't listed anything yet — check back soon." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}