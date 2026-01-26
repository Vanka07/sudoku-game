import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number; // 0 means empty
  isGiven: boolean; // Original puzzle clue
  notes: number[]; // Pencil marks
  isError: boolean;
  isHighlighted: boolean;
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
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  clearCell: () => void;
  toggleNoteMode: () => void;
  useHint: () => void;
  undo: () => void;
  startNewGame: (difficulty: Difficulty) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateTime: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  loadStats: () => Promise<void>;
  saveStats: () => Promise<void>;
}

// Sudoku puzzle generator
function generateSudoku(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  // Generate a solved board
  const solution = generateSolvedBoard();

  // Remove numbers based on difficulty
  const cellsToRemove: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 52,
    expert: 58,
  };

  const puzzle = solution.map(row => [...row]);
  const toRemove = cellsToRemove[difficulty];

  let removed = 0;
  while (removed < toRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return { puzzle, solution };
}

function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  // Fill diagonal boxes first (they don't affect each other)
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }

  // Solve the rest
  solveSudoku(board);

  return board;
}

function fillBox(board: number[][], startRow: number, startCol: number): void {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[startRow + i][startCol + j] = nums[idx++];
    }
  }
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
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

function createEmptyBoard(): Cell[][] {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      notes: [],
      isError: false,
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
      isHighlighted: false,
    }))
  );
}

const STORAGE_KEY = 'sudoku_stats';

const initialStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: { easy: null, medium: null, hard: null, expert: null } as Record<Difficulty, number | null>,
  currentStreak: 0,
  bestStreak: 0,
};

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

  selectCell: (row, col) => {
    const { board, isPlaying, isPaused } = get();
    if (!isPlaying || isPaused) return;

    // Update highlighting
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

    set({ selectedCell: { row, col }, board: newBoard });
  },

  enterNumber: (num) => {
    const { selectedCell, board, solution, noteMode, mistakes, maxMistakes, isPlaying, isPaused, history } = get();
    if (!selectedCell || !isPlaying || isPaused) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isGiven) return;

    // Save current state to history before making changes
    const boardCopy = board.map(r => r.map(c => ({ ...c, notes: [...c.notes] })));
    const newHistory = [...history, { board: boardCopy, mistakes }].slice(-20); // Keep last 20 moves

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (noteMode) {
      // Toggle note
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
      // Enter number
      newBoard[row][col].value = num;
      newBoard[row][col].notes = [];

      // Check if correct
      if (num !== solution[row][col]) {
        newBoard[row][col].isError = true;
        const newMistakes = mistakes + 1;

        if (newMistakes >= maxMistakes) {
          // Game over
          set({ board: newBoard, mistakes: newMistakes, isPlaying: false, isComplete: true, history: newHistory });
          return;
        }

        set({ board: newBoard, mistakes: newMistakes, history: newHistory });
        return;
      } else {
        newBoard[row][col].isError = false;

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
        const { stats, difficulty, elapsedTime } = get();
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

        set({ board: newBoard, isComplete: true, isPlaying: false, stats: newStats, history: newHistory });
        get().saveStats();
        return;
      }
    }

    set({ board: newBoard, history: newHistory });
  },

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
  },

  toggleNoteMode: () => {
    set(state => ({ noteMode: !state.noteMode }));
  },

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

    // Check completion
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
  },

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
    });
  },

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

  undo: () => {
    const { history, isPlaying, isPaused } = get();
    if (!isPlaying || isPaused || history.length === 0) return;

    const lastState = history[history.length - 1];
    set({
      board: lastState.board,
      mistakes: lastState.mistakes,
      history: history.slice(0, -1),
    });
  },

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
}));

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#4ADE80' },
  medium: { label: 'Medium', color: '#60A5FA' },
  hard: { label: 'Hard', color: '#F59E0B' },
  expert: { label: 'Expert', color: '#EF4444' },
};
