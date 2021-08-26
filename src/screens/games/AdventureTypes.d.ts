interface AdventureEdition {
  gameMode: GameModeLevel,
  difficulty: Difficulty,
  mascot?: MascotExplanation,
  numberOfRound: number,
}

interface MascotExplanation {
  theme: number,
  slide: number,
  explanation: TextItem[],
}

type typeLevel = "fastest" | "set" | "ai";

interface GameModeLevel {
  typeLevel: typeLevel,
  levelRequirement: number,
  requirementToStar1:number,
  requirementToStar2:number,
  requirementToStar3:number,
}