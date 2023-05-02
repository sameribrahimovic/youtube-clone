import Head from "next/head";
import Link from "next/link";
import prisma from "lib/prisma";
import { getUser, getVideos } from "lib/data.js";
import Heading from "components/Heading";
import Videos from "components/Videos";

export default function Channel({ user, videos }) {
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
      videos,
      user,
    },
  };
}
