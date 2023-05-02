import { useState } from "react";
import Head from "next/head";
import { amount } from "lib/config";
import prisma from "lib/prisma";
import { getUser, getVideos } from "lib/data.js";
import Heading from "components/Heading";
import Videos from "components/Videos";
import LoadMore from "components/LoadMore";

export default function Channel({ user, initialVideos }) {
  const [videos, setVideos] = useState(initialVideos);
  const [reachedEnd, setReachedEnd] = useState(initialVideos.length < amount);
  if (!user)
    return <p className="text-center p-5">Channel does not exist 😞</p>;

  return (
    <>
      <Head>
        <title>Channel of {user.name}</title>
        <meta name="description" content={`Channel of ${user.name}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Heading />
      <div>
        <div className="flex justify-between">
          <div className="flex m-5">
            {user.image && (
              <img
                className="w-20 h-20 mt-2 mr-2 rounded-full"
                src={user.image}
              />
            )}
            <div className="mt-5">
              <p className="text-lg font-bold">{user.name}</p>
            </div>
          </div>
        </div>
        <div>
          <Videos videos={videos} />

          {!reachedEnd && (
            <LoadMore
              videos={videos}
              setVideos={setVideos}
              setReachedEnd={setReachedEnd}
              author={user}
            />
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  //we have the username in context.params.username
  let user = await getUser(context.params.username, prisma);
  user = JSON.parse(JSON.stringify(user));

  let videos = await getVideos({ author: user.id }, prisma);
  videos = JSON.parse(JSON.stringify(videos));

  return {
    props: {
      initialVideos: videos,
      user,
    },
  };
}
