import React, { ReactNode } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  NativeSelect,
  FormControl,
  // Select,
  // MenuItem,
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
    subIcon: {
      color: "black",
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
        {/* There is a warning when using the select with react, so for now, the nativeSelect is used
        as lons as this warning is fixed in an ulterior version of react */}
        {/* <FormControl>
          <Select
            classes={{
              root: classes.icon,
              icon: classes.icon,
            }}
            value={language}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="FR">Français</MenuItem>
            <MenuItem value="EN">English</MenuItem>
            <MenuItem value="IT">Italiano</MenuItem>
          </Select>
        </FormControl> */}
        {children}
        <FormControl>
          <NativeSelect
            classes={{
              icon: classes.icon,
              root: classes.icon,
            }}
            value={i18n.language}
            onChange={handleChange}
          >
            {Object.keys(languages).map((value) => {
              return (
                <option key={value} className={classes.subIcon} value={value}>
                  {languages[value]}
                </option>
              );
            })}
          </NativeSelect>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationAppBar;
