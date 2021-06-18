import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import colors from "../res/colors";
import mascot from "../res/images/mascot.gif";

interface MapLevelProps {
  number: number;
  level: number;
}

const useStyles = makeStyles<Theme, MapLevelProps>(() =>
  createStyles({
    container: {
      // flexGrow: 0.7,
      display: "flex",
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
    mascot: {
      width: 70,
      marginLeft: (props) => props.level * 110,
    },
  })
);

const MapLevel: React.FC<MapLevelProps> = ({ number, level }: MapLevelProps) => {
  const classes = useStyles({ number, level });

  return (
    <div>
      <img className={classes.mascot} src={mascot} alt="Mascot Logo" />
      <div className={classes.container}>
        <div className={classes.oval} />
        {Object.keys([...Array(number - 1)]).map((i) => {
          return (
            <div className={classes.container} key={i}>
              <div className={classes.line} />
              <div className={classes.oval} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapLevel;
