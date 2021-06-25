import React, { useState, useEffect } from "react";
import { Card, Typography, Button, ButtonGroup } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import clsx from "clsx";
import mascot from "../../res/images/mascot.gif";
import { HideFragment } from "../../components";

interface GuideProps {
  className?: string;
  hide: boolean;
  explanation: ExplanationItem[];
  theme: number;
  slide: number;
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
        flexDirection: "column",
        marginBottom: 24,
      },
      [theme.breakpoints.down("sm")]: {
        flexDirection: "row",
      },
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: 10,
    },
    containerT: {
      display: "flex",
      margin: 10,
    },
    text: {
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
      maxHeight: "100%",
      [theme.breakpoints.down("sm")]: {
        maxWidth: "20%",
      },
      [theme.breakpoints.up("md")]: {
        maxWidth: "60%",
      },
    },
  })
);
/* eslint-disable */
const StoryGuide: React.FC<GuideProps> = ({ className, hide, explanation, theme, slide }: GuideProps) => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation("lesionGame");

  const numSlides = explanation.length;

  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [slideIndex, setSlideIndex] = useState(0);
  const [text, setText] = useState(explanation[slideIndex].text);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  const onArrowClick = (direction: "left" | "right") => {
    setSlideDirection(direction);
    const increment = slideDirection === "left" ? -1 : 1;
    const newIndex = (slideIndex + increment + numSlides) % numSlides;
    setText(explanation[newIndex].text);
    setImageSrc(explanation[newIndex].imageSrc);
    setSlideIndex(newIndex);
  };

  const onInfoClick = () => history.push(`/explanation?theme=${theme}&slide=${slide}`);

  useEffect(() => {
    setText(explanation[0].text);
  }, [hide]);
  

  return (
    <div className={clsx(classes.container, className)}>
      <HideFragment hide={hide}>
        <Card className={classes.Cardcontainer}>
          <Typography className={classes.text}>
            {t(text)}
            <HideFragment hide={!(slideIndex === explanation.length - 1)}>
              <Button color="primary" size="small" variant="contained" onClick={onInfoClick}className={classes.containerT}>
                En savoir plus
              </Button>
            </HideFragment>
          </Typography>
            <img
              style={{ display: imageSrc === undefined ? "none" : "" }}
              className={classes.image}
              src={imageSrc} alt="Explanation card"
            />
          <ButtonGroup size="small" className={classes.containerT}>
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
