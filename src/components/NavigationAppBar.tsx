import React, { ReactNode, useState } from "react";
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

  const [language, setLanguage] = useState("FR");

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLanguage(event.target.value as string);
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
        <FormControl>
          <NativeSelect
            classes={{
              icon: classes.icon,
              root: classes.icon,
            }}
            value={language}
            onChange={handleChange}
          >
            <option className={classes.subIcon} value="FR">
              Français
            </option>
            <option className={classes.subIcon} value="EN">
              English
            </option>
            <option className={classes.subIcon} value="IT">
              Italiano
            </option>
          </NativeSelect>
        </FormControl>
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationAppBar;
