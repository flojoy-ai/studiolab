from fastapi import FastAPI

from captain.routers import blocks

app = FastAPI()

app.include_router(blocks.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=2333, reload=True)
