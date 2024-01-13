import { Octokit } from "@octokit/rest"
import { filter } from "lodash"
import Stats from "../Stats/Stats"
import { Repo, RepoWithPullRequest } from "@/types"
import RepoCard from "../RepoCard/RepoCard"

const getBadgeColour = (prCount: number) => {
  if (prCount === 0) return "green"
  else if (prCount <= 5) return "amber"
  else return "red"
}

export default async function GithubPullRequests() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  })

  const repos: Repo[] = (
    JSON.parse(process.env.GITHUB_REPOS ?? "[]") ?? []
  ).map((r: string) => {
    const [owner, repo] = r.split("/")

    return {
      owner,
      repo,
    }
  })

  const pullRequests = await Promise.all(
    repos.map(async (repo: Repo): Promise<RepoWithPullRequest> => {
      const { data } = await octokit.pulls.list({
        ...repo,
        state: "open",
      })

      const PRs = filter(data, (data) => {
        return data.user?.type !== "Bot"
      })

      const countByBot = data.length - PRs.length
      const badgeColour = getBadgeColour(PRs.length)

      return {
        ...repo,
        title: `${repo.owner}/${repo.repo}`,
        titleUrl: `https://github.com/${repo.owner}/${repo.repo}`,
        count: PRs.length,
        countByBot,
        totalCount: data.length,
        badgeColour,
        data: PRs,
      }
    }),
  )

  const openList = filter(pullRequests, (pr) => {
    return pr.count > 0
  })

  const okList = filter(pullRequests, (pr) => {
    return pr.count === 0
  })

  return (
    <>
      <div className="my-7">
        <Stats
          title="Pull Request Overview"
          stats={[
            {
              name: "Open",
              stat: openList
                .reduce((total, repo) => total + repo.count, 0)
                .toString(),
            },
            {
              name: "Open by Bots",
              stat: [...openList, ...okList]
                .reduce((total, repo) => total + repo.countByBot, 0)
                .toString(),
            },
            {
              name: "Total open",
              stat: [...openList, ...okList]
                .reduce((total, repo) => total + repo.totalCount, 0)
                .toString(),
            },
          ]}
        />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
          Open Pull Requests
        </h2>
        {openList.map(async (repo) => RepoCard(repo))}
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 my-6">
          Other repos
        </h2>
        {okList.map(async (repo) => RepoCard(repo))}
      </div>
    </>
  )
}
