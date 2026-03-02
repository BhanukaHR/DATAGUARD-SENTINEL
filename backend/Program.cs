using DataGuard.HubServer.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ── CORS — allow the React dashboard ──────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // required for SignalR
    });
});

// ── SignalR ────────────────────────────────────────────────────────────
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.MaximumReceiveMessageSize = 512 * 1024; // 512 KB
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
});

// ── Health endpoint ────────────────────────────────────────────────────
builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseCors();

// ── Routes ─────────────────────────────────────────────────────────────
app.MapHub<MonitoringHub>("/hubs/monitoring");
app.MapHealthChecks("/health");

// Root status endpoint
app.MapGet("/", () => new
{
    service = "DataGuard Hub Server",
    version = "1.0.0",
    status = "running",
    hub = "/hubs/monitoring",
    timestamp = DateTime.UtcNow
});

app.Run();
