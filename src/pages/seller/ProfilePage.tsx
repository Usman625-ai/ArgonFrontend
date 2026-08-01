import PersonalProfileSection from '../../components/shared/PersonalProfileSection';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold font-display tracking-tight">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information and password</p>
      </div>
      <PersonalProfileSection basePath="/api/seller" />
    </div>
  );
}