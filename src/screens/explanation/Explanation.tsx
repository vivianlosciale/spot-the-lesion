import React, { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  ButtonGroup,
  Slide,
  Tab,
  Tabs,
  Theme,
  useMediaQuery,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { RouteComponentProps } from "react-router-dom";
import { NavigationAppBar, TabPanel } from "../../components";
import ExplanationCard from "./ExplanationCard";
import { getQueryOrDefault } from "../../utils/gameUtils";
import { explanationLesionItems, explanationIAItems } from "./ExplanationItems";
import colors from "../../res/colors";

const useStyles = makeStyles(() =>
  createStyles({
    appBar: {
      backgroundColor: colors.primaryTabBar,
    },
    tabIndicator: {
      backgroundColor: colors.tabIndicator,
    },
    tab: {
      fontSize: "1rem",
    },
    container: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      overflowX: "hidden",
    },
    tutorialCard: {
      width: "80%",
      height: "80%",
    },
    playButtonContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    playButton: {
      borderRadius: 20,
      fontSize: "3rem",
    },
  })
);

type StoryRouteProps = Omit<RouteComponentProps<never>, "match">;

const Explanation: React.FC<StoryRouteProps> = ({ location }: StoryRouteProps) => {
  const query = new URLSearchParams(location.search);
  const numSlides = explanationLesionItems.length;

  const [tabIndex, setTabIndex] = useState(getQueryOrDefault(query.get("theme"), 0));
  const [slideIndex, setSlideIndex] = useState(getQueryOrDefault(query.get("slide"), 0));
  const [slideIn, setSlideIn] = useState(true);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("xs"));

  const classes = useStyles();

  const onTabChange = async (_event, newValue: number) => setTabIndex(newValue);

  const onArrowClick = (direction: "left" | "right") => {
    setSlideDirection(direction);
    setSlideIn(false);
  };

  const onSlideExited = () => {
    const increment = slideDirection === "left" ? -1 : 1;
    const newIndex = (slideIndex + increment + numSlides) % numSlides;

    setSlideIndex(newIndex);
    setSlideDirection((prevState) => (prevState === "left" ? "right" : "left"));
    setSlideIn(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        onArrowClick("left");
      }

      if (event.key === "ArrowRight") {
        onArrowClick("right");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <>
      <NavigationAppBar showBack />

      <AppBar className={classes.appBar} position="sticky">
        <Tabs
          classes={{ indicator: classes.tabIndicator }}
          variant={smallScreen ? "fullWidth" : "standard"}
          centered
          value={tabIndex}
          onChange={onTabChange}
        >
          <Tab className={classes.tab} label="Lésions" />

          <Tab className={classes.tab} label="Intelligence Artificielle" />
        </Tabs>
      </AppBar>

      <div className={classes.container}>
        <TabPanel value={tabIndex} index={0}>
          <Slide
            appear={false}
            in={slideIn}
            direction={slideDirection}
            timeout={{ enter: 400, exit: 400 }}
            onExited={onSlideExited}
          >
            <ExplanationCard
              className={classes.tutorialCard}
              explanationItem={explanationLesionItems[slideIndex]}
            />
          </Slide>

          <ButtonGroup size="large">
            <Button color="primary" variant="contained" onClick={() => onArrowClick("left")}>
              <ArrowBack />
            </Button>

            <Button color="primary" variant="contained" onClick={() => onArrowClick("right")}>
              <ArrowForward />
            </Button>
          </ButtonGroup>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <ExplanationCard
            className={classes.tutorialCard}
            explanationItem={explanationIAItems[0]}
          />
        </TabPanel>
      </div>
    </>
  );
};

export default Explanation;
