import { define, html } from "@unbndl/html";
import { Auth } from "@unbndl/auth";
import { BrowserHistory, Switch } from "@unbndl/switch";
import { BlzHeaderElement } from "./components/blz-header";
import { HomeViewElement } from "./views/home-view";
import { ChallengeViewElement } from "./views/challenge-view";

const routes: Switch.Route[] = [
  {
    path: "/",
    redirect: "/app"
  },
  {
    path: "/app/challenges/:id",
    auth: "protected",
    view: html<[Switch.Args]>`
      <challenge-view challenge-id=${(route) => route.params.id}></challenge-view>
    `
  },
  {
    path: "/app",
    auth: "protected",
    view: html`
      <home-view></home-view>
    `
  }
];

class RouterSwitchElement extends Switch.Element {
  constructor() {
    super(routes);
  }
}

define({
  "auth-provider": Auth.Provider,
  "history-provider": BrowserHistory.Provider,
  "router-switch": RouterSwitchElement,
  "blz-header": BlzHeaderElement,
  "home-view": HomeViewElement,
  "challenge-view": ChallengeViewElement
});
