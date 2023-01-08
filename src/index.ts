import 'dotenv-safe/config'
import axios from 'axios'
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2'

const { TELEGRAM_TOKEN, TWITTER_BEARER_TOKEN, CHAT_ID, MESSAGE_THREAD_ID } =
  process.env

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`

const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN).readOnly.v2

const main = async (): Promise<void> => {
  // Get and delete old rules if needed
  const rules = await twitterClient.streamRules()
  if (rules.data?.length) {
    await twitterClient.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    })
  }

  // Add our rules
  await twitterClient.updateStreamRules({
    add: [{ value: 'drivechain' }, { value: 'drivechains' }],
  })

  const stream = await twitterClient.searchStream({
    'tweet.fields': ['referenced_tweets', 'author_id'],
    expansions: ['referenced_tweets.id'],
  })

  // Enable auto reconnect
  stream.autoReconnect = true

  stream.on(ETwitterStreamEvent.Data, async (tweet) => {
    const tweetLink = `https://twitter.com/anyuser/status/${tweet.data.id}`
    const tweetContent = tweet.data.text

    await axios
      .post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHAT_ID,
        message_thread_id: MESSAGE_THREAD_ID,
        text: `${tweetContent} ${tweetLink}`,
      })
      .then((resp) => console.log(resp))
      .catch((err) => console.error(err))
  })
}

main().catch((error) => {
  console.error(error)
})
