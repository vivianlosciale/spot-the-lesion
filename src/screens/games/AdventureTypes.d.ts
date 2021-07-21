interface AdventureEdition {
  level: number,
  gameMode: GameModeLevel,
  difficulty: Difficulty,
  mascot?: MascotExplanation,
  roundsNb: number,
}

interface MascotExplanation {
  slide: number,
  explanation: ExplanationItem[],
}

interface GameModeLevel {
  mode: Mode,
  levelRequirement: number,
  requirementToStar1:number,
  requirementToStar2:number,
  requirementToStar3:number,
}

type Mode = "solo" | "ai"