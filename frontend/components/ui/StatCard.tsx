interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.blue}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{title}</div>
    </div>
  );
}
