
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";

/**
 * check for authenticated user, if not redirect to
 * login
 *
 * @param {*} param0
 * @returns
 */
export async function loader({ request }) {
  const id = await requireUserId(request, "/login");
  return redirect("/tasks");
}