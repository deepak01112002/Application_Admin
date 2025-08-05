'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { usePathname } from 'next/navigation';

export default function AdminSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine current page based on pathname
  const getCurrentPage = () => {
    if (pathname.includes('/admin/social-media')) {
      return 'social-media';
    }
    if (pathname.includes('/admin/app-settings')) {
      return 'app-settings';
    }
    return 'dashboard';
  };

  return (
    <AdminLayout currentPage={getCurrentPage()}>
      {children}
    </AdminLayout>
  );
}
