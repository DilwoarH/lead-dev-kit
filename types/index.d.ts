export type Repo = {
  owner: string
  repo: string
}

export type PullRequest = {
  id: number
  html_url: string
  title: string
  number: number
  updated_at: string
  user: {
    login: string | null
    avatar_url: string | null
  }
}

export type RepoWithPullRequest = {
  owner: string
  repo: string
  title: string
  titleUrl: string
  count: number
  countByBot: number
  totalCount: number
  badgeColour: string
  data: any
}
