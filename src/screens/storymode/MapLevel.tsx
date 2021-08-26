import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import clsx from "clsx";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import storyTheme from "../games";
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
    indicator: {
      width: "100%",
    },
    textIndicator: {
      display: "flex",
      fontSize: "1rem",
      justifyContent: "space-evenly",
      alignItems: "center",
      backgroundColor: colors.primary,
      color: "white",
      height: 50,
      borderRadius: "2.5% / 50%",
    },
    triangle: {
      width: 0,
      height: 0,
      [theme.breakpoints.only("xs")]: {
        borderBottom: `7px solid ${colors.primary}`,
        borderRight: "10px solid transparent",
        borderLeft: "10px solid transparent",
        marginLeft: (props) => props.actual * 80 + 7,
      },
      [theme.breakpoints.only("sm")]: {
        borderBottom: `10px solid ${colors.primary}`,
        borderRight: "14px solid transparent",
        borderLeft: "14px solid transparent",
        marginLeft: (props) => props.actual * 90 + 10,
      },
      [theme.breakpoints.up("md")]: {
        borderBottom: `13px solid ${colors.primary}`,
        borderRight: "20px solid transparent",
        borderLeft: "20px solid transparent",
        marginLeft: (props) => props.actual * 110 + 13,
      },
    },
  })
);

const MapLevel: React.FC<StoryProps> = ({ number, actual, theme }: StoryProps) => {
  const { t } = useTranslation();

  const history = useHistory();

  const classes = useStyles({ number, actual, theme });

  const adventureProps = storyTheme[theme];

  const [indication, setIndication] = useState(
    adventureProps.indications[adventureProps.level[actual].gameMode.typeLevel]
  );

  // not generic yet, need to find a way to generalise it
  const infoText = t(indication, {
    number: adventureProps.level[actual].gameMode.levelRequirement,
    nbRound: adventureProps.level[actual].numberOfRound,
  });

  const onClicked = (num: number) => {
    history.replace(`/story?actual=${num}`);
    const type = adventureProps.level[num].gameMode.typeLevel;
    setIndication(adventureProps.indications[type]);
  };

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
        <div className={classes.indicator}>
          <div className={classes.triangle} />
          <div className={classes.textIndicator}>
            <Typography>{infoText}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLevel;
