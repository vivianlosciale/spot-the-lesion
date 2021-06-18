import React from "react";
import { Card, Typography, Button, ButtonGroup } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import clsx from "clsx";
import LesionGuide from "./lesion/GuideItems";
import colors from "../../res/colors";
import mascot from "../../res/images/mascot.gif";
import { HideFragment } from "../../components";

interface GuideProps {
  className?: string;
  number: number;
  level: number;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    Cardcontainer: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "center",
      boxSizing: "border-box",
      padding: 24,
      marginBottom: 24,
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    oval: {
      width: 70,
      height: 40,
      borderRadius: "100%",
      backgroundColor: colors.secondary,
      boxShadow: `inset 0px 0px 0px 10px ${colors.primary}`,
    },
    line: {
      width: 40,
      height: 10,
      backgroundColor: colors.primary,
      boxShadow: `0px 0px 0px 2px ${colors.primary}`,
    },
    text: {
      [theme.breakpoints.only("sm")]: {
        fontSize: "1rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "1.25rem",
      },
    },
    mascot: {
      width: 70,
    },
  })
);
/* eslint-disable */
const StoryGuide: React.FC<GuideProps> = ({ className, number, level }: GuideProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const levelExplanation = LesionGuide.length;

  const num = () => {
    for (let i = 0; i < levelExplanation; i++) {
      if (level === Math.round(LesionGuide[i].progression * number)) {
        return i;
      }
    }
    return 0;
  }
  const guide = () => {
    for (let i = 0; i < levelExplanation; i++) {
      if (level === Math.round(LesionGuide[i].progression * number)) {
        return true;
      }
    }
    return false;
  }

  const sizeExplanation = LesionGuide[num()].explication.length;
  console.log(sizeExplanation);

  return (
    <div className={clsx(classes.container, className)}>
      <HideFragment hide={!guide()}>
        <Card className={classes.Cardcontainer}>
          <Typography className={classes.text}>{t(LesionGuide[num()].explication[0].text)}</Typography>
          <ButtonGroup size="small">
            <Button color="primary" variant="contained">
              <ArrowBack />
            </Button>

            <Button color="primary" variant="contained">
              <ArrowForward />
            </Button>
          </ButtonGroup>
        </Card>
        <img className={classes.mascot} src={mascot} alt="Mascot Logo" />
      </HideFragment>
    </div>
  );
};

export default StoryGuide;
