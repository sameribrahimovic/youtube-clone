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
  if (options.take) data.take = options.take;

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
