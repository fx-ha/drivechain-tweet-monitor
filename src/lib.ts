import axios from 'axios'
import { Octokit } from 'octokit'
import {
  GITHUB_GIST_ID,
  GITHUB_PERSONAL_ACCESS_TOKEN,
  TELEGRAM_API,
  WEBHOOK_URL,
} from './consts'

export const octokit = new Octokit({
  auth: GITHUB_PERSONAL_ACCESS_TOKEN,
})

export const getUsers = async (): Promise<{ chatId: string }[] | undefined> => {
  const gist = await octokit.request(`GET /gists/${GITHUB_GIST_ID}`, {
    gist_id: GITHUB_GIST_ID,
  })

  const gistContent = gist.data?.files?.['users.json']?.content

  return gistContent ? JSON.parse(gistContent).data : undefined
}

export const init = async () => {
  const resp = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
  console.log(resp.data)
}
