interface AdventureEdition {
  level: number,
  AI: boolean,
  difficulty: Difficulty,
  pointRequirement: number,
  mascot?: MascotExplanation,
  roundsNb: number
}

interface MascotExplanation {
  slide: number,
  explanation: ExplanationItem[];
}