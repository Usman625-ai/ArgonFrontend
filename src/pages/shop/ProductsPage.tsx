import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Rows3, X, Package, Search, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import type { Product, Category, ApiResponse, PagedResponse } from '../../types';
import { cn, flattenCategories } from '../../lib/utils';
import { SkeletonCard } from '../../components/ui';
import ProductCard from '../../components/shop/ProductCard';
import Pagination from '../../components/shop/Pagination';
import EmptyState from '../../components/shop/EmptyState';

const sortOptions = [
  { value: 'createdAt,DESC', label: 'Newest' },
  { value: 'price,ASC', label: 'Price: Low to High' },
  { value: 'price,DESC', label: 'Price: High to Low' },
  { value: 'averageRating,DESC', label: 'Top Rated' },
  { value: 'name,ASC', label: 'Name: A-Z' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showRefine, setShowRefine] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedParents, setExpandedParents] = useState<Record<number, boolean>>({});

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sortBy') || 'createdAt,DESC';

  // Find the active category name by walking the tree (parents + children).
  const activeCategoryName = useMemo(() => {
    if (!categoryId) return '';
    let found = '';
    const walk = (list: Category[]) => {
      list.forEach((c) => {
        if (String(c.id) === categoryId) found = c.name;
        if (c.children?.length) walk(c.children);
      });
    };
    walk(categoryTree);
    return found;
  }, [categoryId, categoryTree]);

  const loadCategoriesAndBrands = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get<ApiResponse<Category[]>>('/api/categories'),
        api.get<ApiResponse<string[]>>('/api/brands'),
      ]);
      // Keep the nested tree so the sidebar can render parents with
      // collapsible child dropdowns instead of a flat hardcoded list.
      setCategoryTree(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch { /* ignore */ }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortDir] = sort.split(',');
      const params: Record<string, string | number> = { page, size: 12, sortBy, sortDir: sortDir || 'DESC' };
      if (q) params.q = q;
      if (categoryId) params.categoryId = categoryId;
      if (brand) params.brand = brand;
      const res = await api.get<ApiResponse<PagedResponse<Product>>>('/api/products', { params });
      setProducts(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 0);
      setTotalElements(res.data.data.totalElements || 0);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [q, categoryId, brand, sort, page]);

  useEffect(() => { loadCategoriesAndBrands(); }, [loadCategoriesAndBrands]);
  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { setPage(0); }, [q, categoryId, brand, sort]);

  // Auto-expand the parent that contains the active subcategory.
  useEffect(() => {
    if (!categoryId) return;
    const parentOfActive = (() => {
      let parent: number | null = null;
      const walk = (list: Category[], p: number | null) => {
        list.forEach((c) => {
          if (String(c.id) === categoryId) parent = p;
          if (c.children?.length) walk(c.children, c.id);
        });
      };
      walk(categoryTree, null);
      return parent;
    })();
    if (parentOfActive != null) setExpandedParents((prev) => ({ ...prev, [parentOfActive]: true }));
  }, [categoryId, categoryTree]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const activeFilterCount = useMemo(() => [categoryId, brand, q].filter(Boolean).length, [categoryId, brand, q]);

  const toggleParent = (id: number) => setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));

  const flatCats = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const [searchText, setSearchText] = useState(q);
  useEffect(() => { setSearchText(q); }, [q]);

  const pill = 'relative flex h-12 min-w-[10.5rem] items-center rounded-full bg-card pl-5 pr-10 text-left ring-1 ring-border/60 transition-shadow hover:ring-foreground/30 focus-within:ring-2 focus-within:ring-foreground/40';
  const Pill = ({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
    <label className={pill}>
      <span className="pointer-events-none flex flex-col leading-tight">
        <span className="text-[0.62rem] text-muted-foreground">{label}</span>
        <span className="h-[1.1rem]" />
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full cursor-pointer appearance-none rounded-full bg-transparent pl-5 pt-4 pr-10 text-sm font-medium text-foreground focus:outline-none">{children}</select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );

  return (
    <div className="mx-auto max-w-[88rem] px-4 pb-8 pt-10 sm:px-8 sm:pt-14">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow mb-3">{activeCategoryName || 'The collection'}</p>
        <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
          {q ? <>Results for <em className="font-editorial font-normal italic text-gold">“{q}”</em></> : activeCategoryName ? activeCategoryName : <>Get <em className="font-editorial font-normal italic text-gold">inspired</em></>}
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground">Browse curated goods from verified sellers across Pakistan — filter by category or brand, or search for something specific.</p>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <form onSubmit={(e) => { e.preventDefault(); updateParam('q', searchText.trim()); }} className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search products" className="h-12 w-full rounded-full bg-card pl-11 pr-4 text-sm ring-1 ring-border/60 placeholder:text-muted-foreground hover:ring-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/40" />
        </form>
        <Pill label="Category" value={categoryId} onChange={(v) => updateParam('categoryId', v)}>
          <option value="">All categories</option>
          {flatCats.map((c) => <option key={c.id} value={String(c.id)}>{'\u00A0\u00A0'.repeat(c.depth)}{c.depth ? '↳ ' : ''}{c.name}</option>)}
        </Pill>
        <Pill label="Brand" value={brand} onChange={(v) => updateParam('brand', v)}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </Pill>
        <div className="ml-auto flex items-center gap-2.5">
          <Pill label="Sort" value={sort} onChange={(v) => updateParam('sortBy', v)}>
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Pill>
          <div className="hidden h-12 items-center rounded-full bg-card p-1 ring-1 ring-border/60 sm:flex">
            {([['grid', LayoutGrid], ['list', Rows3]] as const).map(([k, Icon]) => (
              <button key={k} onClick={() => setLayout(k)} aria-label={`${k} view`} className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', layout === k ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}><Icon className="h-4 w-4" /></button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 flex min-h-8 flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{loading ? 'Loading…' : `${totalElements} ${totalElements === 1 ? 'product' : 'products'}`}</span>
        {activeFilterCount > 0 && <>
          <span className="text-border">·</span>
          {q && <button onClick={() => updateParam('q', '')} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium hover:bg-accent">“{q}”<X className="h-3 w-3" /></button>}
          {categoryId && <button onClick={() => updateParam('categoryId', '')} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium hover:bg-accent">{activeCategoryName || 'Category'}<X className="h-3 w-3" /></button>}
          {brand && <button onClick={() => updateParam('brand', '')} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium hover:bg-accent">{brand}<X className="h-3 w-3" /></button>}
          <button onClick={clearFilters} className="text-xs font-medium underline underline-offset-4 hover:text-gold">Clear all</button>
        </>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your filters or search terms." actionLabel="Clear Filters" onAction={clearFilters} />
      ) : (
        <>
          <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 sm:gap-x-6' : 'mx-auto flex max-w-4xl flex-col gap-3')}>
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} layout={layout} />)}
          </div>
          <div className="mt-14"><Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => { setPage(p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></div>
        </>
      )}
    </div>
  );
}
