import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userImputValues = request.body;
  const userUpdated = await user.update(username, userImputValues);
  return response.status(200).json(userUpdated);
}
