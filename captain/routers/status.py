from fastapi import APIRouter, WebSocket

router = APIRouter(tags=["status"], prefix="/status")


@router.websocket("")
async def get_server_status(websocket: WebSocket):
    await websocket.accept()
