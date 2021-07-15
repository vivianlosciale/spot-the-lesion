import doctor from "../../../res/images/explanation/doctor.png";

const LesionAdventure: AdventureEdition[] = [
  {
    level: 0,
    difficulty: "easy",
    AI: false,
    pointRequirement: 1,
    roundsNb: 5,
    mascot: {
      slide: 0,
      explanation: [
        {
          text: "Test1-1",
        },
        {
          text: "Test1-2",
          imageSrc: doctor,
        },
      ],
    },
  },
  {
    level: 1,
    AI: false,
    difficulty: "easy",
    pointRequirement: 2,
    roundsNb: 5,
    mascot: {
      slide: 1,
      explanation: [
        {
          text: "Test2-1",
        },
        {
          text: "Test2-2",
          imageSrc: doctor,
        },
      ],
    },
  },
  {
    level: 2,
    difficulty: "easy",
    AI: true,
    pointRequirement: 3,
    roundsNb: 5,
  },
];

export default LesionAdventure;
