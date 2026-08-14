import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CalendarDays, MessageSquare, User as UserIcon } from 'lucide-react';
import api from '../../lib/api';
import type { CustomerPublicProfile, Review, ApiResponse, PagedResponse } from '../../types';
import { formatDate } from '../../lib/utils';
import { SmartImage, Skeleton, StarRating, Card, CardContent } from '../../components/ui';
import Pagination from '../../components/shop/Pagination';
import EmptyState from '../../components/shop/EmptyState';

const PAGE_SIZE = 10;

export default function ReviewerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerPublicProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setProfileLoading(true);
    setNotFound(false);
    try {
      const res = await api.get<ApiResponse<CustomerPublicProfile>>(`/api/customers/${id}`);
      setProfile(res.data.data);
    } catch {
      setProfile(null);
      setNotFound(true);
    } finally {
      setProfileLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await api.get<ApiResponse<PagedResponse<Review>>>(`/api/customers/${id}/reviews`, { params: { page, size: PAGE_SIZE } });
      setReviews(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, page]);

  useEffect(() => { setPage(0); loadProfile(); }, [loadProfile]);
  useEffect(() => { if (!notFound) loadReviews(); }, [loadReviews, notFound]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState icon={UserIcon} title="Profile not found" description="This reviewer doesn't have a public profile — they may not have posted any reviews yet." actionLabel="Back to shop" onAction={() => navigate('/shop/products')} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Back</button>

      {profileLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-28" /></div>
        </div>
      ) : profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex items-center gap-4">
          {profile.profileImage ? (
            <SmartImage src={profile.profileImage} alt={profile.name} width={80} className="h-20 w-20 shrink-0 rounded-full" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-editorial text-2xl font-medium">{profile.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Member since {formatDate(profile.memberSince)}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> {profile.totalReviews} review{profile.totalReviews === 1 ? '' : 's'}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-editorial text-xl font-normal">Reviews</h2>
        {reviewsLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews yet" description="This reviewer hasn't posted anything yet." />
        ) : (
          <>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.3 }}>
                  <Card>
                    <CardContent className="flex gap-3 pt-4">
                      {r.productSlug ? (
                        <Link to={`/shop/product/${r.productSlug}`} className="shrink-0">
                          <SmartImage src={r.productImage} alt={r.productName || 'Product'} width={56} className="h-14 w-14 rounded-lg" />
                        </Link>
                      ) : (
                        <SmartImage src={r.productImage} alt={r.productName || 'Product'} width={56} className="h-14 w-14 shrink-0 rounded-lg" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          {r.productSlug ? (
                            <Link to={`/shop/product/${r.productSlug}`} className="truncate text-sm font-medium hover:underline">{r.productName}</Link>
                          ) : (
                            <p className="truncate text-sm font-medium">{r.productName}</p>
                          )}
                          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                        </div>
                        <StarRating rating={r.rating} size={13} />
                        {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}