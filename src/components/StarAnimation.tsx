import React from "react";
import clsx from "clsx";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import StarIcon from "@material-ui/icons/Star";

interface StarAnimationProps {
  beginAnimation: string;
  nbOfStars: number;
}

const useStyles = makeStyles<Theme, StarAnimationProps>((theme) =>
  createStyles({
    "@keyframes slide-appears": {
      "0%": {
        opacity: "0%",
        transform: "scale(1) translateY(500px)",
      },
      "40%": {
        opacity: "100%",
        transform: "scale(5) translateY(0)",
        bottom: "10%",
      },
      "80%": {
        opacity: "100%",
      },
      "99%": {
        opacity: "0%",
        transform: "scale(5) translateY(0)",
        bottom: "10%",
        zIndex: 10,
      },
      "100%": {
        zIndex: 0,
        opacity: "0%",
      },
    },
    SlideAnimation: {
      animation: "$slide-appears 5s cubic-bezier(0, 0, 0.265, 1.550) both",
      animationPlayState: (props) => props.beginAnimation,
    },
    stars: {
      [theme.breakpoints.down("sm")]: {
        width: 15,
      },
      [theme.breakpoints.up("md")]: {
        width: 22,
      },
    },
    fullStar: {
      color: "yellow",
    },
    starsBackground: {
      display: "flex",
      zIndex: 10,
      borderRadius: "50%",
      position: "fixed",
      justifyContent: "space-evenly",
      backgroundColor: "rgba(7, 45, 91, 0.8)",
      boxShadow: "0px 0px 0px 1px #075b35",
      height: 25,
      [theme.breakpoints.down("sm")]: {
        width: 80,
      },
      [theme.breakpoints.up("md")]: {
        width: 105,
      },
    },
  })
);

const StarAnimation: React.FC<StarAnimationProps> = ({
  beginAnimation,
  nbOfStars,
}: StarAnimationProps) => {
  const classes = useStyles({ beginAnimation, nbOfStars });

  return (
    <>
      <div className={clsx(classes.starsBackground, classes.SlideAnimation)}>
        {Array.from({ length: nbOfStars }, (_v, i) => {
          return <StarIcon key={i} className={clsx(classes.stars, classes.fullStar)} />;
        })}
        {Array.from({ length: 3 - nbOfStars }, (_v, i) => {
          return <StarIcon key={i} className={classes.stars} />;
        })}
      </div>
    </>
  );
};

export default StarAnimation;
