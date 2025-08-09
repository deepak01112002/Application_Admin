"use client";

import { BusinessSettings } from "@/components/settings/business-settings";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function SettingsPage() {
  return (
    <AdminLayout currentPage="settings">
      <div className="webview-optimized webview-scroll">
        <BusinessSettings />
      </div>
    </AdminLayout>
  );
}
