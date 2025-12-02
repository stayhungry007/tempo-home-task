import React from 'react';

type Props = {
  onPointerDown: (e: React.PointerEvent) => void;
};

export default function NoteResizer({ onPointerDown }: Props) {
  return <div className="note-resizer" onPointerDown={onPointerDown} />;
}
