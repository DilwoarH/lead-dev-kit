import { PullRequest, RepoWithPullRequest } from "@/types"
import { CheckIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import Image from "next/image"
import Link from "next/link"

export default function RepoCard(repo: RepoWithPullRequest) {
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
          ) : (
            <CheckIcon className="h-7 w-7 mt-1 text-green-600 bg-green-50 border p-1 rounded-lg" />
          )}
        </div>
        <div className="mt-1">
          <h3 className={repo.count ? "text-lg font-bold" : ""}>
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
          {repo.count ? (
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
          ) : null}
        </div>
      </div>
    </section>
  )
}
