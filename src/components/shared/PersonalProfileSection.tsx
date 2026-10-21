import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Camera, Eye, EyeOff, Shield, Loader2, KeyRound, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import type { User as UserType, ApiResponse } from '../../types';
import { getInitials } from '../../lib/utils';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Field, Modal, Badge, Skeleton } from '../ui';
import { useAppDispatch } from '../../store';
import { setUser } from '../../store/authSlice';

interface Props {
  /** Which role's profile endpoints to hit — both admin and seller expose the same shape. */
  basePath: '/api/seller' | '/api/admin';
}

/**
 * Personal info (name, avatar, contact number) + password change, shared by the
 * seller and admin "My Profile" pages. Shop-specific fields (shop name, logo,
 * GST, bank details, etc.) stay on the seller's separate Shop Settings page —
 * this component is only about the person, not the business.
 */
export default function PersonalProfileSection({ basePath }: Props) {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', contactNumber: '', profileImage: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordStep, setPasswordStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = (seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setOtpCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setOtpCooldown((s) => {
        if (s <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<UserType>>(`${basePath}/profile`);
      setProfile(res.data.data);
      setProfileForm({
        name: res.data.data.name || '',
        contactNumber: res.data.data.contactNumber || '',
        profileImage: res.data.data.profileImage || '',
      });
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [basePath]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const res = await api.put<ApiResponse<UserType>>(`${basePath}/profile`, profileForm);
      setProfile(res.data.data);
      dispatch(setUser(res.data.data));
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordStep('form');
    setOtp('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setOtpCooldown(0);
  };

  const requestPasswordOtp = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) { toast.error('Please fill all password fields'); return; }
    if (passwordForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) { toast.error('Password must include uppercase, lowercase and a digit'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordForm.currentPassword === passwordForm.newPassword) { toast.error('New password must be different from current password'); return; }

    setSendingOtp(true);
    try {
      await api.post('/api/auth/change-password/request-otp', { currentPassword: passwordForm.currentPassword });
      toast.success('OTP sent to your email');
      setPasswordStep('otp');
      startCooldown(60);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to send OTP');
    } finally { setSendingOtp(false); }
  };

  const resendPasswordOtp = async () => {
    if (otpCooldown > 0) return;
    setSendingOtp(true);
    try {
      await api.post('/api/auth/change-password/request-otp', { currentPassword: passwordForm.currentPassword });
      toast.success('OTP resent to your email');
      startCooldown(60);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to resend OTP');
    } finally { setSendingOtp(false); }
  };

  const confirmChangePassword = async () => {
    if (!/^\d{6}$/.test(otp)) { toast.error('Enter the 6-digit OTP sent to your email'); return; }
    setVerifyingOtp(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        otp,
      });
      toast.success('Password changed successfully');
      closePasswordModal();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to change password');
    } finally { setVerifyingOtp(false); }
  };

  const handleRemovePhoto = async () => {
    try {
      await api.put(`${basePath}/profile`, { ...profileForm, profileImage: '' });
      const updated = profile ? { ...profile, profileImage: '' } : profile;
      setProfile(updated);
      setProfileForm((f) => ({ ...f, profileImage: '' }));
      if (updated) dispatch(setUser(updated));
      toast.success('Profile photo removed');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to remove photo');
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<ApiResponse<string>>(`${basePath}/profile/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.data;
      await api.put(`${basePath}/profile`, { name: profile?.name, contactNumber: profile?.contactNumber, profileImage: url });
      const updated = profile ? { ...profile, profileImage: url } : profile;
      setProfile(updated);
      setProfileForm((f) => ({ ...f, profileImage: url || '' }));
      if (updated) dispatch(setUser(updated));
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {profile?.profileImage ? <img src={profile.profileImage} alt={profile.name} className="h-full w-full rounded-full object-cover" /> : getInitials(profile?.name || 'U')}
            </div>
            <input id={`avatar-input-${basePath}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ''; }} />
            <label htmlFor={`avatar-input-${basePath}`} className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90" title="Change photo">
              {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </label>
            {profile?.profileImage && (
              <button onClick={handleRemovePhoto} className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-90" title="Remove photo">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold font-display">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="default">{profile?.role}</Badge>
              {profile?.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}
              {profile?.active ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
            </div>
          </div>
          <Button variant="outline" onClick={() => { setPasswordStep('form'); setShowPasswordModal(true); }}><Lock className="h-4 w-4" /> Change Password</Button>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full Name" required><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div></Field>
          <Field label="Email"><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" value={profile?.email || ''} disabled /></div></Field>
          <Field label="Contact Number"><div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" placeholder="03XX-XXXXXXX" value={profileForm.contactNumber} onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })} /></div></Field>
          <Button onClick={saveProfile} loading={savingProfile}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Password Modal — Step 1 */}
      <Modal
        open={showPasswordModal && passwordStep === 'form'}
        onClose={closePasswordModal}
        title="Change Password"
        description="Enter your current password and a new one. We'll email you a code to confirm."
        footer={<><Button variant="outline" onClick={closePasswordModal}>Cancel</Button><Button onClick={requestPasswordOtp} loading={sendingOtp}><Shield className="h-4 w-4" /> Send OTP</Button></>}
      >
        <div className="space-y-4">
          <Field label="Current Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type={showPasswords.current ? 'text' : 'password'} className="pl-10 pr-10" placeholder="••••••••" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </Field>
          <Field label="New Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type={showPasswords.new ? 'text' : 'password'} className="pl-10 pr-10" placeholder="••••••••" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters, with uppercase, lowercase and a digit</p>
          </Field>
          <Field label="Confirm New Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type={showPasswords.confirm ? 'text' : 'password'} className="pl-10 pr-10" placeholder="••••••••" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </Field>
        </div>
      </Modal>

      {/* Password Modal — Step 2 */}
      <Modal
        open={showPasswordModal && passwordStep === 'otp'}
        onClose={closePasswordModal}
        title="Enter Verification Code"
        description={`We've sent a 6-digit code to ${profile?.email || 'your email'}`}
        footer={<><Button variant="outline" onClick={() => setPasswordStep('form')}>Back</Button><Button onClick={confirmChangePassword} loading={verifyingOtp}><KeyRound className="h-4 w-4" /> Verify & Update</Button></>}
      >
        <div className="space-y-4">
          <Field label="6-Digit OTP" required>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </Field>
          <button
            type="button"
            onClick={resendPasswordOtp}
            disabled={otpCooldown > 0 || sendingOtp}
            className="text-sm font-medium text-primary transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </Modal>
    </div>
  );
}