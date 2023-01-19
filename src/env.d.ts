declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
      TWITTER_BEARER_TOKEN: string;
      MESSAGE_THREAD_ID: string;
      CHAT_ID: string;
    }
  }
}

export {}
