import { FunctionComponent } from "react";
import { Partners } from "./partners";
import { Settings } from "./settings";
import { Home } from "./home";
import { Organisations } from "./organisations";
import { Feedback, submit as feedbackSubmit } from "./feedback";
import { Login } from "./login";
import { Logout, handler as logoutHandler } from "./logout";
import { Errors } from "./error";
import { HappeningPage, handler as happeningHandler } from "./happening";
import { HappeningsPage, handler as happeningsHandler } from "./happenings";
import { CreateHappeningPage, submit as createHappeningSubmit } from "./create-happening";
import * as product from "./product"

export const paths: Record<string, FunctionComponent> = {
  "/": Home,
  "/home": Home,
  "/partners": Partners,
  "/settings": Settings,
  "/organisations": Organisations,
  "/feedback": Feedback,
  "/login": Login,
  "/logout": Logout,
  "/error": Errors,
  "/happenings": HappeningsPage,
  "/happening/create": CreateHappeningPage,
  "/happening/:happeningId": HappeningPage,
  "/products": product.list.ListProducts,
  "/product/create": product.create.CreateProduct
};

export const pathsAnonymous: Record<string, boolean> = {
  "/home": true,
  "/": true,
  "/feedback": true,
  "/calculator": true,
  "/login": true,
  "/happenings": true,
  "/products": true,
  "/happening/create": true,
  "/happening/:happeningId": true
};

export const pathsSubmit: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/feedback": feedbackSubmit,
  "/happening/create": createHappeningSubmit,
  "/product/create": product.create.submit
};

export const pathsHandler: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/logout": logoutHandler,
  "/happenings": happeningsHandler,
  "/happening/:happeningId": happeningHandler
};

export const pathsCache: Record<string, boolean> = {
  "/": false,
  "/home": false,
  "/partners": true,
  "/settings": false,
  "/organisations": true,
  "/feedback": false,
  "/login": false,
  "/logout": false,
  "/error": false,
  "/products": true
};
