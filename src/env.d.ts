declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      TELEGRAM_TOKEN: string;
      TWITTER_BEARER_TOKEN: string;
      CHAT_ID: string;
      MESSAGE_THREAD_ID: string;
    }
  }
}

export {}
