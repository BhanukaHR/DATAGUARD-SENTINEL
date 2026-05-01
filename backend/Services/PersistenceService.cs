using Google.Cloud.Firestore;
using System.Text.Json;

namespace DataGuard.HubServer.Services;

public class PersistenceService
{
    private readonly ILogger<PersistenceService> _logger;
    private readonly FirestoreDb _db;

    public PersistenceService(ILogger<PersistenceService> logger, FirestoreDb db)
    {
        _logger = logger;
        _db = db;
    }

    public async Task PersistEvent(string collectionName, string eventJson)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, object>>(eventJson);
            if (data == null)
            {
                _logger.LogWarning("[Persistence] Failed to deserialize event for {collection}", collectionName);
                return;
            }
            
            // Ensure timestamp is a Firestore Timestamp
            if (data.TryGetValue("Timestamp", out var ts) && ts is string tsString)
            {
                if (DateTime.TryParse(tsString, out var dt))
                {
                    data["Timestamp"] = Timestamp.FromDateTime(dt.ToUniversalTime());
                }
            }

            var collection = _db.Collection(collectionName);
            await collection.AddAsync(data);
            _logger.LogInformation("[Persistence] Stored event in {collection}", collectionName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Persistence] Error storing event in {collection}", collectionName);
        }
    }
}
