import { Paper, mockPapers } from "./mockData";
export type { Paper };

const LIBRARY_STORAGE_KEY = "ai_copilot_library";
const NOTES_STORAGE_KEY_PREFIX = "ai_copilot_notes_";
const CHATS_STORAGE_KEY_PREFIX = "ai_copilot_chats_";
const API_KEY_STORAGE_KEY = "ai_copilot_api_key";
const REVIEWS_STORAGE_KEY = "ai_copilot_reviews";

export interface Note {
  id: string;
  paperId: string;
  text: string;
  pageNumber?: number;
  highlightedText?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  title: string;
  papersUsed: string[];
  markdown: string;
  createdAt: string;
}

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function getLibrary(): Paper[] {
  if (typeof window === "undefined") return mockPapers;
  const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(mockPapers));
    return mockPapers;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return mockPapers;
  }
}

export function saveLibrary(papers: Paper[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(papers));
}

export function addPaper(paper: Paper): void {
  const library = getLibrary();
  if (library.some(p => p.id === paper.id)) return;
  library.push(paper);
  saveLibrary(library);
}

export function updatePaper(updated: Paper): void {
  const library = getLibrary();
  const index = library.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    library[index] = updated;
    saveLibrary(library);
  }
}

export function deletePaper(id: string): void {
  const library = getLibrary().filter(p => p.id !== id);
  saveLibrary(library);
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${NOTES_STORAGE_KEY_PREFIX}${id}`);
    localStorage.removeItem(`${CHATS_STORAGE_KEY_PREFIX}${id}`);
  }
}

export function getNotes(paperId: string): Note[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${NOTES_STORAGE_KEY_PREFIX}${paperId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveNote(paperId: string, note: Note): void {
  const notes = getNotes(paperId);
  const existingIndex = notes.findIndex(n => n.id === note.id);
  if (existingIndex !== -1) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(`${NOTES_STORAGE_KEY_PREFIX}${paperId}`, JSON.stringify(notes));
  }
}

export function deleteNote(paperId: string, noteId: string): void {
  const notes = getNotes(paperId).filter(n => n.id !== noteId);
  if (typeof window !== "undefined") {
    localStorage.setItem(`${NOTES_STORAGE_KEY_PREFIX}${paperId}`, JSON.stringify(notes));
  }
}

export function getChats(paperId: string): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${CHATS_STORAGE_KEY_PREFIX}${paperId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveChats(paperId: string, messages: any[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${CHATS_STORAGE_KEY_PREFIX}${paperId}`, JSON.stringify(messages));
}

export function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveReview(review: Review): void {
  const reviews = getReviews();
  const existingIndex = reviews.findIndex(r => r.id === review.id);
  if (existingIndex !== -1) {
    reviews[existingIndex] = review;
  } else {
    reviews.push(review);
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
}

export function deleteReview(id: string): void {
  const reviews = getReviews().filter(r => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }
}
