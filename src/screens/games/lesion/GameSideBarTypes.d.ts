interface GameSideBarProps {
  gameMode: GameMode;
  gameStarted: boolean;
  gameEnded: boolean;
  roundEnded: boolean;
  roundLoading: boolean;
  showAi: boolean;
  winLevel: boolean;
  showIncrement: boolean;
  onStartRound: () => void;
  onSubmitClick: () => void;
  onShareClick: () => void;
  onChallenge: () => void;
  onLevelFinished: () => void;
  playerScore: { total: number; round: number };
  aiScore: { total: number; round: number };
}
