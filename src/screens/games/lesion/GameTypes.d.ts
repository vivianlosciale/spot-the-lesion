interface GameProps {
  gameMode: GameMode;
  difficult: Difficulty;
  challengeFileIds?: number[];
}

type GameMode = "casual" | "competitive" | "adventure";

type Difficulty = "easy" | "medium" | "hard";
