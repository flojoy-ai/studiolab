from fastapi import FastAPI

from captain.routers import blocks

app = FastAPI()

app.include_router(blocks.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
