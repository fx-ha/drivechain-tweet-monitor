declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
      TWITTER_BEARER_TOKEN: string;
      SERVER_URL: string;
      PORT: string;
      GITHUB_PERSONAL_ACCESS_TOKEN: string;
      GITHUB_GIST_ID: string;
    }
  }
}

export {}
