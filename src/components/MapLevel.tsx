import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import colors from "../res/colors";
import mascot from "../res/images/mascot.gif";

interface MapLevelProps {
  number: number;
  level: number;
}

const useStyles = makeStyles<Theme, MapLevelProps>((theme) =>
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
      backgroundColor: colors.secondary,
    },
    line: {
      width: 40,
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
        marginLeft: (props) => props.level * 80,
      },
      [theme.breakpoints.only("sm")]: {
        width: 50,
        marginLeft: (props) => props.level * 90,
      },
      [theme.breakpoints.up("md")]: {
        width: 70,
        marginLeft: (props) => props.level * 110,
      },
    },
  })
);

const MapLevel: React.FC<MapLevelProps> = ({ number, level }: MapLevelProps) => {
  const classes = useStyles({ number, level });

  return (
    <div className={classes.container}>
      <div className={classes.visual}>
        <img className={classes.mascot} src={mascot} alt="Mascot Logo" />
        <div className={classes.align}>
          <div className={classes.oval} />
          {Object.keys([...Array(number - 1)]).map((i) => {
            return (
              <div className={classes.align} key={i}>
                <div className={classes.line} />
                <div className={classes.oval} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapLevel;
