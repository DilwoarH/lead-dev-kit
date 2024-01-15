import GithubPullRequests from "@/components/GithubPullRequests/GithubPullRequests"

export const revalidate = 60 // revalidate every minute

export default function Home() {
  return (
    <main className="p-4 bg-gray-50">
      <div className="mb-10">
        <p className="text-base font-semibold leading-7 text-blue-600">
          {process.env.COMPANY_NAME ?? "LeadDevKit"}
        </p>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Development Team Overview
        </h1>
      </div>

      <GithubPullRequests />
    </main>
  )
}
