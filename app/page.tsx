// app/page.tsx
'use client';

import { useGradingPortal } from '@/hooks/useGradingPortal';
import GradingPortalView from '@/components/GradingPortalView';

export default function Home() {
  const portal = useGradingPortal();
  
  return (
    <GradingPortalView 
      state={portal.state} 
      actions={portal.actions} 
    />
  );
}