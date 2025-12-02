import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Edit and rename flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('editing note content updates the note', async () => {
    render(<App />);
    const createBtn = screen.getByText('Create Note');
    fireEvent.click(createBtn);

    const body = await screen.findByRole('textbox', { hidden: true }).catch(() => null);
    // fallback: find .note-content inside the created note
    let contentEl: HTMLElement | null = null;
    if (body) contentEl = body as HTMLElement;
    else {
      const title = await screen.findByText('Note #1');
      const note = title.closest('.note') as HTMLElement;
      contentEl = note.querySelector('.note-content') as HTMLElement;
    }
    expect(contentEl).toBeTruthy();

    // simulate typing: set innerText then dispatch input and blur
    contentEl!.innerText = 'Hello world';
    fireEvent.input(contentEl!);
    fireEvent.blur(contentEl!);

    // After blur, content should persist in DOM
    await waitFor(() => {
      expect(contentEl!.innerText).toBe('Hello world');
    });

    // Also check localStorage persisted the content
    const raw = localStorage.getItem('sticky-notes-ts:v1');
    expect(raw).toBeTruthy();
    const notes = JSON.parse(raw || '[]');
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes[0].content).toContain('Hello world');
  });

  test('renaming header commits title on Enter and persists', async () => {
    render(<App />);
    const createBtn = screen.getByText('Create Note');
    fireEvent.click(createBtn);

    const titleEl = await screen.findByText('Note #1');
    // double click to edit
    fireEvent.doubleClick(titleEl);

    // input should appear
    const input = titleEl.closest('.note')!.querySelector('.note-title-input') as HTMLInputElement;
    expect(input).toBeTruthy();

    // change value and press Enter
    fireEvent.change(input, { target: { value: 'My Title' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // title should update in DOM
    await waitFor(() => expect(screen.getByText('My Title')).toBeInTheDocument());

    // persisted in localStorage
    const raw = localStorage.getItem('sticky-notes-ts:v1');
    expect(raw).toBeTruthy();
    const notes = JSON.parse(raw || '[]');
    expect(notes[0].title).toBe('My Title');
  });
});
