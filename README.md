YOUTUBE-CLONE Project
~ used technologies: NextJs, React, Postgres with Prisma for DB management stored on Railways,
~ live link : sm-youtube-clone.vercel.app/

Project contains :

- a homepage
  - lists all the most recent videos, in reverse chronological order until the site grows and we’ll introduce an algorithm
- a subscriptions page
  - just for site logged in users, will list all videos of channels you’re subscribed to
- a channel page
  - lists the videos of a user
- a single video page

  - this is shown when a video is clicked, plays the video and hosts the comments

- When a video page is opened, increment the views.
- Logged in users can subscribe to a channel, and unsubscribe.
- Each channel will have a count of subscribers.
- Videos, from channels a user is subscribed to, will be visible in reverse chronological order in their subscriptions page.

- Users can upload videos to platform. The user will set a title for the video.

URL structure :

- Homepage: `/`
- Subscriptions page: `/subscriptions` (not same as the YT one, but close
- Channel page: `/channel/<USERNAME>`
- Single video page: `/video/<ID>`

1. Data model

- video model :
  A video has an `id`, a `title`, and a `url` of the video file. It has a thumbnail URL. It has a creation date and holds a views counter. A video has a length.

A video can be public, unlisted or private. We’ll store that information as a `visibility` string:
model Video {
id String @id @default(cuid())
title String
url String
thumbnail String
views Int @default(0)
length Int @default(0)
visibility String
createdAt DateTime @default(now())
}

- A video has an author/owner, a user:

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String

- In User model add relation :
  Video Video[]

- User can subscribe to other users or chanels, and chanel can have zero or manu users.
  Here we need many to many relationship :

model User {
//...

subscribers User[] @relation("Subscribers")
subscribedTo User[] @relation("Subscribers")
}

2. Add test data using @faker-js/faker :

- npm install -D @faker-js/faker
- Create a pages/utils.js that contains 2 'tasks' to /api/utils :

  - `generate_content` to generate random users, random videos, random comments, likes, views.
  - `clean_database` to remove all content from the database

3. Fill db with sample data

- create AWS account and upload some sample videos and images to bucket,
- in terminal run : npm install aws-sdk,
- add import import AWS from 'aws-sdk' to /api/utils.js

4. Home page

- add data fetching function getVideos() in lib/data.js to get all videos from db,
- import earlier created function in index.js for use there,
- crete two new components Video.js and Videos.js - which iterates over the videos and prints them,
- add getServerSideProps(),
- in next.config.js add AWS S3 domains so we can use next Image,
- install timeAgo library and configure it in /lib/data.js,
- add links to a single page, and user profile

5. Single video page

- Create the file pages/video/[id].js
- Create a getVideo function in lib/data.js - through this, we get the details of a video, including the author info,
- install package for video player - npm install react-player
- Import in [id].js :

  - import dynamic from 'next/dynamic',
  - const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

- add into jsx :
  <ReactPlayer
          className='react-player absolute top-0 left-0'
          url={video.url}
          width='100%'
          height='100%'
          controls={true}
          light={video.thumbnail}
        />
- split scree on 2/3 for main video, and 1/3 for side bar that show 3 more videos from db
  using Tailwind md:w-2/3 and md:w-1/3
- modify getVideos() to get only 3 videos on home page using "take" prisma parameter
  to limit the nymber of returned items,
  /lib/data.js :
  if (options.take) data.take = options.take

  pages/video/[id].js :
  let videos = await getVideos({}, prisma)
  let videos = await getVideos({ take: 3 }, prisma)

6. User(Chanel) profile page

- Each user has a channel on the URL channel/<USERNAME>
- create a file pages/channel/[username].js
- getUser() to get user from db - add into lib/data.js,
- change getVideos() to only return the videos of a particular person
- print the user’s information, and use the components/Videos component to list the user’s videos
  - import Videos from 'components/Videos'
  - import Link from 'next/link'

7. Pagination

- Idea is to show some videos, and hva a load more button to load more videos,
- Limit to 3 videos that can be displayed on the home page,
- Create a lib/config.js to stor ammount of videos that can be displayed on page
- import amount from config.js into data.js and use that as a default value for take :
  data.take = options.take || amount
- add load more button as component and import in index.js
- When the button is clicked we’ll fire a GET API request to /api/videos.js to get more videos,
- in components/LoadMore.js call this onClick event to load more videos from db
- pass the list of videos to LoadMore:
  <LoadMore videos={videos} />

- So it can pass the length of this videos array as the skip parameter:

  export default function LoadMore({ videos }) {
  ...
  onClick={async () => {
  const url = `/api/videos?skip=${videos.length}`
  ...

- declare the videos state using useState, setting the initial state to the value of initialVideos :

export default function Home({ initialVideos }) {
const [videos, setVideos] = useState(initialVideos)
...
<LoadMore videos={videos} setVideos={setVideos} />
}

- inside LoadMore we can update the videos list using setVideos:
  export default function LoadMore({ videos, setVideos }) {
  ...
  setVideos([...videos, ...data])

- create a reachedEnd state variable and use it to conditionally show the LoadMore component, and we pass setReachedEnd to LoadMore:

export default function Home({ initialVideos }) {
const [videos, setVideos] = useState(initialVideos)
const [reachedEnd, setReachedEnd] = useState(false)
...
<Videos videos={videos} />
{!reachedEnd && (
<LoadMore
          videos={videos}
          setVideos={setVideos}
          setReachedEnd={setReachedEnd}
        />
)}
}

- Inside components/LoadMore.js set reachedEnd to true if reached the end of the list, which means the number of videos returned is less than the value of amount:
  - export default function LoadMore({ videos, setVideos, setReachedEnd }) {
    ...
    if (data.length < amount) {
    setReachedEnd(true)
    }
    ...
    }

8. Implement login, create profile by choosing name, username and avata

- First we add a login button in the Heading component,
- In pages/index.js redirect to the /setup route if the user does not have a name set up:
  if (session && !session.user.name) {
  router.push('/setup')
  }
- Create that page in pages/setup.js and POST form in it to send POST request to /api/setup endpoint,
- use a middleware : npm install multiparty next-connect@0.12.2
- Create the file middleware/middleware.js - to make the files information available in the API route,
- Create lib/upload.js,
- Create pages/api/setup.js where we set up the API route to use the middleware created,
- since we already have created user, all we need to do is to update it's data in /api/setup endpoint

9. User info next to logout button

- if the user is logged in, we need to show it's username and avatar next to logout btn,
- In components/Heading.js :
  {session && (
  <Link href={`/channel/${session.user.username}`}>
  <a className='flex'>
  <img
              src={session.user.image}
              className='h-8 mr-2 mb-2 -mt-1 w-8 rounded-full'
            />
  <p className='mr-3'>{session.user.name}</p>
  </a>
  </Link>

10. Subscriptions

Planing:

1. show the subscribers count in the channels pages

2. add a button on the channels to subscribe. Once subscribed, this will turn into an unsubscribe button
3. have a “subscriptions” page that lists the videos of the people you’re subscribed to

~ Show the subscribers count

- In lib/data.js add a getSubscribersCount() function that given a username returns the number of subscribers,
- In pages/channel/[username].js import and use this in getServerSideProps() and pass its return value to the component as a prop,

~ Allow users to subscribe and show the subscribed state

- Create a components/SubscribedButton.js file, and import in pages/channel/[username].js
- when user clik on subscribe button, send POST request to /api/subscribe with the subscribeTo data,
- create the file pages/api/subscribe.js in wich we first validate the existance of the current user, and the user you want to subscribe to,
- Finally we create a subscription using a special syntax that uses connect to connect 2 users together via the subscribedTo relation, as it’s a many-to-many self relation in the database:
  ...
  connect: [{ id: req.body.subscribeTo }],
  ...
- also create a unsubsrcibe.js to allow users to unsubscribe from user/chanel - It’s the same code as subscribe, except it uses disconnect to delete the relation:
  ...
  disconnect: [{ id: req.body.unsubscribeTo }],
  ...

~ Add a subscriptions page

- Create a pages/subscriptions.js - similar code like index.js but we pass a subscriptions parameter with the value of the current user id:
  let videos = await getVideos({ subscriptions: session.user.id }, prisma)
- link to this page in the Heading component

11. Increment views

- video/[id].js import { useEffect }, and add in SingleVideo function that useEffect to fire side effect. In this case we want to increment views,
- also create pages/api/view.js endpoint and add logic to update videto by incrementig its views for 1 :
  await prisma.video.update({
  where: { id: req.body.video },
  data: {
  views: {
  increment: 1,
  },
  },
  })

- if user has a video with 0 views, changde code in pages/video/[id].js
  and add {video.views + 1} views

12. Post new video

- In the pages/channel/[username].js file add a link to /upload if the current channel is the user’s own channel,
- in pages add new upload.js file that contains form with 3 fields:
  a title, a thumbnail image and the video file,
- add endpoint pages/api/upload.js - where we receive data from upload.js form and we use the upload function from lib/upload.js to upload the files to S3 and get their URLs, which we put in the database when we create a new video entry,

//TODO

- Hide the “Subscribe” button if the user is not logged in,
- Add the ability to write comments,
- Let logged in users like/dislike videos,
- Add a “played” flag when a logged in user views a video,
- Allow to change the visibility of a video :
  Videos could be set in 2 ways: public or private,
- In the single video page show other videos from the author’s channel,
- List somewhere the channels user is subscribed to...
