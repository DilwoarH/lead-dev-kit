import { Octokit, RestEndpointMethodTypes } from "@octokit/rest"
import Link from "next/link"
import moment from "moment"
import { filter } from "lodash"
import Image from "next/image"
import { CheckIcon } from "@heroicons/react/24/outline"
import Stats from "../Stats/Stats"

type Repo = {
  owner: string
  repo: string
}

type PullRequest = {
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

type RepoWithPullRequest = {
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
              name: "Open by Bot",
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
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
        Open Pull Requests
      </h2>
      {openList.map(async (repo) => {
        return (
          <section
            key={repo.repo}
            className="mb-4 p-4 border shadow-sm rounded-lg bg-white"
          >
            <div className="sm:flex">
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                {repo.data.length ? (
                  <div
                    className={`mr-4 w-36 inline-flex items-center rounded-lg  p-7 text-7xl font-medium ring-1 ring-inset bg-${repo.badgeColour}-50 text-${repo.badgeColour}-700 ring-${repo.badgeColour}-600/10`}
                  >
                    <span className="mx-auto">{repo.data.length}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-1">
                <h3 className="text-lg font-bold">
                  <Link
                    href={repo.titleUrl}
                    className="cursor-pointer"
                    target="_blank"
                  >
                    {repo.title}
                  </Link>
                  {repo.countByBot
                    ? ` - (${repo.countByBot} PRs raised by bots)`
                    : null}
                </h3>
                <ul className="list-disc list-inside">
                  {repo.data.map((pr: PullRequest) => (
                    <li key={pr.id}>
                      <Link
                        href={pr.html_url}
                        className="underline"
                        target="_blank"
                      >
                        {pr.title} (#{pr.number})
                      </Link>{" "}
                      - <strong>{moment(pr.updated_at).fromNow()}</strong> -
                      {pr.user?.login}{" "}
                      {pr.user?.avatar_url ? (
                        <Image
                          height={10}
                          width={10}
                          src={pr.user?.avatar_url}
                          alt={pr.user?.login ?? ""}
                          className="h-5 w-5 inline-block"
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )
      })}

      <h2 className="text-xl font-bold tracking-tight text-gray-900 my-6">
        Other repos
      </h2>
      {okList.map(async (repo) => {
        return (
          <section
            key={repo.repo}
            className="mb-4 p-4 border rounded-lg bg-white"
          >
            <div className="sm:flex">
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <CheckIcon className="h-7 w-7 mt-1 text-green-600 bg-green-50 border p-1 rounded-lg" />
              </div>
              <div className="mt-1 self-center">
                <p>
                  <Link
                    href={repo.titleUrl}
                    className="cursor-pointer hover:underline"
                    target="_blank"
                  >
                    {repo.title}
                  </Link>
                  {repo.countByBot
                    ? ` - (${repo.countByBot} PRs raised by bots)`
                    : null}
                </p>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
