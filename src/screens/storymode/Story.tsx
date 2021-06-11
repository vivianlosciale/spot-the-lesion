import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { NavigationAppBar } from "../../components";
import colors from "../../res/colors";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      overflow: "hidden",
    },
    shapeContainer: {
      // flexGrow: 0.7,
      display: "flex",
      alignItems: "center",
    },
    startButton: {
      borderRadius: 20,
      [theme.breakpoints.only("xs")]: {
        width: 300,
        height: 50,
        fontSize: "1rem",
      },
      [theme.breakpoints.only("sm")]: {
        width: 350,
        height: 58,
        fontSize: "1rem",
      },
      [theme.breakpoints.up("md")]: {
        width: 370,
        height: 61,
        fontSize: "1.25rem",
      },
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
      boxShadow: `0px 0px 0px 1px ${colors.primary}`,
    },
  })
);

const Story: React.FC = () => {
  const value = 7;

  const history = useHistory();

  const classes = useStyles();

  const onStartClick = () => history.push("/storygame");

  return (
    <>
      <NavigationAppBar showBack />
      <div className={classes.container}>
        <div className={classes.shapeContainer}>
          <div className={classes.oval} />
          {Object.keys([...Array(value)]).map(() => {
            return (
              <>
                <div className={classes.line} />
                <div className={classes.oval} />
              </>
            );
          })}
        </div>
        <Button
          className={classes.startButton}
          onClick={onStartClick}
          variant="contained"
          color="primary"
          size="large"
        >
          Continuer
        </Button>
      </div>
    </>
  );
};

export default Story;
