from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# Add CORS middleware with specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["Content-Type", "Authorization", "Accept"],  # Explicitly list allowed headers
    expose_headers=["*"],  # Expose all headers
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Add a specific OPTIONS handler for the scrape endpoint
@app.options("/api/scrape/scrape")
async def options_scrape():
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
            "Access-Control-Max-Age": "600",
        }
    )

# ... rest of your FastAPI code ... 