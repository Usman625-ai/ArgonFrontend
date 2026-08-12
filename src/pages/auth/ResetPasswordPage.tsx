import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { Button, Input, Field, Logo } from '../../components/ui';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must be at most 50 characters')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must include uppercase, lowercase and a digit'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    if (!token) { toast.error('Missing or invalid reset link'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: d.newPassword });
      setDone(true);
      toast.success('Password reset successful');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-2"><Logo size={28} withWordmark={false} /></div>
          <h1 className="font-editorial text-3xl font-medium tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Choose a new password for your account</p>
        </div>
        <div className="surface-panel rounded-2xl p-8">
          {!token ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <p className="text-sm text-foreground">This reset link is invalid or missing a token.</p>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Request a new reset link</Link>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <p className="text-sm text-foreground">Your password has been reset. Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="New Password" error={errors.newPassword?.message} required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showNew ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" error={!!errors.newPassword} {...register('newPassword')} autoFocus />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {!errors.newPassword && <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters, with uppercase, lowercase and a digit</p>}
              </Field>
              <Field label="Confirm New Password" error={errors.confirmPassword?.message} required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="pl-10 pr-10" error={!!errors.confirmPassword} {...register('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Button type="submit" className="w-full" loading={submitting}>Reset Password</Button>
            </form>
          )}
          {!done && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it? <Link to="/login" className="font-medium text-primary hover:underline">Back to Login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}