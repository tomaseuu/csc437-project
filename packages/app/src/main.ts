import { define, html } from "@unbndl/html";
import { Auth } from "@unbndl/auth";
import { Store } from "@unbndl/store";
import { BrowserHistory, Switch } from "@unbndl/switch";
import { BlzHeaderElement } from "./components/blz-header";
import { HomeViewElement } from "./views/home-view";
import { ChallengeViewElement } from "./views/challenge-view";
import { Model, init } from "./model";
import { Msg } from "./messages";
import { update, Cmd } from "./update";

const routes: Switch.Route[] = [
  {
    path: "/",
    redirect: "/app",
  },
  {
    path: "/app/challenges/:id",
    auth: "protected",
    view: html<[Switch.Args]>`
      <challenge-view
        challenge-id=${(route) => route.params.id}
      ></challenge-view>
    `,
  },
  {
    path: "/app",
    auth: "protected",
    view: html` <home-view></home-view> `,
  },
];

class RouterSwitchElement extends Switch.Element {
  constructor() {
    super(routes);
  }
}

class AppStoreElement extends Store.Provider<Model, Msg, Cmd> {
  constructor() {
    super(update, init);
  }
}

define({
  "auth-provider": Auth.Provider,
  "history-provider": BrowserHistory.Provider,
  "store-provider": AppStoreElement,
  "router-switch": RouterSwitchElement,
  "blz-header": BlzHeaderElement,
  "home-view": HomeViewElement,
  "challenge-view": ChallengeViewElement,
});
