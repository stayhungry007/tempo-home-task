import React, { useEffect } from 'react';

type Props = { onClose: () => void };

export default function HelpModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="help-modal-backdrop" role="dialog" aria-modal="true">
      <div className="help-modal">
        <div className="help-modal-header">
          <h3>How to use Sticky Notes</h3>
          <button className="btn" onClick={onClose} aria-label="Close help">Close</button>
        </div>
        <div className="help-modal-body">
          <p>This app supports creating, moving, resizing and deleting sticky notes.</p>
          <ul>
            <li><strong>Create</strong>: Double-click the board or note header, or press Create Note.</li>
            <li><strong>Move</strong>: Drag the header to reposition a note. Click a note to bring it to front.</li>
            <li><strong>Resize</strong>: Drag the bottom-right handle to resize a note.</li>
            <li><strong>Delete</strong>: Drag a note over the red Trash and release to remove it.</li>
            <li><strong>Edit</strong>: Click the body to edit content. Double-click the header to rename a note.</li>
            <li><strong>Colors</strong>: Use presets or the color picker. Change per-note color via its header.</li>
            <li><strong>Persistence</strong>: Notes are saved to localStorage automatically; you can also Save/Load to the mock server.</li>
          </ul>
          <p style={{ color: '#6b7280' }}>Press Escape or the Close button to dismiss.</p>
        </div>
      </div>
    </div>
  );
}
