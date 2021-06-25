import doctor from "../../res/images/tutorial/doctor.png";
import lesion from "../../res/images/tutorial/lesion.png";

const explanationLesionItems: ExplanationItem[] = [
  {
    text: "Lesion1",
    imageSrc: doctor,
  },
  {
    text: "Lesion2",
    imageSrc: doctor,
  },
];

const explanationIAItems: ExplanationItem[] = [
  {
    text: "IA1",
    imageSrc: lesion,
  },
  {
    text: "IA2",
  },
];

export { explanationLesionItems, explanationIAItems };
