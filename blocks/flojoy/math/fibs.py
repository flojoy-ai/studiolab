from captain.lib.block import FlojoyBlock
from captain.logging import logger


class fibs(FlojoyBlock):
    def setup(self):
        self.prev = 0
        self.cur = 1

    def on_next(self, x: int, y: int):  # type: ignore
        temp = self.cur
        self.cur += self.prev
        self.prev = temp

        return temp
