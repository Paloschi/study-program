import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import session from "models/session.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  console.log("Controller Session object:", sessionObject);
  const renewedSessionObject = await session.renew(sessionObject.id);
  console.log("Controller Renewed session object:", renewedSessionObject);
  const userFound = await user.findOneById(sessionObject.user_id);

  await controller.setSessionCookie(renewedSessionObject.token, response);
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response.status(200).json(userFound);
}
