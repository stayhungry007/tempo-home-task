import React, { useEffect, useRef, useState } from 'react';
import NoteHeader from './NoteHeader';
import NoteContent from './NoteContent';
import NoteResizer from './NoteResizer';

export type NoteData = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  color?: string;
  content?: string;
  title?: string;
};

type Props = {
  data: NoteData;
  onChange: (patch: Partial<NoteData>) => void;
  onDragEnd: (clientRect: DOMRect, dropped: boolean) => void;
  bringToFront: () => void;
  trashRect: DOMRect | null;
};

export default function Note({ data, onChange, onDragEnd, bringToFront, trashRect }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  // local drag state to avoid too many updates
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; pending?: boolean } | null>(null);
  const resizeState = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      // update last pointer for environments where pointerup may lack coords
      if (typeof e.clientX === 'number' && typeof e.clientY === 'number') lastPointer.current = { x: e.clientX, y: e.clientY };
      if (dragState.current) {
        const { startX, startY, origX, origY, pending } = dragState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const dist2 = dx * dx + dy * dy;
        const threshold = 5; // px
        if (pending && dist2 <= threshold * threshold) {
          // not moved enough to start drag
          return;
        }
        if (pending) {
          // officially begin dragging
          dragState.current = { startX, startY, origX, origY, pending: false };
          setIsDragging(true);
        }
        onChange({ x: origX + dx, y: origY + dy });
      } else if (resizeState.current) {
        const { startX, startY, origW, origH } = resizeState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        onChange({ w: Math.max(80, origW + dx), h: Math.max(60, origH + dy) });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (dragState.current) {
        // if dragging never started (pending true), treat as a click (not a drop)
        const wasDragging = isDragging;
        setIsDragging(false);
        const el = ref.current;
        const pending = dragState.current.pending ?? false;
        dragState.current = null;
        if (el) {
          const rect = el.getBoundingClientRect();
          onDragEnd(rect, wasDragging && !pending);
        }
      }
      if (resizeState.current) {
        setIsResizing(false);
        resizeState.current = null;
        const el = ref.current;
        if (el) {
          const r = el.getBoundingClientRect();
          onDragEnd(r, true);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onChange, onDragEnd]);

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    // if this is a double-click, don't start dragging so header double-click works
    if ((e as any).detail && (e as any).detail > 1) return;
    bringToFront();
    // mark drag as pending; only begin actual dragging when pointer moves past threshold
    dragState.current = {
      startX: typeof e.clientX === 'number' && Number.isFinite(e.clientX) ? e.clientX : 0,
      startY: typeof e.clientY === 'number' && Number.isFinite(e.clientY) ? e.clientY : 0,
      origX: data.x,
      origY: data.y,
      pending: true,
    };
  };

  const onResizerPointerDown = (e: React.PointerEvent) => {
    // do not use setPointerCapture - avoid capturing pointer which can block child controls
    bringToFront();
    setIsResizing(true);
    resizeState.current = {
      startX: typeof e.clientX === 'number' && Number.isFinite(e.clientX) ? e.clientX : 0,
      startY: typeof e.clientY === 'number' && Number.isFinite(e.clientY) ? e.clientY : 0,
      origW: data.w,
      origH: data.h,
    };
    e.stopPropagation();
    e.preventDefault();
  };

  const onBodyClick = () => {
    bringToFront();
  };

  const onContentBlur = (text: string) => {
    onChange({ content: text });
  };

  // when pointerdown ends without moving (click), we should still report drag end with dropped=false
  const onPointerCancel = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      dragState.current = null;
      resizeState.current = null;
      const el = ref.current;
      if (el) onDragEnd(el.getBoundingClientRect(), false);
    }
  };

  useEffect(() => {
    window.addEventListener('pointercancel', onPointerCancel);
    return () => window.removeEventListener('pointercancel', onPointerCancel);
  });

  const style: React.CSSProperties = {
    transform: `translate(${Math.round(data.x)}px, ${Math.round(data.y)}px)`,
    width: Math.round(data.w) + 'px',
    height: Math.round(data.h) + 'px',
    zIndex: data.z ?? 0,
    background: data.color ?? '#fff59d',
  };

  const isOverTrash = () => {
    const el = ref.current;
    if (!el || !trashRect) return false;
    const r = el.getBoundingClientRect();
    // simple intersection
    return !(r.right < trashRect.left || r.left > trashRect.right || r.bottom < trashRect.top || r.top > trashRect.bottom);
  };

  return (
    <div
      className={`note ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isOverTrash() ? 'over-trash' : ''}`}
      ref={ref}
      style={style}
      onMouseDown={() => bringToFront()}
      onDoubleClick={(e) => e.stopPropagation()} // prevent board double-click from firing when interacting inside a note
    >
      <NoteHeader
        title={data.title ?? `Note #${data.id}`}
        onPointerDown={onHeaderPointerDown}
        currentColor={data.color}
        onColorChange={(c) => onChange({ color: c })}
        onTitleChange={(t) => onChange({ title: t })}
      />
      <NoteContent content={data.content} onBlur={onContentBlur} onClick={onBodyClick} />
      <NoteResizer onPointerDown={onResizerPointerDown} />
    </div>
  );
}
