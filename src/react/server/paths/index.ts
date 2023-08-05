import {View} from "../../../view";

import {
  PartnersView,
  SettingsView,
  HomeView,
  IndexView,
  OrganisationsView,
  FeedbackView,
  LogoutView,
  LoginView,
  ErrorsView,
  HappeningView,
  HappeningsView,
  CreateHappeningView,
  product,
  invite,
  offer,
  order,
  paymentMethod,
  userCredential,
  appointment,
  membership,
  service
} from "./views";

export * as namedViews from "./views";

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
  order.list,
  order.checkoutReview,
  order.checkoutConfirmation,
  order.checkoutConfirmed,
  order.checkout,
  order.history,
  paymentMethod.create,
  paymentMethod.list,
  paymentMethod.select,
  userCredential.list,
  appointment.create,
  appointment.list,
  appointment.view,
  membership.create,
  membership.list,
  membership.view,
  service.create,
  service.list
];

export * from "./types";