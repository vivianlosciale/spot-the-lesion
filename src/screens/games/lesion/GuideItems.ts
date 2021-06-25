import doctor from "../../../res/images/tutorial/doctor.png";

const LesionGuide: GuideItem[] = [
  {
    progression: 0,
    slide: 0,
    explication: [
      {
        text: "Test1-1",
      },
      {
        text: "Test1-2",
        imageSrc: doctor,
      },
    ],
  },
  {
    progression: 1 / 3,
    slide: 1,
    explication: [
      {
        text: "Test2-1",
      },
      {
        text: "Test2-2",
        imageSrc: doctor,
      },
    ],
  },
];

export default LesionGuide;
