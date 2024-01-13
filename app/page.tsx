import GithubPullRequests from "@/components/GithubPullRequests/GithubPullRequests"

export default function Home() {
  return (
    <main className="p-4">
      <div className="mb-10">
        <p className="text-base font-semibold leading-7 text-blue-600">
          Your favourite tools as a leader
        </p>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Lead Dev Kit
        </h1>
      </div>

      <GithubPullRequests />
    </main>
  )
}
