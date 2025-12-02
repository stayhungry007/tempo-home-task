import React from 'react';
import { Dispatch, SetStateAction } from 'react';

type Size = { w: number; h: number };

type Props = {
  selectedSize: Size;
  sizeInput: { w: string; h: string };
  setSizeInput: Dispatch<SetStateAction<{ w: string; h: string }>>;
  commitSize: (field: 'w' | 'h') => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  presetColors: string[];
  createCenteredNote: () => void;
  clearAll: () => void;
  saveToServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
  serverStatus: string;
  onOpenHelp?: () => void;
};

export default function Sidebar({
  selectedSize,
  sizeInput,
  setSizeInput,
  commitSize,
  selectedColor,
  setSelectedColor,
  presetColors,
  createCenteredNote,
  clearAll,
  saveToServer,
  loadFromServer,
  serverStatus,
  onOpenHelp,
}: Props) {
  return (
    <div className="App-sidebar">
      <h2>Sticky Notes</h2>

      <div className="control-row">
        <label>Size:</label>
        <input
          type="number"
          value={sizeInput.w}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSizeInput((s) => ({ ...s, w: e.target.value }))}
          onBlur={() => commitSize('w')}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') commitSize('w'); }}
          style={{ width: 70 }}
          min={80}
        />
        ×
        <input
          type="number"
          value={sizeInput.h}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSizeInput((s) => ({ ...s, h: e.target.value }))}
          onBlur={() => commitSize('h')}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') commitSize('h'); }}
          style={{ width: 70 }}
          min={60}
        />
      </div>

      <div className="control-row" style={{ alignItems: 'center' }}>
        <label style={{ marginRight: 6 }}>Color:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="selected-indicator" style={{ background: selectedColor }} aria-hidden />
          <div className="swatches" role="list">
            {presetColors.map((c) => (
              <button
                key={c}
                className={`swatch ${selectedColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
                aria-label={`Select color ${c}`}
                title="Select color for new notes"
              />
            ))}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ marginLeft: 8, width: 36, height: 28, borderRadius: 6, border: '1px solid #e6e9ef' }}
              aria-label="Custom color"
              title="Pick custom color"
            />
          </div>
        </div>
      </div>

      <div className="control-row btn-group" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" onClick={createCenteredNote}>
          Create Note
        </button>

        <button className="btn" onClick={clearAll}>
          Clear All
        </button>

        <button className="btn" onClick={saveToServer} title="Save notes to mock server">
          Save
        </button>
        <button className="btn" onClick={loadFromServer} title="Load notes from mock server">
          Load
        </button>
      </div>

      <div className="help">
        <ul>
          <li>
            <strong>Create:</strong>
            <span> Double-click the board or press Create Note to add a new note.</span>
          </li>
          <li>
            <strong>Move:</strong>
            <span> Drag the header to reposition a note.</span>
          </li>
          <li>
            <strong>Resize:</strong>
            <span> Drag the bottom-right handle to resize.</span>
          </li>
          <li>
            <strong>Delete:</strong>
            <span> Drag a note over the red Trash and release to remove it.</span>
          </li>
          <li>
            <strong>Edit:</strong>
            <span> Click the body to edit content. Double-click the header to rename.</span>
          </li>
          <li>
            <strong>Colors:</strong>
            <span> Pick a preset color for new notes or change a note's color from its header.</span>
          </li>
        </ul>
        <div style={{ marginTop: 8, color: '#6b7280' }}>Notes auto-save to localStorage. Server status: {serverStatus}</div>
        {onOpenHelp && (
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-ghost" onClick={onOpenHelp}>More help</button>
          </div>
        )}
      </div>
    </div>
  );
}
