import React, { useState, useEffect } from "react";
import { Card, Typography, Button, ButtonGroup } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import clsx from "clsx";
import mascot from "../res/images/mascot.gif";
import HideFragment from "./HideFragment";

interface GuideProps {
  className?: string;
  mascotExplanation: MascotExplanation;
  theme: number;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    Cardcontainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      padding: 24,
      marginBottom: 10,
      [theme.breakpoints.up("md")]: {
        marginBottom: 24,
      },
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    containerButton: {
      display: "flex",
      margin: 10,
    },
    text: {
      textAlign: "justify",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "1.25rem",
      },
    },
    mascot: {
      [theme.breakpoints.down("sm")]: {
        width: 60,
      },
      [theme.breakpoints.up("md")]: {
        width: 70,
      },
    },
    imageContainer: {
      flex: 3,
      height: "50%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      [theme.breakpoints.down("sm")]: {
        maxHeight: "150px",
        maxWidth: "75%",
      },
      [theme.breakpoints.up("md")]: {
        maxHeight: "250px",
        maxWidth: "100%",
      },
    },
  })
);

const StoryGuide: React.FC<GuideProps> = ({ className, mascotExplanation, theme }: GuideProps) => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation("lesionGame");

  const numSlides = mascotExplanation.explanation.length;

  const [slideIndex, setSlideIndex] = useState(0);
  const [text, setText] = useState(mascotExplanation.explanation[slideIndex].text);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  const onArrowClick = (direction: "left" | "right") => {
    const increment = direction === "left" ? -1 : 1;
    const newIndex = (slideIndex + increment + numSlides) % numSlides;
    setText(mascotExplanation.explanation[newIndex].text);
    setImageSrc(mascotExplanation.explanation[newIndex].imageSrc);
    setSlideIndex(newIndex);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        onArrowClick("left");
      }

      if (event.key === "ArrowRight") {
        onArrowClick("right");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const onInfoClick = () =>
    history.push(`/explanation?theme=${theme}&slide=${mascotExplanation.slide}`);

  return (
    <div className={clsx(classes.container, className)}>
      <Card className={classes.Cardcontainer}>
        <Typography className={classes.text}>{t(text)}</Typography>
        <img
          style={{ display: imageSrc === undefined ? "none" : "" }}
          className={classes.image}
          src={imageSrc}
          alt="Explanation card"
        />
        <HideFragment hide={!(slideIndex === mascotExplanation.explanation.length - 1)}>
          <Button
            color="primary"
            size="small"
            variant="contained"
            onClick={onInfoClick}
            className={classes.containerButton}
          >
            En savoir plus
          </Button>
        </HideFragment>
        <ButtonGroup size="small" className={classes.containerButton}>
          <Button color="primary" variant="contained" onClick={() => onArrowClick("left")}>
            <ArrowBack />
          </Button>

          <Button color="primary" variant="contained" onClick={() => onArrowClick("right")}>
            <ArrowForward />
          </Button>
        </ButtonGroup>
      </Card>
      <img className={classes.mascot} src={mascot} alt="Mascot Logo" />
    </div>
  );
};

export default StoryGuide;
