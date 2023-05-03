import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getVideos } from "lib/data";
import { amount } from "lib/config";
import prisma from "lib/prisma";
import Heading from "components/Heading";
import Videos from "components/Videos";
import LoadMore from "components/LoadMore";

export default function Home({ initialVideos }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [reachedEnd, setReachedEnd] = useState(initialVideos.length < amount);

  const loading = status === "loading";

  if (loading) {
    return null;
  }

  //if the user is logged in and does not have a name set up, redirect to /setup
  if (session && !session.user.name) {
    router.push("/setup");
  }

  return (
    <div>
      <Head>
        <title>YouTube Clone</title>
        <meta name="description" content="A great YouTube Clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Heading />

      {videos.length === 0 && (
        <p className="flex justify-center mt-20">No videos found!</p>
      )}
      <Videos videos={videos} />
      {!reachedEnd && (
        <LoadMore
          videos={videos}
          setVideos={setVideos}
          setReachedEnd={setReachedEnd}
        />
      )}
    </div>
  );
}

export async function getServerSideProps() {
  let videos = await getVideos({}, prisma);
  videos = JSON.parse(JSON.stringify(videos));

  return {
    props: {
      initialVideos: videos,
    },
  };
}
