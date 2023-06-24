import * as product from "./product"
import * as invite from "./invite"
import * as offer from "./offer"
import * as order from "./order"
import * as paymentMethod from "./payment-method"
import {View} from "../../../view";

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
  product.list,
  invite.create,
  invite.accept,
  offer.create,
  offer.list,
  order.create,
  order.list,
  order.checkoutReview,
  order.checkoutConfirmation,
  order.checkout,
  paymentMethod.create,
  paymentMethod.list,
  paymentMethod.select
];
