interface Activity {
  id: number;
  caregiverName: string;
  serviceType: string;
  date: string;
  duration: string;
}

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.caregiverName}</h3>
          <p className="text-lg text-gray-600 mb-2">{activity.serviceType}</p>
          <p className="text-base text-gray-500">{activity.date} • {activity.duration}</p>
        </div>
      </div>
    </div>
  );
}