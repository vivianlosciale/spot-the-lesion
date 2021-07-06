interface AdventureEdition {
  //level 0 to 1, 1 meaning the end of the story
  level: number,
  AI: boolean,
  difficulty: Difficulty,
  pointRequirement: number,
  mascot?: MascotExplanation
}

interface MascotExplanation {
  slide: number,
  explanation: ExplanationItem[];
}