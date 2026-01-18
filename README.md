# Family Meal Planner

A family meal planning application that tracks pantry inventory, manages recipes, determines cookability with unit conversion, generates grocery lists, and supports LLM-driven planning via MCP.

## Architecture

The system is composed of four major layers:

- **Spring Boot Backend** - System of record, enforces all business rules
- **MongoDB** - Canonical data storage (pantry, recipes, plans, lists, preferences)
- **Python AI Service** - Embeddings, vector search, and agent logic
- **React + TypeScript + Tailwind UI** - All user interaction
- **Qdrant** - Vector database for semantic recipe retrieval

## Project Structure

```
Family-meal-planner/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/mealplanner/
│   │   │   ├── config/      # Configuration classes
│   │   │   ├── controller/  # REST controllers
│   │   │   ├── dto/         # Data transfer objects
│   │   │   ├── exception/   # Exception handling
│   │   │   ├── model/       # Domain models
│   │   │   ├── repository/  # MongoDB repositories
│   │   │   └── service/     # Business logic
│   │   └── resources/       # Application configuration
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── Dockerfile
│   └── package.json
├── ai-service/              # Python AI service
│   ├── src/
│   │   ├── config/          # Configuration
│   │   └── embeddings/      # Embedding logic
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── docs/                    # Documentation
│   └── openapi.yaml         # OpenAPI specification
├── docker-compose.yml       # Full stack deployment
└── docker-compose.dev.yml   # Development services only
```

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Development Setup

1. **Start infrastructure services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Start the backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Run the embedding job (optional):**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python -m src.embeddings.batch_embed
   ```

### Full Stack with Docker

```bash
docker-compose --profile full up -d
```

## API Documentation

See [docs/openapi.yaml](docs/openapi.yaml) for the full API specification.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/pantry | List pantry lots |
| POST | /api/pantry | Create pantry lot |
| PUT | /api/pantry/{id} | Update pantry lot |
| DELETE | /api/pantry/{id} | Delete pantry lot |
| GET | /api/recipes | List recipes |
| POST | /api/recipes | Create recipe |
| PUT | /api/recipes/{id} | Update recipe |
| DELETE | /api/recipes/{id} | Delete recipe |

## Development Phases

### Phase 1 - Core CRUD & Data Foundations (Current)
- Pantry inventory CRUD
- Recipe CRUD
- MongoDB repositories and indexes
- Recipe seeding
- Vector embedding + Qdrant indexing
- Foundational React UI

### Phase 2 - Cooking Logic, Grocery Lists, Meal Planning
- Unit conversion service
- Recipe feasibility engine
- Grocery list aggregation
- Meal plan CRUD

### Phase 3 - LLM Chatbot, Meal Planner Agent, MCP
- MCP server for tool calling
- Conversational recipe discovery
- Agent-driven meal planning

## Configuration

### Backend (application.yml)
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/mealplanner
```

### AI Service (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/mealplanner
QDRANT_HOST=localhost
QDRANT_PORT=6333
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

## License

MIT
