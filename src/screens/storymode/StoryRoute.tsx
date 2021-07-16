import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { getQueryOrDefault } from "../../utils/gameUtils";
import Story from "./Story";
import ad from "../games/lesion/AdventureItems";

type StoryRouteProps = Omit<RouteComponentProps<never>, "match">;

const StoryRoute: React.FC<StoryRouteProps> = ({ history, location }: StoryRouteProps) => {
  const query = new URLSearchParams(location.search);

  const number = ad.length;
  const actual = getQueryOrDefault(query.get("actual"), 0);

  const actualParam = `actual=${actual}`;

  const search = `?${actualParam}`;

  if (location.search !== search) {
    history.replace(`/story${search}`);
  }

  return <Story number={number} actual={actual} />;
};

export default StoryRoute;
