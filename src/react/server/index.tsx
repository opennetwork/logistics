import { Data, DataProvider } from "./data";
import { getOrigin } from "../../listen/config";
import { AnonymousLayout, Layout, LayoutProps } from "./layout";
import {ok} from "../../is";
import {View} from "../../view/types";

export interface HappeningServerProps extends Data {
  url: string;
  view: View;
}

export default function HappeningServer(options: HappeningServerProps) {
  const { pathname } = new URL(options.url, getOrigin());
  const { view: { Component } } = options;

  if (!Component) {
    return <div>Could not find {pathname}</div>;
  }

  let children = <Component />;

  if (!options.isFragment) {
    const layoutProps: LayoutProps = {
      url: options.url,
    };
    if (options.isAnonymous) {
      children = <AnonymousLayout {...layoutProps}>{children}</AnonymousLayout>;
    } else {
      children = <Layout {...layoutProps}>{children}</Layout>;
    }
  }

  return <DataProvider value={options}>{children}</DataProvider>;
}
