import prisma from "lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(501).end();
  }

  const session = await getSession({ req });

  if (!session) return res.status(401).json({ message: "Not logged in" });

  //get user from db
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return res.status(401).json({ message: "User not found" });

  //serch the user we want to subscribe to
  const userToSubscribeTo = await prisma.user.findUnique({
    where: {
      id: req.body.subscribeTo,
    },
  });

  //if the user that we want to subscribe to does not exist, return error page!
  if (!userToSubscribeTo) {
    return res.status(401).json({ message: "User not found" });
  }

  //uprade current user
  await prisma.user.update({
    where: { id: session.user.id },
    //connect current user with the user we want to subsrcibe to!
    data: {
      subscribedTo: {
        connect: [{ id: req.body.subscribeTo }],
      },
    },
  });

  res.end();
}
