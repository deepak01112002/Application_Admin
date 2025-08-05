'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-beautiful-dnd to avoid SSR issues
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);

const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);

const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface DragDropWrapperProps {
  onDragEnd: (result: any) => void;
  droppableId: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DragDropWrapper({ onDragEnd, droppableId, children, disabled = false }: DragDropWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [isDragDropLoaded, setIsDragDropLoaded] = useState(false);
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Small delay to ensure components are loaded
    const timer = setTimeout(() => {
      setIsDragDropLoaded(true);
      if (!disabled) {
        setIsDragDropEnabled(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [disabled]);

  // Disable drag and drop when disabled prop changes
  useEffect(() => {
    if (disabled) {
      setIsDragDropEnabled(false);
    } else if (isDragDropLoaded) {
      setIsDragDropEnabled(true);
    }
  }, [disabled, isDragDropLoaded]);

  const handleDragEnd = useCallback((result: any) => {
    // Only handle drag end if drag and drop is enabled
    if (isDragDropEnabled && !disabled) {
      onDragEnd(result);
    }
  }, [onDragEnd, isDragDropEnabled, disabled]);

  // If not ready or disabled, show fallback
  if (!isClient || !isDragDropLoaded || disabled || !isDragDropEnabled) {
    return <div className="space-y-4">{children}</div>;
  }

  try {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={droppableId} isDropDisabled={disabled}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {children}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  } catch (error) {
    console.warn('DragDropWrapper error:', error);
    // Fallback to non-draggable list
    return <div className="space-y-4">{children}</div>;
  }
}

interface DraggableItemProps {
  draggableId: string;
  index: number;
  children: (provided: any, snapshot: any) => React.ReactNode;
  disabled?: boolean;
}

export function DraggableItem({ draggableId, index, children, disabled = false }: DraggableItemProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fallbackProps = {
    innerRef: () => {},
    draggableProps: {},
    dragHandleProps: {}
  };

  const fallbackSnapshot = { isDragging: false };

  if (!isClient || disabled) {
    return (
      <div className="p-6 border-b last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
        {children(fallbackProps, fallbackSnapshot)}
      </div>
    );
  }

  try {
    return (
      <Draggable draggableId={draggableId} index={index} isDragDisabled={disabled}>
        {children}
      </Draggable>
    );
  } catch (error) {
    console.warn('DraggableItem error:', error);
    // Fallback to non-draggable item
    return (
      <div className="p-6 border-b last:border-b-0 bg-white hover:bg-gray-50 transition-colors">
        {children(fallbackProps, fallbackSnapshot)}
      </div>
    );
  }
}
