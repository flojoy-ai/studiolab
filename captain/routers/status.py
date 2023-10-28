from fastapi import APIRouter

from captain.types.status import ServerStatus, ServerStatusEnum

router = APIRouter(tags=["status"], prefix="/status")


@router.get("/")
async def get_server_status() -> ServerStatus:
    return ServerStatus(status=ServerStatusEnum.OK, message="Captain is ready!")
