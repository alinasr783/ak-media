import { SkeletonLine } from './skeleton'

export default function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 text-start"><SkeletonLine width={80} height={14} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t border-border">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="p-3"><SkeletonLine height={16} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

