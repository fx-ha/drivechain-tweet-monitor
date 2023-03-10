import 'dotenv-safe/config'
import axios from 'axios'
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2'
import {
  CHAT_ID,
  MESSAGE_THREAD_ID,
  TELEGRAM_API,
  TWITTER_BEARER_TOKEN,
} from './consts'

const twitterClient = new TwitterApi(TWITTER_BEARER_TOKEN).readOnly.v2

const main = async (): Promise<void> => {
  try {
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
        { value: 'bip300' },
        { value: 'BIP300' },
        { value: 'bip-300' },
        { value: 'BIP-300' },
        { value: 'bip301' },
        { value: 'BIP301' },
        { value: 'bip-301' },
        { value: 'BIP-301' },
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
        tweet.data.referenced_tweets?.some(
          (tweet) => tweet.type === 'retweeted'
        )
      ) {
        return
      }

      // filter spam bots
      if (tweet.data.text.includes('???')) {
        return
      }

      // send msg to specific group
      await axios
        .post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: CHAT_ID,
          message_thread_id: MESSAGE_THREAD_ID,
          text: `https://fxtwitter.com/anyuser/status/${tweet.data.id}`,
        })
        .then(() => {})
        .catch((err) => console.error(err))
    })
  } catch (error) {
    console.error(error)
  }
}

main().catch((error) => {
  console.error(error)
})
