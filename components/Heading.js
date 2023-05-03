import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Heading() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const loading = status === "loading";

  //if state is still loading, nothing to show
  if (loading) {
    return null;
  }

  //otherwise return content!
  return (
    <header className="h-14 flex pt-5 px-5 pb-2">
      <div className="text-xl">
        {/* {router.asPath === "/" ? (
          <p>YouTube clone</p>
        ) : ( */}
        <Link href={`/`}>
          <a>YouTube clone</a>
        </Link>
        {/* )} */}
      </div>

      <div className="grow ml-10 -mt-1"></div>

      {session &&
        (router.asPath === "/subscriptions" ? (
          <a className="flex">
            <p className="mr-3 font-bold">Subscriptions</p>
          </a>
        ) : (
          <Link href={`/subscriptions`}>
            <a className="flex">
              <p className="mr-3 underline">Subscriptions</p>
            </a>
          </Link>
        ))}

      {/* add user info next to logout button */}
      {session && (
        <Link href={`/channel/${session.user.username}`}>
          <a className="flex">
            <img
              src={session.user.image}
              className="h-8 mr-2 mb-2 -mt-1 w-8 rounded-full"
              alt=""
            />
            <p className="mr-3">{session.user.name}</p>
          </a>
        </Link>
      )}

      <a
        className="flex-l border px-4 font-bold rounded-full"
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
      >
        {session ? "logout" : "login"}
      </a>
    </header>
  );
}
