'use client';

import { useGradebook } from '@/hooks/useGradebook';
import GradebookView from '@/components/GradebookView';

export default function GradebookPage() {
  const gradebook = useGradebook();

  return (
    <GradebookView 
      state={gradebook.state} 
      actions={gradebook.actions} 
    />
  );
}