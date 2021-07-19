import React, { ReactNode } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { KeyboardBackspace } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { languages } from "../language/index";

interface NavigationAppBarProps {
  showBack?: boolean;
  children?: ReactNode;
}

const useStyles = makeStyles(() =>
  createStyles({
    backButton: {
      marginRight: 8,
    },
    title: {
      flexGrow: 1,
    },
    icon: {
      color: "white",
    },
  })
);

const NavigationAppBar: React.FC<NavigationAppBarProps> = ({
  children,
  showBack,
}: NavigationAppBarProps) => {
  const classes = useStyles();

  const history = useHistory();

  const [, i18n] = useTranslation();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    i18n.changeLanguage(event.target.value as string);
  };
  const onBackClick = () => history.goBack();

  return (
    <AppBar position="sticky">
      <Toolbar variant="dense">
        <IconButton
          className={classes.backButton}
          style={{ display: showBack ? "" : "none" }}
          edge="start"
          color="inherit"
          aria-label="Back"
          onClick={onBackClick}
        >
          <KeyboardBackspace />
        </IconButton>
        <Typography className={classes.title}>Spot the Lesion</Typography>
        {children}
        <FormControl>
          <Select
            classes={{
              root: classes.icon,
              icon: classes.icon,
            }}
            value={i18n.language}
            onChange={handleChange}
          >
            {Object.keys(languages).map((value) => {
              return (
                <MenuItem key={value} value={value}>
                  {languages[value]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationAppBar;
