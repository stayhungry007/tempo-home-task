import React, { useState, useRef, useEffect } from 'react';

type Props = {
  title: string;
  onPointerDown: (e: React.PointerEvent) => void;
  currentColor?: string;
  onColorChange?: (color: string) => void;
  onTitleChange?: (title: string) => void;
};

const PRESETS = ['#fff59d', '#ffd2a6', '#ffb4c1', '#c8f7c5', '#cfe8ff', '#f6f6f9', '#fff3bf', '#d1c4e9'];

export default function NoteHeader({ title, onPointerDown, currentColor, onColorChange, onTitleChange }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(title);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTemp(title);
  }, [title]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (onTitleChange && temp !== title) onTitleChange(temp.trim());
  };
  const cancel = () => {
    setEditing(false);
    setTemp(title);
  };

  return (
    <div className="note-header" ref={ref} onPointerDown={(e) => { if (!editing) onPointerDown(e); }}>
      {!editing ? (
        <div
          className="note-title"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="Double-click to edit title"
        >
          {title}
        </div>
      ) : (
        <input
          ref={inputRef}
          className="note-title-input"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
            } else if (e.key === 'Escape') {
              cancel();
            }
          }}
        />
      )}

      <div className="note-header-controls">
        <button
          type="button"
          className="color-btn"
          onPointerDown={(e) => {
            // prevent header drag from starting when interacting with this control
            e.stopPropagation();
          }}
          onClick={(e) => {
            // toggle palette and prevent header from receiving the click
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          title="Change color"
          style={{ background: currentColor ?? undefined }}
        />
        {open && (
          <div className="color-palette" onClick={(e) => e.stopPropagation()}>
            {PRESETS.map((c) => (
              <button
                type="button"
                key={c}
                className="color-swatch"
                style={{ background: c }}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange && onColorChange(c);
                  setOpen(false);
                }}
                aria-label={`Set color ${c}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
