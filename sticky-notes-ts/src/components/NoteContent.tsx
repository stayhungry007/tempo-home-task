import React, { useEffect, useRef } from 'react';

type Props = {
  content?: string;
  onBlur: (text: string) => void;
  onClick: () => void;
};

export default function NoteContent({ content, onBlur, onClick }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  // initialize editable content; avoid overwriting while user is actively editing
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return; // don't clobber while editing
    // set plain text (preserve line breaks)
    el.innerText = content ?? '';
  }, [content]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    onBlur(el.innerText);
  };

  const handleBlur = () => {
    const el = ref.current;
    if (!el) return;
    onBlur(el.innerText);
  };

  return (
    <div className="note-body" onClick={onClick}>
      <div
        ref={ref}
        className="note-content"
        onDoubleClick={(e) => e.stopPropagation()}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
      />
    </div>
  );
}
