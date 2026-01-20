import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userImputValues = request.body;
  const newUser = await user.create(userImputValues);
  return response.status(201).json(newUser);
}
