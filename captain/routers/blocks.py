from fastapi import APIRouter, WebSocket
from reactivex import Subject

router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.get("/")
async def read_blocks():
    return "Hello blocks!"


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    data = await websocket.receive_text()
    subject = Subject()

    def destruct():
        subject.on_completed()
        subject.dispose()
        websocket.close()

    subject.subscribe(on_next=lambda x: websocket.send_text(x), on_error=lambda e: print(e), on_completed=destruct)
