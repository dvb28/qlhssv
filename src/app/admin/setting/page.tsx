"use client";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile/profile-form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thông tin tài khoản</h3>
        <p className="text-sm text-muted-foreground">
          Thông tin đăng ký của tài khoản
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}