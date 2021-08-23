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

interface GameModeLevel extends Requirements{
  typeLevel: typeLevel,
}

interface Solo {
  typeScore: typeScore,
}

type typeLevel = Solo | "ai";

type typeScore = "fastest" | "set";


interface Requirements {
  levelRequirement: number,
  requirementToStar1:number,
  requirementToStar2:number,
  requirementToStar3:number,
}