# Equestrian OS

A full-stack horse training management platform for riders, trainers, and stable managers. It covers training tracking, performance analytics, competition results, real-time notifications, and an AI coaching assistant.

## Features

- **Role-based access** with JWT authentication: Rider, Trainer, Stable Manager
- **Real-time notifications** via SignalR
- **Analytics dashboard** with Chart.js visualizations
- **Fitness scoring engine**: rule-based evaluation of horse fitness
- **Competition results tracking**
- **AI coaching chatbot** powered by the Anthropic Claude API

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Chart.js |
| Backend | ASP.NET Core 8, Entity Framework Core 8 |
| Database | SQL Server |
| Auth | JWT |
| Real-time | SignalR |
| AI | Anthropic Claude API |

## Architecture

The backend follows **Clean Architecture**:

```
backend/
├── Domain/           # Entities, core business rules
├── Application/      # Use cases, interfaces, DTOs
├── Infrastructure/   # EF Core, data access, external services
└── API/              # Controllers, SignalR hubs, configuration
```

Dependencies point inward: Domain has no dependencies, and API/Infrastructure depend on Application.

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- SQL Server (local or remote)

### Backend

```bash
cd backend
# set the connection string, JWT key, and Anthropic API key
# in appsettings.Development.json or user secrets
dotnet ef database update --project Infrastructure --startup-project API
dotnet run --project API
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

| Setting | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Key` | Secret used to sign tokens |
| `Anthropic:ApiKey` | API key for the AI chatbot |

Never commit secrets. Use user secrets or environment variables.

## Roles

| Role | Access |
|---|---|
| Rider | Own training sessions, progress, competition results, AI coach |
| Trainer | Manage riders and horses, plan and review training |
| Stable Manager | Stable-wide oversight, analytics, user management |

## Author

**Ibt**: Software Engineering student, ISIMS, Sfax, Tunisia
GitHub: [@mosbahiibtihel](https://github.com/mosbahiibtihel)
