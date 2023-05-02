import Head from "next/head";
import { getVideos } from "lib/data";
import prisma from "lib/prisma";
import Heading from "components/Heading";
import Videos from "components/Videos";

export default function Home({ videos }) {
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
    </div>
  );
}

export async function getServerSideProps() {
  let videos = await getVideos({}, prisma);
  videos = JSON.parse(JSON.stringify(videos));

  return {
    props: {
      videos,
    },
  };
}
