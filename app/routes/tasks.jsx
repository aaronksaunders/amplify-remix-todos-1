import { useFetcher, useLoaderData } from "@remix-run/react";
import { Auth } from "aws-amplify";
import { Heading } from "@aws-amplify/ui-react";
import { logout, requireUserId } from "../session.server";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { AWSAppSyncClient } from "../session.server";
import config from "../../src/aws-exports";
import gql from "graphql-tag";

/**
 * when page loads check server for verified user
 *
 * @param {*} param0
 * @returns
 */
export async function loader({ request }) {
  const response = await requireUserId(request, "/login");
  const { accessToken, idToken } = response || {};

  const client = new AWSAppSyncClient({
    url: config.aws_appsync_graphqlEndpoint,
    region: config.aws_appsync_region,
    auth: {
      type: config.aws_appsync_authenticationType,
      jwtToken: () => accessToken,
    },
    disableOffline: true,
    offlineConfig: {
      keyPrefix: "myPrefix",
    },
  });
  const { data } = await client.query({
    query: gql(`query MyQuery {
      listTasks {
        nextToken
        startedAt
        items {
          id
          description
          createdAt
        }
      }
    }
    `),
    authMode: config.aws_appsync_authenticationType,
  });
  console.log(data.listTasks.items);

  return json({ accessToken, idToken, tasks: data.listTasks.items });
}

/**
 * this action function is called when the user logs
 * out of the application. We call logout on server to
 * clear out the session cookies
 */
export const action = async ({ request }) => {
  console.log("in logout action");
  return await logout(request);
};

export default function Tasks() {
  const fetcher = useFetcher();
  const { accessToken, idToken, tasks } = useLoaderData();
  const [user, setUser] = useState();

  useEffect(() => {
    Auth.currentUserInfo().then((userInfo) => setUser(userInfo));
  }, [accessToken, idToken]);

  return (
    <div style={{ padding: 16 }}>
      <Heading level={3} textAlign="center">
        Private Page
      </Heading>
      <h3>
        {user && `Logged in with authenticated user ${user?.attributes?.email}`}{" "}
      </h3>
      <button
        className="ui button"
        type="button"
        onClick={async () => {
          // amplify sign out
          await Auth.signOut({ global: true });

          // clear out our session cookie...
          fetcher.submit({}, { method: "post" });
        }}
      >
        Log Out
      </button>
      <div className="ui segment">
        <h4>Data Loaded From Amplify</h4>
        {/* <pre>{JSON.stringify(tasks, null, 2)}</pre> */}
        <div className="ui list divided large relaxed">
          {tasks?.map((t) => {
            return <div className="ui item " key={t.id}>
              <div className="ui content">
              <div>{t.description}</div>
              <div>{t.createdAt}</div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
