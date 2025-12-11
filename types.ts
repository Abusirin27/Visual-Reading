
export interface FontOption {
  name: string;
  family: string;
  isQuranic?: boolean;
}

export type ReadingMode = 
  | 'typewriter' 
  | 'rsvp' 
  | 'highlight'
  | 'spotlight'  
  | 'magnify'    
  | 'scroller'   
  | 'karaoke'
  | 'bounce'
  | 'pulse'
  // Existing Experimental
  | 'blur'
  | 'wavy'
  | 'glitch'
  | 'gradient'
  | 'outline'
  // New Modes
  | 'neon'
  | 'mirror'
  | 'spread'
  | 'flash'
  | 'dim'
  // Latest Standard Additions
  | 'boxed'
  | 'underline'
  | 'marker'
  | 'thick'
  // Latest Creative Addition
  | 'shake'
  // Newest Replacements
  | 'jelly'
  | 'swing'
  | 'slideDown';

export type Language = 'ar' | 'en';
export type PomodoroMode = 'focus' | 'short' | 'long' | 'custom';

export interface ShortcutMap {
  togglePlay: string;
  prevWord: string;
  nextWord: string;
  incFontSize: string;
  decFontSize: string;
  incSpeed: string;
  decSpeed: string;
  toggleFullscreenApp: string;
  toggleFullscreenReader: string;
  incBrightness: string;
  decBrightness: string;
  reset: string;
  nextFont: string;
  nextColor: string;
  incGlow: string;
  decGlow: string;
  toggleBold: string;
  toggleLang: string;
  nextMode: string;
  toggleEdit: string;
  clearText: string;
  togglePomodoro: string;
  toggleLibrary: string;
  toggleShortcuts: string;
  toggleStats: string;
}

export interface ReaderSettings {
  wpm: number;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  textAlign: 'right' | 'left' | 'center' | 'justify';
  readingMode: ReadingMode;
  brightness: number;
  textColor: string;
  highlightColor: string;
  backgroundColor: string;
  glowIntensity: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In a real app, never store plain passwords
  createdAt: number;
}

export interface ReadingSession {
  id: string;
  date: number;
  duration: number; // seconds
  wordsRead: number;
  wpm: number;
}