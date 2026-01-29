import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number; // 0 means empty
  isGiven: boolean; // Original puzzle clue
  notes: number[]; // Pencil marks
  isError: boolean;
  isCorrect: boolean; // User entered correct number
  isHighlighted: boolean;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  completed: boolean;
  bestTime: number | null;
  streak: number;
  lastCompletedDate: string | null;
}

export interface GameState {
  board: Cell[][];
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  mistakes: number;
  maxMistakes: number;
  hintsRemaining: number;
  elapsedTime: number;
  noteMode: boolean;
  isDailyChallenge: boolean;
  dailyChallenge: DailyChallenge;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    bestTime: Record<Difficulty, number | null>;
    currentStreak: number;
    bestStreak: number;
  };
}

interface HistoryEntry {
  board: Cell[][];
  mistakes: number;
}

interface SudokuStore extends GameState {
  history: HistoryEntry[];
  lastCorrectValue: number; // triggers matching-number highlight pulse
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  clearCell: () => void;
  toggleNoteMode: () => void;
  useHint: () => void;
  undo: () => void;
  startNewGame: (difficulty: Difficulty) => void;
  startDailyChallenge: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateTime: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  loadStats: () => Promise<void>;
  saveStats: () => Promise<void>;
  loadDailyChallenge: () => Promise<void>;
  saveDailyChallenge: () => Promise<void>;
  saveGameState: () => Promise<void>;
  loadGameState: () => Promise<boolean>;
}

// ─── Game state persistence ───────────────────────────────────────────────────
const GAME_STATE_STORAGE_KEY = 'sudoku_game_state';

// ─── Seeded RNG for daily puzzles ─────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDayNumber(): number {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function seededShuffle<T>(array: T[], random: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Sudoku solver / validator ────────────────────────────────────────────────

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
}

/**
 * Count solutions of a puzzle, stopping as soon as `limit` is reached.
 * Returns the count (capped at `limit`).
 */
function countSolutions(board: number[][], limit: number): number {
  let count = 0;

  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve()) return true; // early exit when limit hit
              board[row][col] = 0;
            }
          }
          return false; // no valid number → backtrack
        }
      }
    }
    // Reached a complete solution
    count++;
    return count >= limit; // stop searching when we hit the limit
  }

  solve();
  return count;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function solveSeededSudoku(board: number[][], random: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSeededSudoku(board, random)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// ─── Board generation ─────────────────────────────────────────────────────────

function fillBox(board: number[][], startRow: number, startCol: number): void {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[startRow + i][startCol + j] = nums[idx++];
    }
  }
}

function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  solveSudoku(board);
  return board;
}

/**
 * Generate a puzzle with a guaranteed unique solution.
 * After randomly removing cells, we verify uniqueness via countSolutions.
 * If removing a cell creates multiple solutions, we restore it and try another.
 */
function generateSudoku(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]);

  const cellsToRemove: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 52,
    expert: 58,
  };

  const toRemove = cellsToRemove[difficulty];
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  for (const pos of positions) {
    if (removed >= toRemove) break;
    if (puzzle[pos.row][pos.col] === 0) continue;

    const backup = puzzle[pos.row][pos.col];
    puzzle[pos.row][pos.col] = 0;

    // Verify the puzzle still has a unique solution
    const check = puzzle.map(r => [...r]);
    const solutions = countSolutions(check, 2);
    if (solutions !== 1) {
      // Not unique — restore and skip this cell
      puzzle[pos.row][pos.col] = backup;
    } else {
      removed++;
    }
  }

  return { puzzle, solution };
}

function generateSeededSudoku(difficulty: Difficulty, random: () => number): { puzzle: number[][]; solution: number[][] } {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  for (let box = 0; box < 9; box += 3) {
    const nums = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
    let idx = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[box + i][box + j] = nums[idx++];
      }
    }
  }

  solveSeededSudoku(board, random);
  const solution = board.map(row => [...row]);

  const cellsToRemove: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 52,
    expert: 58,
  };

  const puzzle = solution.map(row => [...row]);
  const positions = seededShuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 })),
    random
  );

  let removed = 0;
  for (const pos of positions) {
    if (removed >= cellsToRemove[difficulty]) break;
    if (puzzle[pos.row][pos.col] === 0) continue;

    const backup = puzzle[pos.row][pos.col];
    puzzle[pos.row][pos.col] = 0;

    const check = puzzle.map(r => [...r]);
    const solutions = countSolutions(check, 2);
    if (solutions !== 1) {
      puzzle[pos.row][pos.col] = backup;
    } else {
      removed++;
    }
  }

  return { puzzle, solution };
}

// ─── Board helpers ────────────────────────────────────────────────────────────

function createEmptyBoard(): Cell[][] {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      notes: [],
      isError: false,
      isCorrect: false,
      isHighlighted: false,
    }))
  );
}

function initializeBoardFromPuzzle(puzzle: number[][]): Cell[][] {
  return puzzle.map(row =>
    row.map(value => ({
      value,
      isGiven: value !== 0,
      notes: [],
      isError: false,
      isCorrect: false,
      isHighlighted: false,
    }))
  );
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sudoku_stats';
const DAILY_STORAGE_KEY = 'sudoku_daily';

const initialStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: { easy: null, medium: null, hard: null, expert: null } as Record<Difficulty, number | null>,
  currentStreak: 0,
  bestStreak: 0,
};

const initialDailyChallenge: DailyChallenge = {
  date: getTodayString(),
  completed: false,
  bestTime: null,
  streak: 0,
  lastCompletedDate: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSudokuStore = create<SudokuStore>((set, get) => ({
  board: createEmptyBoard(),
  solution: [],
  selectedCell: null,
  difficulty: 'medium',
  isPlaying: false,
  isPaused: false,
  isComplete: false,
  mistakes: 0,
  maxMistakes: 3,
  hintsRemaining: 3,
  elapsedTime: 0,
  noteMode: false,
  stats: initialStats,
  history: [] as HistoryEntry[],
  lastCorrectValue: 0,
  isDailyChallenge: false,
  dailyChallenge: initialDailyChallenge,

  // ── Game state persistence ──────────────────────────────────────────────

  saveGameState: async () => {
    try {
      const state = get();
      const persistable = {
        board: state.board,
        solution: state.solution,
        selectedCell: state.selectedCell,
        difficulty: state.difficulty,
        mistakes: state.mistakes,
        hintsRemaining: state.hintsRemaining,
        elapsedTime: state.elapsedTime,
        noteMode: state.noteMode,
        isDailyChallenge: state.isDailyChallenge,
        isPlaying: state.isPlaying,
        isComplete: state.isComplete,
      };
      await AsyncStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(persistable));
    } catch (e) {
      console.log('Failed to save game state:', e);
    }
  },

  loadGameState: async () => {
    try {
      const data = await AsyncStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (data) {
        const saved = JSON.parse(data);
        if (saved.board && saved.solution && saved.isPlaying && !saved.isComplete) {
          set({
            board: saved.board,
            solution: saved.solution,
            selectedCell: saved.selectedCell ?? null,
            difficulty: saved.difficulty ?? 'medium',
            mistakes: saved.mistakes ?? 0,
            hintsRemaining: saved.hintsRemaining ?? 3,
            elapsedTime: saved.elapsedTime ?? 0,
            noteMode: saved.noteMode ?? false,
            isDailyChallenge: saved.isDailyChallenge ?? false,
            isPlaying: true,
            isPaused: true, // Resume paused so the player sees the board first
            isComplete: false,
            history: [],
          });
          return true;
        }
      }
    } catch (e) {
      console.log('Failed to load game state:', e);
    }
    return false;
  },

  // ── Cell selection ──────────────────────────────────────────────────────

  selectCell: (row, col) => {
    const { board, isPlaying, isPaused } = get();
    if (!isPlaying || isPaused) return;

    const newBoard = board.map((r, ri) =>
      r.map((cell, ci) => ({
        ...cell,
        isHighlighted:
          ri === row ||
          ci === col ||
          (Math.floor(ri / 3) === Math.floor(row / 3) &&
            Math.floor(ci / 3) === Math.floor(col / 3)),
      }))
    );

    set({ selectedCell: { row, col }, board: newBoard, lastCorrectValue: 0 });
  },

  // ── Number entry ────────────────────────────────────────────────────────

  enterNumber: (num) => {
    const { selectedCell, board, solution, noteMode, mistakes, maxMistakes, isPlaying, isPaused, history } = get();
    if (!selectedCell || !isPlaying || isPaused) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isGiven) return;

    // Save current state to history before making changes
    const boardCopy = board.map(r => r.map(c => ({ ...c, notes: [...c.notes] })));
    const newHistory = [...history, { board: boardCopy, mistakes }].slice(-20);

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (noteMode) {
      const notes = [...cell.notes];
      const idx = notes.indexOf(num);
      if (idx >= 0) {
        notes.splice(idx, 1);
      } else {
        notes.push(num);
        notes.sort();
      }
      newBoard[row][col].notes = notes;
      newBoard[row][col].value = 0;
    } else {
      newBoard[row][col].value = num;
      newBoard[row][col].notes = [];

      if (num !== solution[row][col]) {
        newBoard[row][col].isError = true;
        newBoard[row][col].isCorrect = false;
        const newMistakes = mistakes + 1;

        if (newMistakes >= maxMistakes) {
          set({ board: newBoard, mistakes: newMistakes, isPlaying: false, isComplete: true, history: newHistory });
          get().saveGameState();
          return;
        }

        set({ board: newBoard, mistakes: newMistakes, history: newHistory });
        get().saveGameState();
        return;
      } else {
        newBoard[row][col].isError = false;
        newBoard[row][col].isCorrect = true;

        // Trigger matching-number highlight pulse
        set({ lastCorrectValue: num });

        // Remove this number from notes in same row/col/box
        for (let i = 0; i < 9; i++) {
          newBoard[row][i].notes = newBoard[row][i].notes.filter(n => n !== num);
          newBoard[i][col].notes = newBoard[i][col].notes.filter(n => n !== num);
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            newBoard[boxRow + i][boxCol + j].notes = newBoard[boxRow + i][boxCol + j].notes.filter(n => n !== num);
          }
        }
      }

      // Check if puzzle complete
      let complete = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c].value !== solution[r][c]) {
            complete = false;
            break;
          }
        }
        if (!complete) break;
      }

      if (complete) {
        const { stats, difficulty, elapsedTime, isDailyChallenge, dailyChallenge } = get();
        const newStats = { ...stats };
        newStats.gamesPlayed++;
        newStats.gamesWon++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.bestStreak) {
          newStats.bestStreak = newStats.currentStreak;
        }
        if (!newStats.bestTime[difficulty] || elapsedTime < newStats.bestTime[difficulty]!) {
          newStats.bestTime[difficulty] = elapsedTime;
        }

        if (isDailyChallenge && !dailyChallenge.completed) {
          const today = getTodayString();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

          const newStreak = dailyChallenge.lastCompletedDate === yesterdayStr
            ? dailyChallenge.streak + 1
            : 1;

          const newDailyChallenge: DailyChallenge = {
            date: today,
            completed: true,
            bestTime: elapsedTime,
            streak: newStreak,
            lastCompletedDate: today,
          };

          set({
            board: newBoard,
            isComplete: true,
            isPlaying: false,
            stats: newStats,
            history: newHistory,
            dailyChallenge: newDailyChallenge,
          });
          get().saveStats();
          get().saveDailyChallenge();
          get().saveGameState();
          return;
        }

        set({ board: newBoard, isComplete: true, isPlaying: false, stats: newStats, history: newHistory });
        get().saveStats();
        get().saveGameState();
        return;
      }
    }

    set({ board: newBoard, history: newHistory });
    get().saveGameState();
  },

  // ── Clear / erase ──────────────────────────────────────────────────────

  clearCell: () => {
    const { selectedCell, board, isPlaying, isPaused } = get();
    if (!selectedCell || !isPlaying || isPaused) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isGiven) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].value = 0;
    newBoard[row][col].notes = [];
    newBoard[row][col].isError = false;

    set({ board: newBoard });
    get().saveGameState();
  },

  toggleNoteMode: () => {
    set(state => ({ noteMode: !state.noteMode }));
  },

  // ── Hint ────────────────────────────────────────────────────────────────

  useHint: () => {
    const { selectedCell, board, solution, hintsRemaining, isPlaying, isPaused } = get();
    if (!selectedCell || hintsRemaining <= 0 || !isPlaying || isPaused) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isGiven || cell.value === solution[row][col]) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].value = solution[row][col];
    newBoard[row][col].notes = [];
    newBoard[row][col].isError = false;

    let complete = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value !== solution[r][c]) {
          complete = false;
          break;
        }
      }
      if (!complete) break;
    }

    set({
      board: newBoard,
      hintsRemaining: hintsRemaining - 1,
      isComplete: complete,
      isPlaying: !complete,
    });
    get().saveGameState();
  },

  // ── Undo ────────────────────────────────────────────────────────────────

  undo: () => {
    const { history, isPlaying, isPaused } = get();
    if (!isPlaying || isPaused || history.length === 0) return;

    const lastState = history[history.length - 1];
    set({
      board: lastState.board,
      mistakes: lastState.mistakes,
      history: history.slice(0, -1),
    });
    get().saveGameState();
  },

  // ── New game ────────────────────────────────────────────────────────────

  startNewGame: (difficulty) => {
    const { puzzle, solution } = generateSudoku(difficulty);
    const board = initializeBoardFromPuzzle(puzzle);

    set({
      board,
      solution,
      selectedCell: null,
      difficulty,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      mistakes: 0,
      hintsRemaining: 3,
      elapsedTime: 0,
      noteMode: false,
      history: [],
      isDailyChallenge: false,
    });
    get().saveGameState();
  },

  startDailyChallenge: () => {
    const dayNum = getDayNumber();
    const random = seededRandom(dayNum * 12345);

    const { puzzle, solution } = generateSeededSudoku('medium', random);
    const board = initializeBoardFromPuzzle(puzzle);

    set({
      board,
      solution,
      selectedCell: null,
      difficulty: 'medium',
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      mistakes: 0,
      hintsRemaining: 3,
      elapsedTime: 0,
      noteMode: false,
      history: [],
      isDailyChallenge: true,
    });
    get().saveGameState();
  },

  // ── Pause / resume / timer ──────────────────────────────────────────────

  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  updateTime: () => {
    set(state => ({ elapsedTime: state.elapsedTime + 1 }));
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  // ── Stats persistence ───────────────────────────────────────────────────

  loadStats: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ stats: JSON.parse(data) });
      }
    } catch (e) {
      console.log('Failed to load stats:', e);
    }
  },

  saveStats: async () => {
    try {
      const { stats } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.log('Failed to save stats:', e);
    }
  },

  // ── Daily challenge persistence ─────────────────────────────────────────

  loadDailyChallenge: async () => {
    try {
      const data = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
      if (data) {
        const saved = JSON.parse(data) as DailyChallenge;
        const today = getTodayString();

        if (saved.lastCompletedDate) {
          const lastDate = new Date(saved.lastCompletedDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            set({
              dailyChallenge: {
                ...initialDailyChallenge,
                date: today,
                streak: 0,
              }
            });
          } else if (saved.date === today) {
            set({ dailyChallenge: saved });
          } else {
            set({
              dailyChallenge: {
                ...saved,
                date: today,
                completed: false,
                bestTime: null,
              }
            });
          }
        } else {
          set({ dailyChallenge: { ...initialDailyChallenge, date: today } });
        }
      }
    } catch (e) {
      console.log('Failed to load daily challenge:', e);
    }
  },

  saveDailyChallenge: async () => {
    try {
      const { dailyChallenge } = get();
      await AsyncStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyChallenge));
    } catch (e) {
      console.log('Failed to save daily challenge:', e);
    }
  },
}));

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#4ADE80' },
  medium: { label: 'Medium', color: '#60A5FA' },
  hard: { label: 'Hard', color: '#F59E0B' },
  expert: { label: 'Expert', color: '#EF4444' },
};
