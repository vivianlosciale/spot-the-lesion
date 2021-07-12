import question from "../../res/images/achievements/block.png";
import firstCorrect from "../../res/images/achievements/tick.png";
import firstCorrectWithoutHint from "../../res/images/achievements/investigation.png";
import firstCasualWin from "../../res/images/achievements/medal.png";
import firstCompetitiveWin from "../../res/images/achievements/trophy.png";
import fiveCorrectAnswers from "../../res/images/achievements/5.png";
import competitivePoints from "../../res/images/achievements/summit.png";
import allCorrectCompetitive from "../../res/images/achievements/brainstorm.png";
import fastAnswer from "../../res/images/achievements/flash.png";
import slowAnswer from "../../res/images/achievements/timer.png";
import correctAnswers from "../../res/images/achievements/confetti.png";

/* Placeholder for not yet unlocked achievements */
const lockedAchievement: AchievementItem = {
  key: "",
  title: "Title13",
  description: "Description13",
  image: question,
};

const achievementItems: AchievementItem[] = [
  {
    key: "firstCorrect",
    title: "Title1",
    description: "Description1",
    image: firstCorrect,
  },
  {
    key: "firstCorrectWithoutHint",
    title: "Title2",
    description: "Description2",
    image: firstCorrectWithoutHint,
  },
  {
    key: "firstCasualWin",
    title: "Title3",
    description: "Description3",
    image: firstCasualWin,
  },
  {
    key: "firstCompetitiveWin",
    title: "Title4",
    description: "Description4",
    image: firstCompetitiveWin,
  },
  {
    key: "fiveCorrectSameRunCasual",
    title: "Title5",
    description: "Description5",
    image: fiveCorrectAnswers,
  },
  {
    key: "fiveCorrectSameRunCompetitive",
    title: "Title6",
    description: "Description6",
    image: fiveCorrectAnswers,
  },
  {
    key: "competitivePointsRun",
    title: "Title7",
    description: "Description7",
    image: competitivePoints,
  },
  {
    key: "allCorrectCompetitive",
    title: "Title8",
    description: "Description8",
    image: allCorrectCompetitive,
  },
  {
    key: "fastAnswer",
    title: "Title9",
    description: "Description9",
    image: fastAnswer,
  },
  {
    key: "slowAnswer",
    title: "Title10",
    description: "Description10",
    image: slowAnswer,
  },
  {
    key: "twentyCorrectSameRunCasual",
    title: "Title11",
    description: "Description11",
    image: correctAnswers,
  },
  {
    key: "fiftyCorrectSameRunCasual",
    title: "Title12",
    description: "50 correct answers? You really put the spot in spot-the-lesion!",
    image: correctAnswers,
  },
];

export { lockedAchievement, achievementItems };
