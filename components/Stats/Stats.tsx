type Stat = { name: string; stat: string }
type Props = {
  title: string
  stats: Stat[]
}

export default function Stats({ title, stats }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
        {title}
      </h2>
      <dl className={`mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3`}>
        {stats.map((item: Stat) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {item.stat}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
