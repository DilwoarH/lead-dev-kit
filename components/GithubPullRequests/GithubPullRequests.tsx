import { Octokit } from "@octokit/rest"
import Link from "next/link"

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
        const pullRequests = await octokit.pulls.list({
          ...repo,
          state: "open",
        })

        const badgeColour = getBadgeColour(pullRequests.data.length)

        return (
          <section
            key={repo.repo}
            className="mb-4 p-4 border shadow rounded-md"
          >
            <div className="flex flex-1">
              <div
                className={`mr-4 inline-flex items-center rounded-md  p-7 text-7xl font-medium ring-1 ring-inset bg-${badgeColour}-50 text-${badgeColour}-700 ring-${badgeColour}-600/10`}
              >
                {pullRequests.data.length}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">
                  {repo.owner}/{repo.repo}
                </h3>
                {pullRequests.data.length ? (
                  <ul className="list-disc list-inside">
                    {pullRequests.data.map((pr) => (
                      <li key={pr.id}>
                        <Link
                          href={pr.html_url}
                          className="underline"
                          target="_blank"
                        >
                          {pr.title}
                        </Link>
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
