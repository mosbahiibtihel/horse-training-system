namespace HorseTraining.API.Services;

using HorseTraining.API.Hub;
using Microsoft.AspNetCore.SignalR;

public class NotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task SendToUser(string userId, string type, string message)
    {
        await _hub.Clients
            .Group($"user_{userId}")
            .SendAsync("ReceiveNotification", new
            {
                type,
                message,
                timestamp = DateTime.UtcNow
            });
    }
}
