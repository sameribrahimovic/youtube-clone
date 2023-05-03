import { amount } from "lib/config";

//get user from db
export const getUser = async (username, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};

//get videos from db
export const getVideos = async (options, prisma) => {
  const data = {
    where: {},
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    include: {
      author: true,
    },
  };
  //only return videos from specific user
  if (options.author) {
    data.where = {
      author: {
        id: options.author,
      },
    };
  }
  data.take = options.take || amount;
  //skip option, which is used for offset-based pagination
  if (options.skip) data.skip = options.skip;

  if (options.subscriptions) {
    const user = await prisma.user.findUnique({
      where: {
        id: options.subscriptions,
      },
      include: {
        subscribedTo: true,
      },
    });

    data.where = {
      authorId: {
        in: user.subscribedTo.map((channel) => channel.id),
      },
    };
  }

  const videos = await prisma.video.findMany(data);

  return videos;
};

//get single video from db
export const getVideo = async (id, prisma) => {
  const video = await prisma.video.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
    },
  });

  return video;
};

//subscribe funcionality related data

//return number of subscribers of a current user
export const getSubscribersCount = async (username, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      subscribers: true,
    },
  });

  return user.subscribers.length;
};

//to change to a green “Subscribed” button when user want to do subscription
export const isSubscribed = async (username, isSubscribedTo, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      subscribedTo: {
        where: {
          id: isSubscribedTo,
        },
      },
    },
  });
  //check if the user is subscribed to a chanel/other user
  return user.subscribedTo.length === 0 ? false : true;
};
