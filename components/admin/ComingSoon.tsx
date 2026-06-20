import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <p className="font-medium text-gray-900">Coming soon</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
