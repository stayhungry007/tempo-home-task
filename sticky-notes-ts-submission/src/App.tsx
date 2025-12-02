import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Note, { NoteData } from './components/Note';
import Trash from './components/Trash';
import { saveNotesToServer, loadNotesFromServer } from './api/mockApi';
import Sidebar from './components/Sidebar';
import { parseAndClampSize } from './utils/size';
import HelpModal from './components/HelpModal';

const STORAGE_KEY = 'sticky-notes-ts:v1';

const PRESET_COLORS = ['#fff59d', '#ffd2a6', '#ffb4c1', '#f7c46c', '#c8f7c5', '#cfe8ff', '#f6f6f9', '#d1c4e9'];

function defaultNotes(): NoteData[] {
  return [];
}

function App() {
  const [notes, setNotes] = useState<NoteData[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as NoteData[];
    } catch (e) {
      // ignore
    }
    return defaultNotes();
  });

  const [nextId, setNextId] = useState<number>(() => {
    return notes.reduce((m, n) => Math.max(m, n.id), 0) + 1;
  });

  const [selectedSize, setSelectedSize] = useState<{ w: number; h: number }>({ w: 200, h: 150 });
  // controlled text inputs for size so user can type freely, validated on blur/Enter
  const [sizeInput, setSizeInput] = useState<{ w: string; h: string }>(() => ({ w: String(selectedSize.w), h: String(selectedSize.h) }));

  useEffect(() => {
    // keep inputs in sync when selectedSize is updated programmatically
    setSizeInput({ w: String(selectedSize.w), h: String(selectedSize.h) });
  }, [selectedSize.w, selectedSize.h]);

  const [selectedColor, setSelectedColor] = useState<string>('#fff59d');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [serverStatus, setServerStatus] = useState<'idle' | 'saving' | 'loading' | 'error'>('idle');

  const trashRef = useRef<HTMLDivElement | null>(null);
  const [trashRect, setTrashRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = trashRef.current;
    const update = () => setTrashRect(el?.getBoundingClientRect() ?? null);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Save notes to mock server
  const saveToServer = async () => {
    setServerStatus('saving');
    try {
      await saveNotesToServer(notes);
      setServerStatus('idle');
    } catch (err) {
      setServerStatus('error');
    }
  };

  const loadFromServer = async () => {
    setServerStatus('loading');
    try {
      const serverNotes = await loadNotesFromServer();
      setNotes(serverNotes);
      setNextId(serverNotes.reduce((m, n) => Math.max(m, n.id), 0) + 1);
      setServerStatus('idle');
    } catch (err) {
      setServerStatus('error');
    }
  };

  const createNote = (x: number, y: number, w = selectedSize.w, h = selectedSize.h) => {
    const note: NoteData = {
      id: nextId,
      x,
      y,
      w,
      h,
      z: (notes.reduce((m, n) => Math.max(m, n.z ?? 0), 0) || 0) + 1,
      color: selectedColor,
      content: 'New note',
    };
    setNextId((v) => v + 1);
    setNotes((ns) => [...ns, note]);
  };

  const updateNote = (id: number, patch: Partial<NoteData>) => {
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const removeNote = (id: number) => {
    setNotes((ns) => ns.filter((n) => n.id !== id));
  };

  const bringToFront = (id: number) => {
    setNotes((ns) => {
      const maxZ = ns.reduce((m, n) => Math.max(m, n.z ?? 0), 0);
      return ns.map((n) => (n.id === id ? { ...n, z: maxZ + 1 } : n));
    });
  };

  // board click to create note at position
  const boardRef = useRef<HTMLDivElement | null>(null);
  const onBoardDoubleClick = (e: React.MouseEvent) => {
    // create centered at cursor
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left - selectedSize.w / 2;
    const y = e.clientY - rect.top - selectedSize.h / 2;
    createNote(x, y);
  };

  // when dragging/resizing, notes will report their current client rect via callbacks to detect trash overlap
  const handleDragEndCheckTrash = (id: number, clientRect: DOMRect, dropped: boolean) => {
    const tRect = trashRect ?? (trashRef.current ? trashRef.current.getBoundingClientRect() : null);
    if (!tRect) return;
    const intersects = rectsIntersect(clientRect, tRect);
    if (dropped && intersects) removeNote(id);
  };

  // helper: validate and commit size field using shared parser
  const commitSize = (field: 'w' | 'h') => {
    const value = field === 'w' ? sizeInput.w : sizeInput.h;
    const num = parseAndClampSize(value, field);
    setSelectedSize((s) => ({ ...s, [field]: num }));
    // sync inputs to reflect committed value
    setSizeInput((p) => ({ ...p, [field]: String(num) }));
  };

  return (
    <div className="App-root">
      <Sidebar
        selectedSize={selectedSize}
        sizeInput={sizeInput}
        setSizeInput={setSizeInput}
        commitSize={commitSize}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        presetColors={PRESET_COLORS}
        createCenteredNote={() => {
          const board = boardRef.current;
          if (!board) return;
          const rect = board.getBoundingClientRect();
          createNote((rect.width - selectedSize.w) / 2, (rect.height - selectedSize.h) / 2);
        }}
        clearAll={() => setNotes([])}
        saveToServer={saveToServer}
        loadFromServer={loadFromServer}
        serverStatus={serverStatus}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
     
     <div className="App-board" ref={boardRef} onDoubleClick={onBoardDoubleClick}>
        {notes
          .slice()
          .sort((a, b) => (a.z || 0) - (b.z || 0))
          .map((n) => (
            <Note
              key={n.id}
              data={n}
              onChange={(patch) => updateNote(n.id, patch)}
              onDragEnd={(clientRect, dropped) => handleDragEndCheckTrash(n.id, clientRect, dropped)}
              bringToFront={() => bringToFront(n.id)}
              trashRect={trashRect}
            />
          ))}

        <div className="App-trash-root" ref={trashRef}>
          <Trash />
        </div>
      </div>
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
}

export default App;

function rectsIntersect(a: DOMRect, b: DOMRect) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
