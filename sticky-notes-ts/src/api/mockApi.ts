// Simple mock API that simulates async REST calls for notes
import { NoteData } from '../components/Note';

const SERVER_KEY = 'mock-server:notes:v1';

export async function saveNotesToServer(notes: NoteData[]): Promise<void> {
  // simulate network latency and server processing
  await delay(500 + Math.random() * 600);
  // store in localStorage to simulate server-side persistence
  localStorage.setItem(SERVER_KEY, JSON.stringify(notes));
}

export async function loadNotesFromServer(): Promise<NoteData[]> {
  await delay(400 + Math.random() * 800);
  const raw = localStorage.getItem(SERVER_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as NoteData[];
  } catch {
    return [];
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
