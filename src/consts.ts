export const {
  TELEGRAM_TOKEN,
  TWITTER_BEARER_TOKEN,
  SERVER_URL,
  PORT,
  GITHUB_PERSONAL_ACCESS_TOKEN,
  GITHUB_GIST_ID,
  CHAT_ID,
  MESSAGE_THREAD_ID,
} = process.env

export const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
export const URI = `/webhook/${TELEGRAM_TOKEN}`
export const WEBHOOK_URL = SERVER_URL + URI
