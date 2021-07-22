import doctor from "../../../res/images/explanation/doctor.png";
import recipe from "../../../res/images/lesion/recipe.jpg";
import lovelace from "../../../res/images/lesion/Adalovelace.jpg";
import khwarizmi from "../../../res/images/lesion/AlKhwarizmi.jpg";
import hopper from "../../../res/images/lesion/Hopper.jpg";
import turing from "../../../res/images/lesion/Turing.jpg";
import tri1 from "../../../res/images/lesion/tri1.jpg";
import tri2 from "../../../res/images/lesion/tri2.jpg";
import tri3 from "../../../res/images/lesion/tri3.jpg";
import tri4 from "../../../res/images/lesion/tri4.jpg";
import tri5 from "../../../res/images/lesion/tri5.jpg";

const LesionAdventure: AdventureEdition[] = [
  {
    difficulty: "easy",
    gameMode: {
      typeLevel: {
        typeScore: "fastest",
      },
      levelRequirement: 1,
      requirementToStar1: 5,
      requirementToStar2: 3,
      requirementToStar3: 1,
    },
    numberOfRound: 7,
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
        {
          text: "Test1-3",
        },
      ],
    },
  },
  {
    difficulty: "hard",
    numberOfRound: 7,
    gameMode: {
      typeLevel: {
        typeScore: "fastest",
      },
      levelRequirement: 1,
      requirementToStar1: 5,
      requirementToStar2: 3,
      requirementToStar3: 1,
    },
  },
  {
    difficulty: "easy",
    numberOfRound: 10,
    gameMode: {
      typeLevel: {
        typeScore: "set",
      },
      levelRequirement: 3,
      requirementToStar1: 5,
      requirementToStar2: 7,
      requirementToStar3: 9,
    },
    mascot: {
      slide: 1,
      explanation: [
        {
          text: "Test2-1",
        },
        {
          text: "Test2-2",
          imageSrc: khwarizmi,
        },
        {
          text: "Test2-3",
          imageSrc: turing,
        },
        {
          text: "Test2-4",
          imageSrc: lovelace,
        },
        {
          text: "Test2-5",
          imageSrc: hopper,
        },
        {
          text: "Test2-6",
        },
        {
          text: "Test2-7",
        },
        {
          text: "Test2-8",
          imageSrc: recipe,
        },
      ],
    },
  },
  {
    difficulty: "hard",
    numberOfRound: 10,
    gameMode: {
      typeLevel: {
        typeScore: "set",
      },
      levelRequirement: 3,
      requirementToStar1: 5,
      requirementToStar2: 7,
      requirementToStar3: 9,
    },
  },
  {
    difficulty: "easy",
    numberOfRound: 5,
    gameMode: {
      typeLevel: "ai",
      levelRequirement: 0.3,
      requirementToStar1: 0.5,
      requirementToStar2: 0.7,
      requirementToStar3: 0.9,
    },
    mascot: {
      slide: 2,
      explanation: [
        {
          text: "Test3-1",
        },
        {
          text: "Test3-2",
          imageSrc: tri1,
        },
        {
          text: "Test3-3",
          imageSrc: tri2,
        },
        {
          text: "Test3-4",
          imageSrc: tri3,
        },
        {
          text: "Test3-5",
          imageSrc: tri4,
        },
        {
          text: "Test3-6",
          imageSrc: tri5,
        },
        {
          text: "Test3-7",
        },
        {
          text: "Test3-8",
        },
      ],
    },
  },
  {
    difficulty: "hard",
    numberOfRound: 5,
    gameMode: {
      typeLevel: "ai",
      levelRequirement: 0.3,
      requirementToStar1: 0.5,
      requirementToStar2: 0.7,
      requirementToStar3: 0.9,
    },
  },
];

export default LesionAdventure;
