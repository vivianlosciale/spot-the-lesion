import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, Slider } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { NavigationAppBar } from "../../../../components";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    selectorContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "50%",
    },
    selectText: {
      fontSize: "3rem",
      fontWeight: "bold",
      [theme.breakpoints.only("xs")]: {
        fontSize: "150%",
      },
      [theme.breakpoints.only("sm")]: {
        fontSize: "1.5rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "3rem",
      },
    },
    toggleButton: {
      margin: 8,
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

const GameMenu: React.FC = () => {
  const { t } = useTranslation("common");

  const [lvls, setlvls] = useState(0);

  const [actual] = useState(0);

  const history = useHistory();

  const classes = useStyles();

  const onStartClick = () => history.push(`/story?lvl=${lvls}&actual=${actual}`);

  const onChangelvls = (_event, lvl) => setlvls(lvl);

  return (
    <>
      <NavigationAppBar showBack />

      <div className={classes.container}>
        <div className={classes.selectorContainer}>
          <Typography className={classes.selectText}>{t("Nb levels")}</Typography>
          <Slider
            defaultValue={5}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={1}
            min={5}
            max={20}
            onChange={onChangelvls}
          />
        </div>

        <Button
          className={classes.startButton}
          variant="contained"
          color="primary"
          size="large"
          disabled={lvls === 0}
          onClick={onStartClick}
        >
          {t("StartButton")}
        </Button>
      </div>
    </>
  );
};

export default GameMenu;
