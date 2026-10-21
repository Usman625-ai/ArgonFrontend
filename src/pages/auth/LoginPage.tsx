import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, logout, clearError } from '../../store/authSlice';
import { Button, Input, Field } from '../../components/ui';
import AuthShell from '../../components/layout/AuthShell';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

// Keep these props for backward compat with App.tsx /login route
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface P { onBack?: () => void; onSwitchToRegister?: () => void; }

export default function LoginPage(_props: P) {
  const [sp, setSp] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    dispatch(clearError());
    try {
      const user = await dispatch(login(d)).unwrap();
      if (!user.verified) {
        toast.error('Your email is not verified. Please check your inbox and verify first.');
        await dispatch(logout());
        return;
      }
      toast.success('Login successful!');
      const from = (location.state as { from?: Location } | null)?.from;
      const roleHome = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'SELLER' ? '/seller/dashboard' : '/shop';
      // Only honor "from" for customers returning to a shop page they were bounced from —
      // an admin/seller landing back on a /shop/* protected route wouldn't make sense.
      const dest = from && user.role === 'CUSTOMER' && from.pathname?.startsWith('/shop') ? from.pathname + (from.search || '') : roleHome;
      navigate(dest, { replace: true });
    } catch (e) {
      toast.error(e as string);
    }
  };

  return (
    <AuthShell title="Welcome" accent="back" subtitle="Log in to your Argon account to continue."
      footer={<><span>New to Argon? </span><Link to="/register" className="font-semibold text-foreground underline underline-offset-4">Create an account</Link><p className="mt-3"><Link to="/" className="text-xs hover:text-foreground">← Back to home</Link></p></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Email" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" autoComplete="email" placeholder="you@example.com" className="pl-11" error={!!errors.email} {...register('email')} />
          </div>
        </Field>
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[0.8rem] font-medium leading-none text-foreground/80">Password <span className="text-destructive">*</span></span>
            <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type={sp ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className="pl-11 pr-11" error={!!errors.password} {...register('password')} />
            <button type="button" onClick={() => setSp(!sp)} aria-label={sp ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {sp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password?.message && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isLoading}>Log in</Button>
      </form>
    </AuthShell>
  );
}
