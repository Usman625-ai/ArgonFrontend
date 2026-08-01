import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users, Search, Eye, Ban, RotateCcw, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Mail, Phone, Calendar,
} from 'lucide-react';
import api from '../../lib/api';
import type { User, PagedResponse, ApiResponse } from '../../types';
import {
  Card, CardContent, Button, Input, Badge, Modal, Field, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton,
} from '../../components/ui';
import { formatDate, getInitials } from '../../lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [selected, setSelected] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  // Debounce search input → search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 10 };
      if (search.trim()) params.search = search.trim();
      const res = await api.get<ApiResponse<PagedResponse<User>>>('/api/admin/customers', { params });
      const pr = res.data.data;
      if (!pr) return;
      setCustomers(pr.content || []);
      setTotalPages(pr.totalPages);
      setTotalElements(pr.totalElements);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleToggleStatus = async (customer: User) => {
    setActionLoading(customer.id);
    try {
      const res = await api.put<ApiResponse<User>>(`/api/admin/users/${customer.id}/status`, null, { params: { enable: !customer.active } });
      const updated = res.data.data;
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success(`Customer ${updated.active ? 'activated' : 'deactivated'}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to update customer status');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteOne = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/customers/${deleteTarget.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setTotalElements((n) => Math.max(0, n - 1));
      toast.success(`${deleteTarget.name} was deleted`);
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setSelected(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteAllModal = () => { setShowDeleteAll(false); setDeleteAllConfirmText(''); };

  const confirmDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await api.delete<ApiResponse<number>>('/api/admin/customers');
      toast.success(res.data.message || `${res.data.data} customer account(s) deleted`);
      closeDeleteAllModal();
      setSelected(null);
      setPage(0);
      fetchCustomers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to delete customers');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalElements} customer{totalElements !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-9 sm:w-64" />
          </div>
          {customers.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteAll(true)}><Trash2 className="h-4 w-4" /> Delete All</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-foreground">No customers found</p>
              <p className="mt-1 text-sm text-muted-foreground">{search ? 'Try a different search term' : 'Customers will appear here once they sign up'}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id} onClick={() => setSelected(c)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {c.profileImage ? <img src={c.profileImage} alt={c.name} className="h-full w-full rounded-full object-cover" /> : getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{c.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.contactNumber || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={c.active ? 'success' : 'destructive'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                          {!c.verified && <Badge variant="warning">Unverified</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="outline" title={c.active ? 'Deactivate' : 'Activate'}
                            loading={actionLoading === c.id}
                            onClick={() => handleToggleStatus(c)}
                          >
                            {c.active ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="destructive" title="Delete customer" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" title="View details" onClick={() => setSelected(c)}><Eye className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">{totalElements} customer{totalElements !== 1 ? 's' : ''} total</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button>
                  <span className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(totalPages, 1)}</span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer details modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {selected.profileImage ? <img src={selected.profileImage} alt={selected.name} className="h-full w-full rounded-full object-cover" /> : getInitials(selected.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
                <div className="mt-1 flex gap-1.5">
                  <Badge variant={selected.active ? 'success' : 'destructive'}>{selected.active ? 'Active' : 'Inactive'}</Badge>
                  {!selected.verified && <Badge variant="warning">Unverified</Badge>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={selected.email} />
              <InfoRow icon={Phone} label="Contact Number" value={selected.contactNumber} />
              <InfoRow icon={Calendar} label="Joined" value={formatDate(selected.createdAt)} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" loading={actionLoading === selected.id} onClick={() => handleToggleStatus(selected)}>
                {selected.active ? <><Ban className="h-4 w-4" /> Deactivate</> : <><RotateCcw className="h-4 w-4" /> Activate</>}
              </Button>
              <Button variant="destructive" onClick={() => { setDeleteTarget(selected); setSelected(null); }}><Trash2 className="h-4 w-4" /> Delete Customer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete one confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this customer?"
        description={deleteTarget ? `This permanently deletes ${deleteTarget.name}'s account and all their orders, addresses, cart, wishlist, reviews, and notifications. This cannot be undone.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteOne} loading={deleting}><Trash2 className="h-4 w-4" /> Delete Permanently</Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-muted-foreground">This action is irreversible.</p>
        </div>
      </Modal>

      {/* Delete all confirm */}
      <Modal
        open={showDeleteAll}
        onClose={closeDeleteAllModal}
        title="Delete all customer accounts?"
        description="This permanently deletes every customer and all their data. Sellers and admins are untouched. This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteAllModal}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteAll} loading={deletingAll} disabled={deleteAllConfirmText !== 'DELETE'}>
              <Trash2 className="h-4 w-4" /> Delete Permanently
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-muted-foreground">All {totalElements} customer account{totalElements !== 1 ? 's' : ''} will be removed, along with their orders, addresses, cart items, wishlist entries, reviews, and notifications.</p>
        </div>
        <Field label="Confirmation">
          <p className="mb-1.5 text-sm text-muted-foreground">Type <span className="font-mono font-semibold text-destructive">DELETE</span> to confirm</p>
          <Input value={deleteAllConfirmText} onChange={(e) => setDeleteAllConfirmText(e.target.value)} placeholder="DELETE" autoFocus />
        </Field>
      </Modal>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-foreground">{value || '—'}</p>
      </div>
    </div>
  );
}