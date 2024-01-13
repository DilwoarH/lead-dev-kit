import { Octokit } from "@octokit/rest"
import Link from "next/link"
import moment from "moment"
import { filter } from "lodash"
import Image from "next/image"
import { CheckIcon } from "@heroicons/react/24/outline"

type repo = {
  owner: string
  repo: string
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

  const repos: repo[] = (
    JSON.parse(process.env.GITHUB_REPOS ?? "[]") ?? []
  ).map((r: string) => {
    const [owner, repo] = r.split("/")

    return {
      owner,
      repo,
    }
  })

  return (
    <>
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
        Open Pull Requests
      </h2>
      {repos.map(async (repo: repo) => {
        const { data } = await octokit.pulls.list({
          ...repo,
          state: "open",
        })

        const PRs = filter(data, (data) => {
          return data.user?.type === "User"
        })

        const botPrCount = data.length - PRs.length

        const badgeColour = getBadgeColour(PRs.length)

        return (
          <section
            key={repo.repo}
            className="mb-4 p-4 border shadow rounded-md"
          >
            <div className="sm:flex">
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                {PRs.length ? (
                  <div
                    className={`mr-4 inline-flex items-center rounded-md  p-7 text-7xl font-medium ring-1 ring-inset bg-${badgeColour}-50 text-${badgeColour}-700 ring-${badgeColour}-600/10`}
                  >
                    {PRs.length}
                  </div>
                ) : (
                  <CheckIcon className="h-5 w-5 mt-2 text-emerald-700" />
                )}
              </div>
              <div className="mt-1">
                <h4 className="text-lg font-bold">
                  <Link
                    href={`https://github.com/${repo.owner}/${repo.repo}`}
                    className="cursor-pointer"
                    target="_blank"
                  >
                    {repo.owner}/{repo.repo}
                  </Link>
                  {botPrCount ? ` - (${botPrCount} PRs raised by bots)` : null}
                </h4>
                {PRs.length ? (
                  <ul className="list-disc list-inside">
                    {PRs.map((pr) => (
                      <li key={pr.id}>
                        <Link
                          href={pr.html_url}
                          className="underline"
                          target="_blank"
                        >
                          {pr.title} (#{pr.number})
                        </Link>{" "}
                        - <strong>{moment(pr.updated_at).fromNow()}</strong> -{" "}
                        {pr.user?.type === "Bot" ? "🤖" : pr.user?.login}{" "}
                        {pr.user?.avatar_url ? (
                          <Image
                            height={10}
                            width={10}
                            src={pr.user?.avatar_url}
                            alt={pr.user?.name ?? ""}
                            className="h-5 w-5 inline-block"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No open PRs 🎉</p>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
