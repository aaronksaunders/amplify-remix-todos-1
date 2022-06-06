import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// AMPLIFY
import { Amplify } from "aws-amplify";
import config from "../src/aws-exports";
import styles from "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure({ ...config });

export function links() {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css",
    },
  ];
}

export function meta() {
  return {
    charset: "utf-8",
    title: "Amplify Remix Example",
    viewport: "width=device-width,initial-scale=1",
  };
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="ui container" style={{marginTop:40}}>
        <Authenticator.Provider>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </Authenticator.Provider>
      </body>
    </html>
  );
}
