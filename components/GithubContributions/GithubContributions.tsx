import { Octokit } from "@octokit/rest"
import { Repo, RepoWithContributions } from "@/types"
import { Card, BarChart, Title, Text } from "@tremor/react"
import { orderBy, remove } from "lodash"

export default async function GithubContributions() {
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

  const contributions: RepoWithContributions[] = await Promise.all(
    repos.map(async (repo: Repo): Promise<RepoWithContributions> => {
      const { data } = await octokit.repos.getContributorsStats({
        ...repo,
        state: "open",
      })

      return {
        repo,
        data,
      }
    }),
  )

  let totalContributions: any[] = []

  contributions.forEach((c) => {
    totalContributions.push(...c.data)
  })

  var totalContributionsCalculated: any = []

  totalContributions.reduce(function (res, value) {
    if (value.author.type !== "User") res
    if (!res[value.author.login]) {
      res[value.author.login] = { author: value.author.login, total: 0 }
      totalContributionsCalculated.push(res[value.author.login])
    }
    res[value.author.login].total += value.total
    return res
  }, {})

  totalContributionsCalculated = orderBy(
    totalContributionsCalculated,
    ["total"],
    ["desc"],
  )

  totalContributionsCalculated = remove(
    totalContributionsCalculated,
    (t: any) => {
      return t.total > 6
    },
  )

  return (
    <>
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
        Total contributions
      </h2>
      <Card className="mb-7">
        <Title>Top contributors</Title>
        <Text>Comparison between contributors</Text>
        <BarChart
          className="mt-4 h-80"
          data={totalContributionsCalculated}
          index="author"
          categories={["total"]}
          stack={false}
        />
      </Card>
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
        Contributions by Repo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contributions.map((c) => {
          return (
            <Card key={`${c.repo.owner}/${c.repo.repo}`}>
              <Title>
                {c.repo.owner}/{c.repo.repo}
              </Title>
              <Text>Comparison between contributors</Text>
              <BarChart
                className="mt-4 h-80"
                data={c.data}
                index="author.login"
                categories={["total"]}
                stack={false}
              />
            </Card>
          )
        })}
      </div>
    </>
  )
}
