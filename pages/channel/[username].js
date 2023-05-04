import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession, getSession } from "next-auth/react";
import { amount } from "lib/config";
import prisma from "lib/prisma";
import {
  getUser,
  getVideos,
  getSubscribersCount,
  isSubscribed,
} from "lib/data.js";
import Heading from "components/Heading";
import Videos from "components/Videos";
import LoadMore from "components/LoadMore";
import SubscribedButton from "components/SubscribedButton";

export default function Channel({
  user,
  initialVideos,
  subscribers,
  subscribed,
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [reachedEnd, setReachedEnd] = useState(initialVideos.length < amount);
  const { data: session, status } = useSession();

  const loading = status === "loading";

  if (loading) {
    return null;
  }

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
              <div className="">
                <div className="">
                  <div className="text-gray-400">{subscribers} subscribers</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 mr-5">
            {/* if user is on it's own profile do not show subscribe button, else 
            if user visiting other users profile, show that button */}
            {session && user.id === session.user.id ? (
              <>
                {/* show this link only if user is accesing its own chanel */}
                <Link href={`/upload`}>
                  <a className="bg-green-500 px-3 py-2  rounded-md">
                    Upload new video
                  </a>
                </Link>
              </>
            ) : (
              <SubscribedButton user={user} subscribed={subscribed} />
            )}
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
  const subscribers = await getSubscribersCount(
    context.params.username,
    prisma
  );

  const session = await getSession(context);

  let subscribed = null;
  if (session) {
    subscribed = await isSubscribed(session.user.username, user.id, prisma);
  }

  return {
    props: {
      initialVideos: videos,
      user,
      subscribers,
      subscribed,
    },
  };
}
