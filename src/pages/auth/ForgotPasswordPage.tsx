import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { Button, Input, Field, Logo } from '../../components/ui';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    setSending(true);
    try {
      await api.post('/api/auth/forgot-password', d);
      setSentTo(d.email);
      setSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-2"><Logo size={28} withWordmark={false} /></div>
          <h1 className="font-editorial text-3xl font-medium tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            {sent ? "We've sent you a reset link" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>
        <div className="surface-panel rounded-2xl p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <p className="text-sm text-foreground">
                If an account exists for <span className="font-medium">{sentTo}</span>, a password reset link is on its way. Check your inbox (and spam folder).
              </p>
              <p className="text-xs text-muted-foreground">The link expires in 1 minute — open your email and click it right away.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Email" error={errors.email?.message} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" className="pl-10" error={!!errors.email} {...register('email')} autoFocus />
                </div>
              </Field>
              <Button type="submit" className="w-full" loading={sending}>Send Reset Link</Button>
            </form>
          )}
          <p className="mt-6 flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <Link to="/login" className="font-medium text-primary hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}