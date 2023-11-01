from fastapi import APIRouter, WebSocket
from reactivex.subject import BehaviorSubject
import asyncio

router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.get("/")
async def read_blocks():
    return "Hello blocks!"


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    subject = BehaviorSubject(0)

    async def destruct():
        print("completed")
        subject.on_completed()
        subject.dispose()
        await websocket.close()

    async def on_next(x: str):
        print(x)
        await websocket.send_text(x)


    subject.subscribe(on_next=lambda x: run_sync(on_next(str(x))), on_error=lambda e: print(e), on_completed=lambda: run_sync(destruct))
    while True:
        data = await websocket.receive_text()
        subject.on_next(int(data))


def run_sync(func):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(asyncio.create_task(func))
