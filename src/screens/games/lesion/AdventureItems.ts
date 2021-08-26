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
import tri6 from "../../../res/images/lesion/6Tri.png";
import lesion from "../../../res/images/lesion/startScreen.png";
import lesionfound from "../../../res/images/lesion/actualLesion.png";

const LesionIndication = {
  fastest: "textFastest",
  ai: "textAi",
  set: "textSet",
};

const LesionAdventure: AdventureEdition[] = [
  {
    difficulty: "easy",
    gameMode: {
      typeLevel: "fastest",
      levelRequirement: 1,
      requirementToStar1: 5,
      requirementToStar2: 3,
      requirementToStar3: 1,
    },
    numberOfRound: 7,
    mascot: {
      theme: 0,
      slide: 1,
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
        {
          text: "Test1-4",
          imageSrc: lesion,
        },
        {
          text: "Test1-5",
          imageSrc: lesionfound,
        },
      ],
    },
  },
  {
    difficulty: "medium",
    numberOfRound: 7,
    gameMode: {
      typeLevel: "fastest",
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
      typeLevel: "set",
      levelRequirement: 3,
      requirementToStar1: 5,
      requirementToStar2: 7,
      requirementToStar3: 9,
    },
    mascot: {
      theme: 0,
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
    difficulty: "medium",
    numberOfRound: 10,
    gameMode: {
      typeLevel: "set",
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
      theme: 2,
      slide: 0,
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
          imageSrc: tri6,
        },
        {
          text: "Test3-9",
        },
      ],
    },
  },
  {
    difficulty: "medium",
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

export { LesionAdventure, LesionIndication };
