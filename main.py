from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from captain.routers import blocks, status

app = FastAPI()

app.include_router(blocks.router)
app.include_router(status.router)


origins = [
    "http://localhost",
    "http://localhost:2334",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=2333, reload=True)
