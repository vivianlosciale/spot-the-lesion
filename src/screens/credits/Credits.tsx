import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Card,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { getLibrariesArray } from "../../utils/creditsUtils";
import { NavigationAppBar, TabPanel } from "../../components";
import libraries from "./libraries.json";
import imperial from "../../res/images/credits/imperial.png";
import mira from "../../res/images/credits/mira.png";
import terraNumerica from "../../res/images/credits/terraNumerica.png";
import colors from "../../res/colors";

const useStyles = makeStyles((theme) =>
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
      flex: 1,
      height: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    imageContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      justifyItems: "center",
      alignItems: "center",
      marginLeft: "10%",
    },
    card: {
      height: "80%",
      width: "80%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      padding: 8,
    },
    text: {
      textAlign: "center",
      [theme.breakpoints.only("xs")]: {
        fontSize: "1rem",
      },
      [theme.breakpoints.only("sm")]: {
        fontSize: "1.15rem",
      },
      [theme.breakpoints.only("md")]: {
        fontSize: "1.3rem",
      },
      [theme.breakpoints.up("lg")]: {
        fontSize: "1.5rem",
      },
    },
    list: {
      flex: 1,
      height: 0,
      overflow: "auto",
    },
    image: {
      [theme.breakpoints.down("xs")]: {
        width: "90%",
      },
      [theme.breakpoints.only("sm")]: {
        width: "70%",
      },
      [theme.breakpoints.up("md")]: {
        width: "70%",
      },
    },
  })
);

const Credits: React.FC = () => {
  const { t } = useTranslation();

  const [tabIndex, setTabIndex] = useState(0);

  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("xs"));

  const classes = useStyles();

  const onTabChange = (_event, newValue: number) => setTabIndex(newValue);

  return (
    <>
      <NavigationAppBar showBack />

      <AppBar className={classes.appBar} position="sticky">
        <Tabs
          classes={{ indicator: classes.tabIndicator }}
          variant={smallScreen ? "fullWidth" : "standard"}
          centered
          aria-label="Credits pages"
          value={tabIndex}
          onChange={onTabChange}
        >
          <Tab className={classes.tab} label={t("tabGame")} />

          <Tab className={classes.tab} label={t("tabImagesLibrairies")} />
        </Tabs>
      </AppBar>

      <div className={classes.container}>
        <TabPanel value={tabIndex} index={0}>
          <Card className={classes.card}>
            <Typography className={classes.text}>
              {t("tabGameText1")}{" "}
              <a href="https://arxiv.org/abs/1906.02283" target="blank">
                {t("tabGameText2")}
              </a>
            </Typography>

            <Typography className={classes.text}>{t("tabGameText3")}</Typography>

            <Typography className={classes.text}>{t("tabGameText4")}</Typography>

            <Typography className={classes.text}>
              {t("tabGameText5")}{" "}
              <a
                href="https://www.nih.gov/news-events/news-releases/nih-clinical-center-releases-dataset-32000-ct-images"
                target="blank"
              >
                {t("tabGameText6")}
              </a>
            </Typography>
            <Typography className={classes.text}>{t("tabGameText7")}</Typography>
            <div className={classes.imageContainer}>
              <a href="http://www.imperial.ac.uk/" target="blank">
                <img className={classes.image} src={imperial} alt={imperial} />
              </a>

              <a href="https://sites.google.com/view/project-mira/" target="blank">
                <img className={classes.image} src={mira} alt={mira} />
              </a>

              <a href="http://terra-numerica.org/" target="blank">
                <img className={classes.image} src={terraNumerica} alt={terraNumerica} />
              </a>
            </div>
          </Card>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <Card className={classes.card}>
            <Typography className={classes.text}>{t("tabImagesLibrairiesText1")}</Typography>

            <Typography className={classes.text}>
              {t("tabImagesLibrairiesText2")}{" "}
              <a href="image_licenses.pdf" download>
                image_licenses.pdf
              </a>
            </Typography>
            <Typography className={classes.text}>{t("tabImagesLibrairiesText3")}</Typography>
            <List className={classes.list}>
              {getLibrariesArray(libraries).map(({ name, version }) => (
                <ListItem key={name}>
                  <ListItemText primary={name} secondary={version} />
                </ListItem>
              ))}
            </List>
          </Card>
        </TabPanel>
      </div>
    </>
  );
};

export default Credits;
