"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <AdminLayout currentPage="analytics">
      <AnalyticsDashboard />
    </AdminLayout>
  );
}
