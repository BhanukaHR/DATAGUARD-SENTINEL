import type { ReportConfig } from "../../types/report-config";
import { formatNumber, formatPercent } from "../../utils/formatters";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

interface ReportPreviewData {
  uploads?: R[];
  clipboard?: R[];
  usb?: R[];
  alerts?: R[];
  riskProfiles?: { docs?: { data: () => R }[] } | R[];
  agents?: { docs?: { data: () => R }[] } | R[];
  auditLogs?: R[];
  [key: string]: unknown;
}

interface Props {
  config: ReportConfig;
  data: ReportPreviewData;
}

export function ReportPreview({ config, data }: Props) {
  const uploads: R[] = data?.uploads || [];
  const clipboard: R[] = data?.clipboard || [];
  const usb: R[] = data?.usb || [];
  const alerts: R[] = data?.alerts || [];
  const rawRP = data?.riskProfiles;
  const riskProfiles: R[] = (rawRP && !Array.isArray(rawRP) && rawRP.docs)
    ? rawRP.docs.map((d) => d.data())
    : (Array.isArray(rawRP) ? rawRP : []);
  const rawAg = data?.agents;
  const agents: R[] = (rawAg && !Array.isArray(rawAg) && rawAg.docs)
    ? rawAg.docs.map((d) => d.data())
    : (Array.isArray(rawAg) ? rawAg : []);

  const totalEvents = uploads.length;
  const blockedEvents = uploads.filter((e) => e.isBlocked).length;
  const avgTrs = totalEvents > 0
    ? uploads.reduce((s: number, e) => s + ((e.transactionRiskScore as number) || 0), 0) / totalEvents
    : 0;
  const criticalAlerts = alerts.filter((a) => a.type === "Critical").length;
  const highRiskUsers = riskProfiles.filter(
    (p) => ((p.behavioralRiskScore as number) || 0) >= 60
  ).length;
  const activeAgents = agents.filter(
    (a) => a.status === "online"
  ).length;

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto space-y-8 text-sm text-slate-800">
      {/* Cover */}
      <div className="text-center py-12 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">DataGuard Sentinel</h1>
        <p className="text-lg text-slate-600 mt-1">Security Monitoring Report</p>
        <p className="text-sm text-slate-500 mt-4">
          Period: {config.month || `${config.startDate} — ${config.endDate}`}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Generated: {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-red-500 mt-2 font-medium">CONFIDENTIAL</p>
      </div>

      {/* Executive Summary */}
      {config.sections.executiveSummary && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Total Events" value={formatNumber(totalEvents)} />
            <SummaryCard label="Events Blocked" value={`${formatNumber(blockedEvents)} (${formatPercent(blockedEvents, totalEvents)})`} />
            <SummaryCard label="Average TRS" value={avgTrs.toFixed(1)} />
            <SummaryCard label="Critical Alerts" value={formatNumber(criticalAlerts)} />
            <SummaryCard label="High-Risk Users" value={formatNumber(highRiskUsers)} />
            <SummaryCard label="Active Agents" value={formatNumber(activeAgents)} />
          </div>
        </section>
      )}

      {/* Risk Score Overview */}
      {config.sections.riskScoreOverview && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Risk Score Overview</h2>
          <div className="space-y-2">
            <p className="text-slate-600">
              Average Transaction Risk Score across {formatNumber(totalEvents)} events: <strong>{avgTrs.toFixed(1)}</strong>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-3 py-2 text-left">File</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">User</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Channel</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Destination</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">TRS</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads
                    .sort((a: R, b: R) => ((b.transactionRiskScore as number) || 0) - ((a.transactionRiskScore as number) || 0))
                    .slice(0, 5)
                    .map((e: R, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="border border-slate-200 px-3 py-1.5">{e.fileName}</td>
                        <td className="border border-slate-200 px-3 py-1.5">{e.userId}</td>
                        <td className="border border-slate-200 px-3 py-1.5">{e.channel}</td>
                        <td className="border border-slate-200 px-3 py-1.5">{e.destinationDomain}</td>
                        <td className="border border-slate-200 px-3 py-1.5 font-medium">{e.transactionRiskScore}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* User Risk Profiles */}
      {config.sections.userRiskProfiles && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">User Risk Profiles</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left">Username</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Department</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">BRS</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Risk Level</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Total Uploads</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Blocked</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(riskProfiles) ? riskProfiles : [])
                  .sort((a: R, b: R) => ((b.behavioralRiskScore as number) || 0) - ((a.behavioralRiskScore as number) || 0))
                  .map((p: R, i: number) => (
                    <tr key={i}>
                      <td className="border border-slate-200 px-3 py-1.5">{p.username}</td>
                      <td className="border border-slate-200 px-3 py-1.5">{p.department}</td>
                      <td className="border border-slate-200 px-3 py-1.5 font-medium">{p.behavioralRiskScore}</td>
                      <td className="border border-slate-200 px-3 py-1.5">{p.currentRiskLevel}</td>
                      <td className="border border-slate-200 px-3 py-1.5">{p.totalUploads}</td>
                      <td className="border border-slate-200 px-3 py-1.5">{p.blockedUploads}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Alert Summary */}
      {config.sections.alertSummary && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Alert Summary</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <SummaryCard label="Info" value={formatNumber(alerts.filter((a: R) => a.type === "Info").length)} />
            <SummaryCard label="Warning" value={formatNumber(alerts.filter((a: R) => a.type === "Warning").length)} />
            <SummaryCard label="Block" value={formatNumber(alerts.filter((a: R) => a.type === "Block").length)} />
            <SummaryCard label="Critical" value={formatNumber(criticalAlerts)} />
          </div>
          <p className="text-xs text-slate-500">
            Unresolved: {alerts.filter((a: R) => !a.isResolved).length} |
            Escalations: {alerts.filter((a: R) => a.isEscalation).length}
          </p>
        </section>
      )}

      {/* Upload Events Analysis */}
      {config.sections.uploadEventsAnalysis && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Upload Events Analysis</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <SummaryCard label="Total Uploads" value={formatNumber(totalEvents)} />
            <SummaryCard label="Blocked" value={formatNumber(blockedEvents)} />
            <SummaryCard label="Block Rate" value={formatPercent(blockedEvents, totalEvents)} />
          </div>
          {blockedEvents > 0 && (
            <>
              <h4 className="text-xs font-medium text-slate-700 mt-4 mb-2">Blocked Events</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-3 py-2 text-left">File</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">User</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Destination</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads
                      .filter((e: R) => e.isBlocked)
                      .slice(0, 20)
                      .map((e: R, i: number) => (
                        <tr key={i}>
                          <td className="border border-slate-200 px-3 py-1.5">{e.fileName}</td>
                          <td className="border border-slate-200 px-3 py-1.5">{e.userId}</td>
                          <td className="border border-slate-200 px-3 py-1.5">{e.destinationDomain}</td>
                          <td className="border border-slate-200 px-3 py-1.5">{e.blockReason || "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* Clipboard Events Analysis */}
      {config.sections.clipboardEventsAnalysis && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Clipboard Events Analysis</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <SummaryCard label="Total" value={formatNumber(clipboard.length)} />
            <SummaryCard label="Sensitive" value={formatNumber(clipboard.filter((e: R) => e.containsSensitiveData).length)} />
            <SummaryCard label="AI Targeted" value={formatNumber(clipboard.filter((e: R) => e.isTargetingAiApp).length)} />
          </div>
        </section>
      )}

      {/* USB Events Analysis */}
      {config.sections.usbEventsAnalysis && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">USB Events Analysis</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <SummaryCard label="Total" value={formatNumber(usb.length)} />
            <SummaryCard label="Blocked" value={formatNumber(usb.filter((e: R) => e.isBlocked).length)} />
            <SummaryCard label="Sensitive" value={formatNumber(usb.filter((e: R) => e.sensitivityLevel === "Confidential" || e.sensitivityLevel === "Restricted").length)} />
          </div>
        </section>
      )}

      {/* Agent Health Report */}
      {config.sections.agentHealthReport && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Agent Health Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-2 text-left">Machine</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Status</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Scan Count</th>
                  <th className="border border-slate-200 px-3 py-2 text-left">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(agents) ? agents : []).map((a: R, i: number) => (
                  <tr key={i}>
                    <td className="border border-slate-200 px-3 py-1.5">{a.machineName}</td>
                    <td className="border border-slate-200 px-3 py-1.5">{a.status}</td>
                    <td className="border border-slate-200 px-3 py-1.5">{a.scanCount}</td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      {a.lastHeartbeat ? new Date(String(a.lastHeartbeat)).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Audit Log Summary */}
      {config.sections.auditLogSummary && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Audit Log Summary</h2>
          <p className="text-slate-600">
            Total audit entries in period: <strong>{formatNumber(data?.auditLogs?.length || 0)}</strong>
          </p>
        </section>
      )}

      {/* Footer */}
      <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
        Generated by DataGuard Sentinel v1.0
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}
