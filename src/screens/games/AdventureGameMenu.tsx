import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Typography,
  Select,
  FormControl,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { NavigationAppBar } from "../../components";
import storyTheme from "./index";

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
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      width: "70%",
      fontSize: "10px",
      justifyContent: "space-between",
    },
    selectText: {
      fontSize: "3rem",
      textAlign: "center",
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
    selectMenu: {
      fontSize: "2rem",
      fontWeight: "bold",
      [theme.breakpoints.only("xs")]: {
        fontSize: "150%",
      },
      [theme.breakpoints.only("sm")]: {
        fontSize: "1.25rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "2rem",
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
    button: {
      borderRadius: 20,
      [theme.breakpoints.only("xs")]: {
        width: 150,
        height: 50,
        fontSize: "0.75rem",
      },
      [theme.breakpoints.only("sm")]: {
        width: 200,
        height: 58,
        fontSize: "1rem",
      },
      [theme.breakpoints.up("md")]: {
        width: 300,
        height: 61,
        fontSize: "1.25rem",
      },
    },
  })
);
const GameMenu: React.FC = () => {
  const { t } = useTranslation(["common", "translation"]);

  const [theme, setTheme] = useState(Object.keys(storyTheme)[0]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const history = useHistory();

  const classes = useStyles();

  const onStartClick = () => history.push(`/story?theme=${theme}`);

  const onDelete = () => {
    Object.keys(storyTheme).map((value) => {
      for (let i = 0; i < storyTheme[value].length + 1; i++) {
        localStorage.removeItem(`${value}${i}`);
      }
      return true;
    });
    setDialogOpen(false);
  };

  const onCloseClick = () => setDialogOpen(false);

  const onDeleteClick = () => setDialogOpen(true);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTheme(event.target.value as string);
  };

  return (
    <>
      <NavigationAppBar showBack />

      <div className={classes.container}>
        <div className={classes.selectorContainer}>
          <Typography className={classes.selectText}>{t("translation:themeAdventure")}</Typography>
          <FormControl>
            <Select className={classes.selectMenu} value={theme} onChange={handleChange}>
              {Object.keys(storyTheme).map((value) => {
                return (
                  <MenuItem className={classes.selectMenu} key={value} value={value}>
                    {t(`translation:${value}`)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
        <div className={classes.buttonContainer}>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            size="small"
            onClick={onDeleteClick}
          >
            {t("translation:deleteData")}
          </Button>

          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            size="small"
            onClick={onStartClick}
          >
            {t("StartButton")}
          </Button>
        </div>

        <Dialog open={dialogOpen}>
          <DialogTitle>{t("translation:dataTitleDialog")}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t("translation:dataTextDialog")}</DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={onDelete}>
              {t("YesButton")}
            </Button>

            <Button color="primary" onClick={onCloseClick}>
              {t("NoButton")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default GameMenu;
