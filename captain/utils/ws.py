import asyncio
from asyncio import Future
from typing import Any

from captain.logging import logger


def send_message_factory(websocket):
    def send_message(x: Any) -> Future[None]:
        """
        USAGE: Flat map to this thingy
        """
        logger.debug(f"supposed to send {x}")
        return asyncio.ensure_future(websocket.send_text(str(x)))

    return send_message
