import React from "react";
import clsx from "clsx";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import StarIcon from "@material-ui/icons/Star";

const useStyles = makeStyles((theme) =>
  createStyles({
    star: {
      [theme.breakpoints.only("xs")]: {
        width: 12,
      },
      [theme.breakpoints.only("sm")]: {
        width: 16,
      },
      [theme.breakpoints.up("md")]: {
        width: 22,
      },
    },
    fullStar: {
      color: "yellow",
    },
  })
);
const RankStar: React.FC<RankLevelProps> = ({ actual, theme }) => {
  const classes = useStyles();

  const fullStars = Number(localStorage.getItem(`${theme}${actual}`));
  return (
    <>
      {Array.from({ length: fullStars }, (_v, i) => {
        return <StarIcon key={i} className={clsx(classes.star, classes.fullStar)} />;
      })}
      {Array.from({ length: 3 - fullStars }, (_v, i) => {
        return <StarIcon key={i} className={classes.star} />;
      })}
    </>
  );
};

export default RankStar;
