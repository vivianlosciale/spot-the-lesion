import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { NavigationAppBar, HideFragment } from "../../components";
import MapLevel from "./MapLevel";
import mascot from "../../res/images/mascot.gif";

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

const Story: React.FC<StoryProps> = ({ actual, number, theme }: StoryProps) => {
  const { t } = useTranslation("common");

  const history = useHistory();

  const to = { number, actual } as StoryProps;

  const classes = useStyles();

  const onStartClick = () => history.push("/storygame", to);

  const onQuitClick = () => history.push("/");
  // works like ComponentDidMount
  useEffect(() => {}, []);

  return (
    <>
      <NavigationAppBar showBack />
      <div className={classes.container}>
        <HideFragment hide={!(actual >= number)}>
          <img src={mascot} alt="Mascot Logo" />
          <Button
            className={classes.startButton}
            onClick={onQuitClick}
            variant="contained"
            color="primary"
            size="large"
          >
            {t("QuitButton")}
          </Button>
        </HideFragment>
        <HideFragment hide={actual >= number}>
          <MapLevel number={number} actual={actual} theme={theme} />
          <Button
            className={classes.startButton}
            onClick={onStartClick}
            variant="contained"
            color="primary"
            size="large"
          >
            {t("StartButton")}
          </Button>
        </HideFragment>
      </div>
    </>
  );
};

export default Story;
