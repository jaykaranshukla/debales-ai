'use client';
import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import { useToggleIntegration } from '@/hooks/useIntegrations';

interface Props {
  projectSlug: string;
  projectName: string;
}

// ─── Widget renderers ─────────────────────────────────────────────────────────
function StatsCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-2" data-testid="stats-card">
      <span className="text-xs font-medium text-[#555570] uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-semibold text-white tabular-nums">{value ?? '—'}</span>
    </div>
  );
}

function IntegrationCard({
  integration,
  onToggle,
  pending,
}: {
  integration: { _id: string; type: 'shopify' | 'crm'; name: string; enabled: boolean };
  onToggle: (type: 'shopify' | 'crm', enabled: boolean) => void;
  pending: boolean;
}) {
  const icons: Record<string, string> = {
    shopify: '🛒',
    crm: '📊',
  };
  const descriptions: Record<string, string> = {
    shopify: 'Injects live product, order, and revenue data into AI context',
    crm: 'Injects lead, customer, and pipeline data into AI context',
  };

  return (
    <div
      className={`glass rounded-xl p-5 flex items-start justify-between gap-4 transition-all ${
        integration.enabled ? 'border-indigo-500/30' : ''
      }`}
      data-testid="integration-card"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[integration.type] ?? '🔌'}</span>
        <div>
          <div className="font-medium text-white text-sm">{integration.name}</div>
          <div className="text-xs text-[#555570] mt-0.5 max-w-[260px]">{descriptions[integration.type]}</div>
          <span
            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
              integration.enabled
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-white/5 text-[#555570]'
            }`}
          >
            {integration.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <button
        onClick={() => onToggle(integration.type, !integration.enabled)}
        disabled={pending}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-0.5 ${
          integration.enabled ? 'bg-indigo-600' : 'bg-[#2e2e4e]'
        } disabled:opacity-50`}
        data-testid={`toggle-${integration.type}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            integration.enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function RecentConversations({ conversations }: { conversations: Array<{ _id: string; title: string; updatedAt: string }> }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="glass rounded-xl p-5 text-center">
        <p className="text-sm text-[#555570]">No conversations yet</p>
      </div>
    );
  }
  return (
    <div className="glass rounded-xl divide-y divide-[#1e1e2e]" data-testid="recent-convs">
      {conversations.map((conv) => (
        <div key={conv._id} className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-[#d4d4e8] truncate max-w-[70%]">{conv.title}</span>
          <span className="text-xs text-[#555570] shrink-0">
            {new Date(conv.updatedAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard({ projectSlug, projectName }: Props) {
  const { data, isLoading, error, refetch } = useDashboard(projectSlug);
  const toggleIntegration = useToggleIntegration(projectSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#555570]">
          <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm">Loading dashboard config...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 text-sm mb-4">Failed to load dashboard configuration</p>
          <button onClick={() => refetch()} className="text-sm text-indigo-400 hover:text-indigo-300">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { config, stats, recentConversations, integrations } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="admin-dashboard">
      {/* Header */}
      <header className="border-b border-[#1e1e2e] bg-[#0d0d14]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectSlug}`}
              className="p-1.5 rounded-lg text-[#555570] hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">{config.title}</h1>
              <p className="text-xs text-[#555570]">{projectName} · Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#555570] font-mono bg-[#1e1e2e] px-3 py-1.5 rounded-lg border border-[#2e2e4e]">
              Config-driven · MongoDB
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard content — rendered from MongoDB config */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10" data-testid="dashboard-content">
        {[...config.sections]
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <section key={section.id} data-testid={`section-${section.id}`}>
              <h2 className="text-sm font-semibold text-[#9999b3] uppercase tracking-widest mb-4">
                {section.title}
              </h2>

              {/* Stats cards grid */}
              {section.widgets.some((w) => w.type === 'stats_card') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...section.widgets]
                    .filter((w) => w.type === 'stats_card')
                    .sort((a, b) => a.order - b.order)
                    .map((widget) => (
                      <StatsCard
                        key={widget.id}
                        label={widget.label}
                        value={stats[widget.dataKey as keyof typeof stats] ?? 0}
                      />
                    ))}
                </div>
              )}

              {/* Integration cards */}
              {section.widgets.some((w) => w.type === 'integration_status') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...section.widgets]
                    .filter((w) => w.type === 'integration_status')
                    .sort((a, b) => a.order - b.order)
                    .map((widget) => {
                      const integration = integrations.find(
                        (i) => widget.label.toLowerCase().includes(i.type)
                      );
                      if (!integration) return null;
                      return (
                        <IntegrationCard
                          key={widget.id}
                          integration={integration}
                          onToggle={(type, enabled) => toggleIntegration.mutate({ type, enabled })}
                          pending={toggleIntegration.isPending}
                        />
                      );
                    })}
                </div>
              )}

              {/* Recent conversations */}
              {section.widgets.some((w) => w.type === 'recent_conversations') && (
                <RecentConversations conversations={recentConversations} />
              )}
            </section>
          ))}

        {/* Config hint */}
        <div className="glass rounded-xl p-4 flex items-start gap-3 border-dashed border-[#2e2e4e]">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-sm text-[#9999b3] font-medium">Config-driven layout</p>
            <p className="text-xs text-[#555570] mt-0.5">
              This dashboard layout, sections, and widget order are stored in the{' '}
              <code className="font-mono text-indigo-400">dashboardconfigs</code> MongoDB collection.
              Edit the document and refresh to see changes without any code deployment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
