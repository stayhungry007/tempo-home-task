import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App behaviors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('bring note to front updates z-index', async () => {
    render(<App />);

    const createBtn = screen.getByText('Create Note');
    // create two notes
    fireEvent.click(createBtn);
    fireEvent.click(createBtn);

    // find note elements
    const n1Title = await screen.findByText('Note #1');
    const n2Title = await screen.findByText('Note #2');
    const n1 = n1Title.closest('.note') as HTMLElement;
    const n2 = n2Title.closest('.note') as HTMLElement;
    expect(n1).toBeTruthy();
    expect(n2).toBeTruthy();

    const z1Before = Number(n1.style.zIndex || 0);
    const z2Before = Number(n2.style.zIndex || 0);
    expect(z2Before).toBeGreaterThanOrEqual(z1Before);

    // bring first to front by mousedown
    fireEvent.mouseDown(n1);

    await waitFor(() => {
      const z1After = Number(n1.style.zIndex || 0);
      const z2After = Number(n2.style.zIndex || 0);
      expect(z1After).toBeGreaterThan(z2After);
    });
  });

  test('dragging a note over trash removes it', async () => {
    // mock getBoundingClientRect to simulate trash and note positions
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      const el = this as HTMLElement;
      if (el.classList.contains('trash')) {
        return {
          x: 300,
          y: 300,
          left: 300,
          top: 300,
          right: 380,
          bottom: 380,
          width: 80,
          height: 80,
          toJSON() {}
        } as DOMRect;
      }
      // notes will return a rect that is inside the trash when moved
      if (el.classList.contains('note')) {
        return {
          x: 310,
          y: 310,
          left: 310,
          top: 310,
          right: 330,
          bottom: 330,
          width: 20,
          height: 20,
          toJSON() {}
        } as DOMRect;
      }
      // default
      return original.call(this);
    };

    try {
      render(<App />);
      const createBtn = screen.getByText('Create Note');
      fireEvent.click(createBtn);

      const n1Title = await screen.findByText('Note #1');
      const note = n1Title.closest('.note') as HTMLElement;
      expect(note).toBeTruthy();

      // start dragging via header pointerdown
      const header = note.querySelector('.note-header') as HTMLElement;
      fireEvent.pointerDown(header, { pointerId: 1, clientX: 10, clientY: 10 });
      // simulate move
      fireEvent.pointerMove(window, { pointerId: 1, clientX: 320, clientY: 320 });
      // release
      fireEvent.pointerUp(window, { pointerId: 1, clientX: 320, clientY: 320 });

      // note should be removed
      await waitFor(() => {
        expect(screen.queryByText('Note #1')).toBeNull();
      });
    } finally {
      // restore
      Element.prototype.getBoundingClientRect = original;
    }
  });
});
