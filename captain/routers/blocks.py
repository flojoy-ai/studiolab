from fastapi import APIRouter

router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.get("/")
async def read_blocks():
    return "Hello blocks!"
