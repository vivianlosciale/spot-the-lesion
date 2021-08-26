import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { LightTooltip, NavigationAppBar } from "../../components";
import { lockedAchievement, achievementItems } from "./achievementItems";
import constants from "../../res/constants";

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      flex: 1,
      height: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    infoText: {
      padding: 16,
      [theme.breakpoints.down("xs")]: {
        fontSize: "1rem",
      },
      [theme.breakpoints.between("sm", "md")]: {
        fontSize: "1.5rem",
      },
      [theme.breakpoints.up("lg")]: {
        fontSize: "2rem",
      },
    },
    gridContainer: {
      overflow: "auto",
    },
    gridItem: {
      display: "flex",
      justifyContent: "center",
      padding: 16,
    },
    image: {
      [theme.breakpoints.down("xs")]: {
        width: "100%",
      },
      [theme.breakpoints.only("sm")]: {
        width: 150,
      },
      [theme.breakpoints.up("md")]: {
        width: 200,
      },
    },
  })
);

const Achievements: React.FC = () => {
  const { t } = useTranslation(["achievements", "common", "translation"]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(lockedAchievement);

  const classes = useStyles();

  const onDialogClose = () => setDialogOpen(false);

  const numberOfUnlockedAchievement = () => {
    let unlockedAchievement = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const value = localStorage.getItem(localStorage.key(i) as string);
      if (value && value === "true") {
        unlockedAchievement += 1;
      }
    }
    return unlockedAchievement - 1;
  };

  const infoText = t("translation:SuccessText", {
    val: Math.max(numberOfUnlockedAchievement() as number, 0),
    total: constants.numberOfAchievements,
  });

  return (
    <>
      <NavigationAppBar showBack />
      <div className={classes.container}>
        <Typography className={classes.infoText}>{infoText}</Typography>

        <Grid container className={classes.gridContainer}>
          {achievementItems.map((item) => {
            const { key } = item;

            const unlocked = localStorage.getItem(key);

            const displayItem = unlocked === "true" ? item : lockedAchievement;

            const { title, image } = displayItem;

            const titleTranslation = `${t(title)}`;

            const onButtonClick = () => {
              setSelectedAchievement(displayItem);
              setDialogOpen(true);
            };

            return (
              <Grid key={key} item xs={4} className={classes.gridItem}>
                <LightTooltip title={titleTranslation} arrow>
                  <Button onClick={onButtonClick}>
                    <img className={classes.image} src={image} alt={title} />
                  </Button>
                </LightTooltip>
              </Grid>
            );
          })}
        </Grid>
      </div>
      <Dialog open={dialogOpen} onClose={onDialogClose}>
        <DialogTitle>{t(selectedAchievement.title)}</DialogTitle>

        <DialogContent dividers>
          <Typography>{t(selectedAchievement.description)}</Typography>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={onDialogClose}>
            {t("common:CloseButton")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Achievements;
