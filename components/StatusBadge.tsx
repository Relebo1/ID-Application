const styles: Record<string, string> = {
  Pending:    "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "Under Review": "bg-blue-100 text-blue-800 border border-blue-300",
  Approved:   "bg-green-100 text-green-800 border border-green-300",
  Rejected:   "bg-red-100 text-red-800 border border-red-300",
  "Ready for Collection": "bg-purple-100 text-purple-800 border border-purple-300",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
