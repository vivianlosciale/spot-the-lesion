import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import { NavigationAppBar, MapLevel } from "../../components";

interface CustomizedState {
  number: number;
  level: number;
}

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
  })
);

const Story: React.FC = () => {
  const history = useHistory();

  const location = useLocation();

  let actual = location.state as CustomizedState;
  if (actual == null) {
    actual = { number: 5, level: 0 };
  }

  const classes = useStyles();

  const onStartClick = () => history.replace("/storygame", actual);

  return (
    <>
      <NavigationAppBar showBack />
      <div className={classes.container}>
        <MapLevel number={actual.number} level={actual.level} />
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
