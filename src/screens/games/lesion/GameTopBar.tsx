import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { ColoredLinearProgress, HideFragment } from "../../../components";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      margin: 8,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      [theme.breakpoints.down("sm")]: {
        width: "80vw",
        maxWidth: "60vh",
      },
      [theme.breakpoints.up("md")]: {
        width: "70vh",
        maxWidth: "70vw",
      },
    },
    timer: {
      marginBottom: 8,
      fontSize: "1.5rem",
    },
  })
);

const GameTopBar: React.FC<GameTopBarProps> = ({
  gameMode,
  hintDisabled,
  onHintClick,
  roundTime,
  timerColor,
}: GameTopBarProps) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const time = (roundTime / 1000).toFixed(1);

  return (
    <Card className={classes.container}>
      <HideFragment hide={gameMode === "competitive"}>
        <Button variant="contained" color="secondary" disabled={hintDisabled} onClick={onHintClick}>
          {t("showHint")}
        </Button>
      </HideFragment>

      <HideFragment hide={gameMode !== "competitive"}>
        <Typography className={classes.timer} style={{ color: timerColor }}>
          {t("timeRemaining", { times: time })}
        </Typography>

        <ColoredLinearProgress
          barColor={timerColor}
          variant="determinate"
          value={roundTime / 100}
        />
      </HideFragment>
    </Card>
  );
};

export default GameTopBar;
