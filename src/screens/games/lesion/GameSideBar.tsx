import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { ScoreWithIncrement, LoadingButton, HideFragment } from "../../../components";
import colors from "../../../res/colors";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      [theme.breakpoints.up("md")]: {
        flex: 1,
        height: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      },
    },
    card: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      alignContent: "center",
      margin: 8,
      padding: 8,
      [theme.breakpoints.down("sm")]: {
        width: "80vw",
        maxWidth: "60vh",
      },
      [theme.breakpoints.up("md")]: {
        minWidth: "20vw",
      },
    },
    scoresContainer: {
      width: "100%",
      display: "flex",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "row",
        justifyContent: "space-evenly",
      },
      [theme.breakpoints.up("md")]: {
        flexDirection: "column",
        alignItems: "center",
      },
    },
    cardText: {
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.5rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "2rem",
      },
    },
    submitShareContainer: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    button: {
      margin: "5px",
    },
  })
);

const GameSideBar: React.FC<GameSideBarProps> = ({
  gameMode,
  gameStarted,
  gameEnded,
  roundEnded,
  roundLoading,
  showIncrement,
  onStartRound,
  onSubmitClick,
  onShareClick,
  onLevelFinished,
  onChallenge,
  playerScore,
  aiScore,
  showAi,
  winLevel,
}: GameSideBarProps) => {
  const { t } = useTranslation(["translation", "common"]);

  const [challengeLoading, setChallengeLoading] = useState(false);

  const classes = useStyles();

  const [gameEndText, gameEndColor] = useMemo(() => {
    const playerScoreFull = playerScore.total + playerScore.round;
    const aiScoreFull = aiScore.total + aiScore.round;

    if (gameMode === "adventure" && !winLevel) {
      return [t("lost"), colors.playerLost];
    }

    if (playerScoreFull > aiScoreFull || !showAi || winLevel) {
      return [t("humanVictory"), colors.playerWon];
    }

    if (playerScoreFull < aiScoreFull) {
      return [t("aiVictory"), colors.playerLost];
    }

    return [t("draw"), colors.draw];
  }, [playerScore, aiScore, showAi, gameMode, winLevel, t]);

  const onChallengeClick = async () => {
    try {
      setChallengeLoading(true);
      if (onChallenge) {
        await onChallenge();
      }
    } finally {
      setChallengeLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <div className={classes.scoresContainer}>
          <ScoreWithIncrement
            player={t("you")}
            score={playerScore.total}
            increment={playerScore.round}
            showIncrement={showIncrement}
          />
          <HideFragment hide={!showAi}>
            <Typography className={classes.cardText}>{t("versus")}</Typography>

            <ScoreWithIncrement
              player={t("common:AiText")}
              score={aiScore.total}
              increment={aiScore.round}
              showIncrement={showIncrement}
            />
          </HideFragment>
        </div>

        <HideFragment hide={!gameEnded}>
          <Typography className={classes.cardText} style={{ color: gameEndColor }}>
            {gameEndText}
          </Typography>
        </HideFragment>

        <HideFragment hide={gameEnded}>
          <LoadingButton
            className={classes.button}
            variant="contained"
            color="primary"
            size="large"
            loading={roundLoading}
            disabled={gameStarted && !roundEnded}
            onClick={onStartRound}
          >
            {gameStarted ? t("common:NextText") : t("common:StartButton")}
          </LoadingButton>
        </HideFragment>

        <HideFragment
          hide={
            (gameMode === "competitive" && !gameEnded) ||
            gameMode === "adventure" ||
            !roundEnded ||
            roundLoading
          }
        >
          <div className={classes.submitShareContainer}>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              size="large"
              onClick={onSubmitClick}
            >
              {t("common:SubmitText")}
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              size="large"
              onClick={onShareClick}
            >
              {t("common:ShareText")}
            </Button>
          </div>
        </HideFragment>

        <HideFragment hide={!gameEnded || gameMode === "adventure"}>
          <LoadingButton
            className={classes.button}
            variant="contained"
            color="primary"
            size="large"
            loading={challengeLoading}
            onClick={onChallengeClick}
          >
            {t("common:ChallengeText")}
          </LoadingButton>
        </HideFragment>

        <HideFragment hide={gameMode !== "adventure" || !gameEnded}>
          <LoadingButton
            className={classes.button}
            variant="contained"
            color="primary"
            size="large"
            loading={challengeLoading}
            onClick={onLevelFinished}
          >
            {t("endLevel")}
          </LoadingButton>
        </HideFragment>
      </Card>
    </div>
  );
};

export default GameSideBar;
