import 'dotenv-safe/config'
import axios from 'axios'
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2'
import express from 'express'
import bodyParser from 'body-parser'
import {
  CHAT_ID,
  GITHUB_GIST_ID,
  MESSAGE_THREAD_ID,
  PORT,
  TELEGRAM_API,
  TWITTER_BEARER_TOKEN,
  URI,
} from './consts'
import { getUsers, init, octokit } from './lib'

const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN).readOnly.v2

const main = async (): Promise<void> => {
  /* TWITTER SETUP */
  // Get and delete old rules if needed
  const rules = await twitterClient.streamRules()

  if (rules.data?.length) {
    await twitterClient.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    })
  }

  // Add our rules
  await twitterClient.updateStreamRules({
    add: [
      { value: 'drivechain' },
      { value: 'drivechains' },
      { value: 'Drivechain' },
      { value: 'Drivechains' },
      { value: 'DRIVECHAIN' },
      { value: 'DRIVECHAINS' },
      { value: 'BIP300' },
    ],
  })

  const stream = await twitterClient.searchStream({
    'tweet.fields': ['referenced_tweets', 'author_id'],
    expansions: ['referenced_tweets.id'],
  })

  // Enable auto reconnect
  stream.autoReconnect = true

  stream.on(ETwitterStreamEvent.Data, async (tweet) => {
    // Ignore RTs
    if (
      tweet.data.referenced_tweets?.some((tweet) => tweet.type === 'retweeted')
    ) {
      return
    }

    const tweetAuthorId = tweet.data.author_id
    const tweetAuthor = tweetAuthorId
      ? await twitterClient.user(tweetAuthorId)
      : undefined
    const tweetAuthorName = tweetAuthor?.data.username

    const tweetLink = `https://twitter.com/${
      tweetAuthorName || 'anyuser'
    }/status/${tweet.data.id}`
    const tweetContent = tweet.data.text

    const users = await getUsers()

    if (!users) {
      return
    }

    for (const user of users) {
      await axios
        .post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: user.chatId,
          // message_thread_id: MESSAGE_THREAD_ID,
          text: `${tweetContent} ${tweetLink}`,
        })
        .then((resp) => console.log(resp))
        .catch((err) => console.error(err))
    }

    // send msg to specific group
    await axios
      .post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHAT_ID,
        message_thread_id: MESSAGE_THREAD_ID,
        text: `${tweetContent} ${tweetLink}`,
      })
      .then((resp) => console.log(resp))
      .catch((err) => console.error(err))
  })

  /* SERVER SETUP */
  const app = express()
  app.use(bodyParser.json())

  // Add new users who send /start
  app.post(URI, async (req, res) => {
    const users = await getUsers()

    if (!users) {
      console.error('problem getting users')
      return
    }

    if (!req.body.message?.text?.includes('/start')) {
      console.log('spam, ignore')

      return
    }

    const chatId = req.body.message?.chat.id

    const existingChatIds = users.map((u) => u.chatId)

    if (!existingChatIds.includes(chatId)) {
      const newUsersArray = []

      for (const existingChatId of existingChatIds) {
        newUsersArray.push({ chatId: existingChatId })
      }

      newUsersArray.push({ chatId })

      await octokit.request(`PATCH /gists/${GITHUB_GIST_ID}`, {
        gist_id: GITHUB_GIST_ID,
        description: 'Add users',
        files: {
          'users.json': {
            content: JSON.stringify({ data: newUsersArray }),
          },
        },
      })
      return
    }

    return res.send()
  })

  app.listen(parseInt(PORT) || 3000, async () => {
    console.log(`app running on port ${PORT || 3000}`)

    await init()
  })
}

main().catch((error) => {
  console.error(error)
})
