YOUTUBE-CLONE Project

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
