import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { useLeadStore } from '../stores/leadStore';
import { useTeamStore } from '../stores/teamStore';

const Dashboard = () => {
  const { users } = useUserStore();
  const { leads } = useLeadStore();
  const { teams } = useTeamStore();

  useEffect(() => {
    useUserStore.getState().fetchUsers();
    useLeadStore.getState().fetchLeads();
    useTeamStore.getState().fetchTeams();
  }, []);

  const totalUsers = users.length;
  const totalLeads = leads.length;
  const totalTeams = teams.length;

  const conversionRate = leads.length
    ? Math.round((leads.filter(l => l.status === 'Won').length / leads.length) * 100)
    : 0;

  const teamPerformance = teams.map(team => {
    const teamLeads = leads.filter(l => l.team_id === team.id);
    const won = teamLeads.filter(l => l.status === 'Won').length;
    const percent = teamLeads.length ? Math.round((won / teamLeads.length) * 100) : 0;

    return {
      name: team.name,
      percent,
      avatarColor: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'][Math.floor(Math.random() * 4)],
    };
  });

  const recentActivity = [
    ...users.slice(-3).reverse().map(u => ({
      icon: '👤',
      title: `New user: ${u.displayName}`,
      timestamp: 'Recently',
    })),
    ...leads.slice(-3).reverse().map(l => ({
      icon: '💼',
      title: `New lead: ${l.fullName}`,
      timestamp: 'Recently',
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">📊 CRM Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Users" value={totalUsers} icon="👥" color="from-blue-500 to-blue-700" />
        <StatCard title="Leads" value={totalLeads} icon="💼" color="from-green-500 to-green-700" />
        <StatCard title="Teams" value={totalTeams} icon="🧑‍🤝‍🧑" color="from-purple-500 to-purple-700" />
        <StatCard title="Conversion" value={`${conversionRate}%`} icon="📈" color="from-yellow-500 to-yellow-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">🏅 Team Performance</h2>
          <div className="space-y-6">
            {teamPerformance.map((team, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${team.avatarColor} text-center text-white font-bold`}>
                      {team.name.charAt(0)}
                    </div>
                    <span>{team.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{team.percent}%</span>
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${team.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">🕒 Recent Activity</h2>
          <ul className="space-y-5">
            {recentActivity.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <div
    className="bg-gradient-to-br rounded-xl p-6 shadow-lg flex justify-between items-center text-white transition-transform hover:scale-[1.02] duration-200"
    style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
  >
    <div>
      <p className="text-sm uppercase tracking-wide text-white/70">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <div className={`text-4xl ${color}`}>{icon}</div>
  </div>
);

export default Dashboard;
