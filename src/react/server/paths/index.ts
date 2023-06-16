import * as product from "./product"
import {View} from "../../../view/types";

import * as PartnersView from "./partners";
import * as SettingsView from "./settings";
import * as HomeView from "./home";
import * as IndexView from "./home-index";
import * as OrganisationsView from "./organisations";
import * as FeedbackView from "./feedback";
import * as LoginView from "./login";
import * as LogoutView from "./logout";
import * as ErrorsView from "./error";
import * as HappeningView from "./happening";
import * as HappeningsView from "./happenings";
import * as CreateHappeningView from "./create-happening";

export const views: View[] = [
  PartnersView,
  SettingsView,
  HomeView,
  IndexView,
  OrganisationsView,
  FeedbackView,
  LoginView,
  LogoutView,
  ErrorsView,
  HappeningView,
  HappeningsView,
  CreateHappeningView,
  product.create,
  product.list
];
