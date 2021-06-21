import React, { useState, useEffect } from "react";
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
  hide: boolean;
  explanation: ExplanationItem[];
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
    imageContainer: {
      flex: 3,
      height: "0%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  })
);
/* eslint-disable */
const StoryGuide: React.FC<GuideProps> = ({ className, hide, explanation }: GuideProps) => {
  const classes = useStyles();
  const { t } = useTranslation("lesionGame");

  const numSlides = LesionGuide.length;

  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [slideIndex, setSlideIndex] = useState(0);
  const [text, setText] = useState(explanation[slideIndex].text);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  const sizeExplanation = explanation.length;
  console.log(sizeExplanation);

  const onArrowClick = (direction: "left" | "right") => {
    setSlideDirection(direction);
    const increment = slideDirection === "left" ? -1 : 1;
    const newIndex = (slideIndex + increment + numSlides) % numSlides;
    setText(explanation[newIndex].text);
    setImageSrc(explanation[newIndex].imageSrc);
    setSlideIndex(newIndex);
  };

  useEffect(() => {
    setText(explanation[0].text);
  }, [hide]);

  return (
    <div className={clsx(classes.container, className)}>
      <HideFragment hide={hide}>
        <Card className={classes.Cardcontainer}>
          <Typography className={classes.text}>{t(text)}</Typography>
          <div
          className={classes.imageContainer}
          style={{ display: imageSrc === undefined ? "none" : "" }}
          >
            <img className={classes.image} src={imageSrc} alt="Explanation card" />
          </div>
          <ButtonGroup size="small">
            <Button color="primary" variant="contained" onClick={() => onArrowClick("left")}>
              <ArrowBack />
            </Button>

            <Button color="primary" variant="contained" onClick={() => onArrowClick("right")}>
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
