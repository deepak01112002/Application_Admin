'use client';

import { SpecificationsDebug } from '@/components/debug/specifications-debug';

export default function SpecificationsDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Specifications Debug</h1>
      <SpecificationsDebug />
    </div>
  );
}
