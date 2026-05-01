using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Text.Json;
using DataGuard.HubServer.Services;

namespace DataGuard.HubServer.Hubs;

/// <summary>
/// Central SignalR hub bridging endpoint agents and the admin dashboard.
///
/// Groups:
///   "dashboard"        — all connected dashboard clients
///   "agents"           — all connected endpoint agents
///   "agent_{agentId}"  — a specific agent (for targeted commands)
/// </summary>
public class MonitoringHub : Hub
{
    private readonly ILogger<MonitoringHub> _logger;
    private readonly PersistenceService _persistence;

    private static readonly ConcurrentDictionary<string, string> AgentConnections = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionAgents = new();

    public MonitoringHub(ILogger<MonitoringHub> logger, PersistenceService persistence)
    {
        _logger = logger;
        _persistence = persistence;
    }

    // ══════════════════════════════════════════════════════════════
    //  CONNECTION LIFECYCLE
    // ══════════════════════════════════════════════════════════════

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;

        if (ConnectionAgents.TryRemove(connectionId, out var agentId))
        {
            AgentConnections.TryRemove(agentId, out _);

            _logger.LogInformation("[Hub] Agent disconnected: {agentId}", agentId);

            await Clients.Group("dashboard").SendAsync("AgentStatusUpdate", JsonSerializer.Serialize(new
            {
                AgentId = agentId,
                Status = "offline",
                Timestamp = DateTime.UtcNow
            }));
        }

        await base.OnDisconnectedAsync(exception);
    }

    // ══════════════════════════════════════════════════════════════
    //  CALLED BY: DASHBOARD
    // ══════════════════════════════════════════════════════════════

    /// <summary>Dashboard clients call this after connecting to join the broadcast group.</summary>
    public async Task JoinDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "dashboard");
        _logger.LogInformation("[Hub] Dashboard client joined: {id}", Context.ConnectionId);
    }

    /// <summary>Dashboard sends a command to a specific agent.</summary>
    public async Task SendCommandToAgent(string agentId, string commandType, string payload)
    {
        _logger.LogInformation("[Hub] Sending command to agent {agentId}: {type}", agentId, commandType);

        var commandJson = JsonSerializer.Serialize(new
        {
            CommandType = commandType,
            Payload = payload,
            SentAt = DateTime.UtcNow
        });

        await Clients.Group($"agent_{agentId}").SendAsync("ReceiveCommand", commandJson);
    }

    /// <summary>Dashboard broadcasts a policy update to all agents.</summary>
    public async Task BroadcastPolicyUpdate(string policyJson)
    {
        _logger.LogInformation("[Hub] Broadcasting policy update to all agents");
        await Clients.Group("agents").SendAsync("PolicyUpdate", policyJson);
    }

    /// <summary>Dashboard pings a specific agent to check liveness.</summary>
    public async Task PingAgent(string agentId)
    {
        _logger.LogDebug("[Hub] Pinging agent: {agentId}", agentId);
        await Clients.Group($"agent_{agentId}").SendAsync("Ping");
    }

    // ══════════════════════════════════════════════════════════════
    //  CALLED BY: ENDPOINT AGENT
    // ══════════════════════════════════════════════════════════════

    /// <summary>Agent registers itself on first connection.</summary>
    public async Task RegisterAgent(string registrationJson)
    {
        try
        {
            var regDict = JsonSerializer.Deserialize<Dictionary<string, object?>>(registrationJson) ?? new();

            string? ReadString(params string[] keys)
            {
                foreach (var key in keys)
                {
                    if (!regDict.TryGetValue(key, out var value) || value is null) continue;
                    if (value is JsonElement el)
                    {
                        if (el.ValueKind == JsonValueKind.String) return el.GetString();
                        return el.ToString();
                    }
                    return value.ToString();
                }
                return null;
            }

            var agentId = ReadString("AgentId", "agentId");
            if (string.IsNullOrWhiteSpace(agentId))
            {
                agentId = Guid.NewGuid().ToString("N");
            }

            regDict["AgentId"] = agentId;
            var normalizedJson = JsonSerializer.Serialize(regDict);

            AgentConnections[agentId] = Context.ConnectionId;
            ConnectionAgents[Context.ConnectionId] = agentId;

            await Groups.AddToGroupAsync(Context.ConnectionId, "agents");
            await Groups.AddToGroupAsync(Context.ConnectionId, $"agent_{agentId}");

            var machineName = ReadString("MachineName", "machineName") ?? "unknown";
            _logger.LogInformation("[Hub] Agent registered: {agentId} ({machine})", agentId, machineName);

            await Clients.Group("dashboard").SendAsync("AgentConnected", normalizedJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to register agent");
        }
    }

    /// <summary>Agent sends a DLP alert — forwarded to all dashboard clients.</summary>
    public async Task SendAlert(string alertJson)
    {
        try
        {
            var alert = JsonSerializer.Deserialize<JsonElement>(alertJson);
            _logger.LogInformation("[Hub] Alert received from agent: {type}",
                alert.TryGetProperty("Type", out var t) ? t.GetString() : "unknown");

            await Clients.Group("dashboard").SendAsync("ReceiveAlert", alertJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward alert");
        }
    }

    /// <summary>Agent sends an upload event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendUploadEvent(string uploadEventJson)
    {
        try
        {
            _logger.LogDebug("[Hub] Upload event received");
            await Clients.Group("dashboard").SendAsync("ReceiveUploadEvent", uploadEventJson);
            _ = _persistence.PersistEvent("uploadEvents", uploadEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward upload event");
        }
    }

    /// <summary>Agent sends a risk profile update — forwarded to all dashboard clients.</summary>
    public async Task SendRiskProfileUpdate(string profileJson)
    {
        try
        {
            var profile = JsonSerializer.Deserialize<JsonElement>(profileJson);
            _logger.LogDebug("[Hub] Risk profile update: {user}",
                profile.TryGetProperty("Username", out var u) ? u.GetString() : "unknown");

            await Clients.Group("dashboard").SendAsync("ReceiveRiskUpdate", profileJson, profileJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward risk profile update");
        }
    }

    /// <summary>Agent sends an escalation alert — forwarded to all dashboard clients.</summary>
    public async Task SendEscalation(string escalationJson)
    {
        try
        {
            var esc = JsonSerializer.Deserialize<JsonElement>(escalationJson);
            _logger.LogCritical("[Hub] ESCALATION from agent: {user}",
                esc.TryGetProperty("Username", out var u) ? u.GetString() : "unknown");

            await Clients.Group("dashboard").SendAsync("ReceiveEscalation", escalationJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward escalation");
        }
    }

    /// <summary>Agent sends an AI application event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendAiApplicationEvent(string aiEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] AI application event received");
            await Clients.Group("dashboard").SendAsync("ReceiveAiEvent", aiEventJson);
            _ = _persistence.PersistEvent("aiApplicationEvents", aiEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward AI application event");
        }
    }

    /// <summary>Agent sends an FTP transfer event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendFtpEvent(string ftpEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] FTP event received");
            await Clients.Group("dashboard").SendAsync("ReceiveFtpEvent", ftpEventJson);
            _ = _persistence.PersistEvent("ftpEvents", ftpEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward FTP event");
        }
    }

    /// <summary>Agent sends an email exfiltration event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendEmailEvent(string emailEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] Email event received");
            await Clients.Group("dashboard").SendAsync("ReceiveEmailEvent", emailEventJson);
            _ = _persistence.PersistEvent("emailEvents", emailEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward email event");
        }
    }

    /// <summary>Agent sends periodic heartbeat — forwarded to dashboard as a status update.</summary>
    public async Task AgentHeartbeat(string heartbeatJson)
    {
        try
        {
            await Clients.Group("dashboard").SendAsync("AgentStatusUpdate", heartbeatJson);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "[Hub] Failed to forward heartbeat");
        }
    }

    /// <summary>Agent sends a USB/removable media event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendUsbEvent(string usbEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] USB event received");
            await Clients.Group("dashboard").SendAsync("ReceiveUsbEvent", usbEventJson);
            _ = _persistence.PersistEvent("usbEvents", usbEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward USB event");
        }
    }

    /// <summary>Agent sends a clipboard event — forwarded to all dashboard clients and persisted.</summary>
    public async Task SendClipboardEvent(string clipboardEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] Clipboard event received");
            await Clients.Group("dashboard").SendAsync("ReceiveClipboardEvent", clipboardEventJson);
            _ = _persistence.PersistEvent("clipboardEvents", clipboardEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward clipboard event");
        }
    }

    /// <summary>Agent responds to a Ping with Pong.</summary>
    public Task Pong(string agentId)
    {
        _logger.LogDebug("[Hub] Pong from agent: {agentId}", agentId);
        return Task.CompletedTask;
    }
}
