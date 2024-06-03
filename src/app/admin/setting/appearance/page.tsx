"use client";
import { Separator } from "@/components/ui/separator";
import { AppearanceForm } from "./appearance-form";

export default function SettingsAppearancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cài đặt giao diện</h3>
        <p className="text-sm text-muted-foreground">
          Lựa chọn các giao diện muốn hiển thị
        </p>
      </div>
      <Separator />
      <AppearanceForm />
    </div>
  );
}