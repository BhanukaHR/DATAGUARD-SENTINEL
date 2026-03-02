using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Text.Json;

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

    // agentId → connectionId (for status tracking)
    private static readonly ConcurrentDictionary<string, string> AgentConnections = new();
    // connectionId → agentId (reverse lookup for disconnect)
    private static readonly ConcurrentDictionary<string, string> ConnectionAgents = new();

    public MonitoringHub(ILogger<MonitoringHub> logger)
    {
        _logger = logger;
    }

    // ══════════════════════════════════════════════════════════════
    //  CONNECTION LIFECYCLE
    // ══════════════════════════════════════════════════════════════

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;

        // Clean up if this was an agent
        if (ConnectionAgents.TryRemove(connectionId, out var agentId))
        {
            AgentConnections.TryRemove(agentId, out _);

            _logger.LogInformation("[Hub] Agent disconnected: {agentId}", agentId);

            // Notify dashboard the agent went offline
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
            var reg = JsonSerializer.Deserialize<JsonElement>(registrationJson);
            var agentId = reg.GetProperty("AgentId").GetString() ?? Context.ConnectionId;

            // Track connection
            AgentConnections[agentId] = Context.ConnectionId;
            ConnectionAgents[Context.ConnectionId] = agentId;

            // Add to groups
            await Groups.AddToGroupAsync(Context.ConnectionId, "agents");
            await Groups.AddToGroupAsync(Context.ConnectionId, $"agent_{agentId}");

            _logger.LogInformation("[Hub] Agent registered: {agentId} ({machine})",
                agentId,
                reg.TryGetProperty("MachineName", out var m) ? m.GetString() : "unknown");

            // Notify all dashboard clients
            await Clients.Group("dashboard").SendAsync("AgentConnected", registrationJson);
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

    /// <summary>Agent sends an upload event — forwarded to all dashboard clients.</summary>
    public async Task SendUploadEvent(string uploadEventJson)
    {
        try
        {
            _logger.LogDebug("[Hub] Upload event received");
            await Clients.Group("dashboard").SendAsync("ReceiveUploadEvent", uploadEventJson);
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

            // The dashboard hook expects (profile, brsResult) — send same payload for both
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

    /// <summary>Agent sends an AI application event — forwarded to all dashboard clients.</summary>
    public async Task SendAiApplicationEvent(string aiEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] AI application event received");
            await Clients.Group("dashboard").SendAsync("ReceiveAiEvent", aiEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward AI application event");
        }
    }

    /// <summary>Agent sends an FTP transfer event — forwarded to all dashboard clients.</summary>
    public async Task SendFtpEvent(string ftpEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] FTP event received");
            await Clients.Group("dashboard").SendAsync("ReceiveFtpEvent", ftpEventJson);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hub] Failed to forward FTP event");
        }
    }

    /// <summary>Agent sends an email exfiltration event — forwarded to all dashboard clients.</summary>
    public async Task SendEmailEvent(string emailEventJson)
    {
        try
        {
            _logger.LogInformation("[Hub] Email event received");
            await Clients.Group("dashboard").SendAsync("ReceiveEmailEvent", emailEventJson);
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

    /// <summary>Agent responds to a Ping with Pong.</summary>
    public Task Pong(string agentId)
    {
        _logger.LogDebug("[Hub] Pong from agent: {agentId}", agentId);
        return Task.CompletedTask;
    }
}
