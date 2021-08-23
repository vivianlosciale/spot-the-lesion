import React from "react";
import clsx from "clsx";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import RankStar from "./RankStar";
import colors from "../../res/colors";
import mascot from "../../res/images/mascot.gif";

const useStyles = makeStyles<Theme, StoryProps>((theme) =>
  createStyles({
    container: {
      "&::-webkit-scrollbar": {
        width: 5,
        height: 10,
      },
      "&::-webkit-scrollbar-thumb": {
        background: colors.primary,
      },
      width: "80%",
      display: "flex",
      alignItems: "stretch",
      overflowX: "auto",
      flexDirection: "column",
    },
    "@keyframes glow": {
      "0%": {
        backgroundColor: colors.secondary,
      },
      "100%": {
        backgroundColor: "#81cbd6",
      },
    },
    align: {
      display: "flex",
      alignItems: "center",
    },
    visual: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      margin: "auto",
    },
    oval: {
      [theme.breakpoints.only("xs")]: {
        width: 40,
        height: 25,
        boxShadow: `inset 0px 0px 0px 8px ${colors.primary}`,
      },
      [theme.breakpoints.only("sm")]: {
        width: 50,
        height: 30,
        boxShadow: `inset 0px 0px 0px 9px ${colors.primary}`,
      },
      [theme.breakpoints.up("md")]: {
        width: 70,
        height: 40,
        boxShadow: `inset 0px 0px 0px 10px ${colors.primary}`,
      },
      borderRadius: "100%",
      backgroundColor: colors.primary,
    },
    glowAnimation: {
      animation: "$glow 1s infinite alternate",
    },
    line: {
      width: 40,
      marginBottom: 28,
      [theme.breakpoints.only("xs")]: {
        height: 5,
      },
      [theme.breakpoints.only("sm")]: {
        height: 7,
      },
      [theme.breakpoints.up("md")]: {
        height: 10,
      },
      backgroundColor: colors.primary,
      boxShadow: `0px 0px 0px 2px ${colors.primary}`,
    },
    mascot: {
      [theme.breakpoints.only("xs")]: {
        width: 40,
        marginLeft: (props) => props.actual * 80,
      },
      [theme.breakpoints.only("sm")]: {
        width: 50,
        marginLeft: (props) => props.actual * 90,
      },
      [theme.breakpoints.up("md")]: {
        width: 70,
        marginLeft: (props) => props.actual * 110,
      },
    },
  })
);

const MapLevel: React.FC<StoryProps> = ({ number, actual, theme }: StoryProps) => {
  const history = useHistory();

  const classes = useStyles({ number, actual, theme });

  const onClicked = (num: number) => history.replace(`/story?actual=${num}`);
  return (
    <div className={classes.container}>
      <div className={classes.visual}>
        <img className={classes.mascot} src={mascot} alt="Mascot Logo" />
        <div className={classes.align}>
          {Array.from({ length: number }, (_v, i) => {
            if (i === 0) {
              return (
                <div key={i}>
                  <div
                    className={clsx(classes.oval, classes.glowAnimation)}
                    onClick={() => onClicked(i)}
                    aria-hidden="true"
                  />
                  <RankStar actual={i} theme={theme} />
                </div>
              );
            }
            let roundLevel;
            if (localStorage.getItem(`${theme}${i}`) === null) {
              roundLevel = <div className={classes.oval} />;
            } else {
              roundLevel = (
                <div
                  className={clsx(classes.oval, classes.glowAnimation)}
                  onClick={() => onClicked(i)}
                  aria-hidden="true"
                />
              );
            }
            return (
              <div className={classes.align} key={i}>
                <div>
                  <div className={classes.line} />
                </div>
                <div>
                  {roundLevel}
                  <RankStar actual={i} theme={theme} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapLevel;
