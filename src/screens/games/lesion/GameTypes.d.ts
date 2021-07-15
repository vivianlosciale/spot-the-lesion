interface GameProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  challengeFileIds?: number[];
}

type GameMode = "casual" | "competitive" | "adventure";

type Difficulty = "easy" | "medium" | "hard";
