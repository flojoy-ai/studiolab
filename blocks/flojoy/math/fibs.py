from captain.lib.block import FlojoyBlock


class fibs(FlojoyBlock):
    def setup(self):
        self.prev = 0
        self.cur = 1

    def on_next(self, x=None):
        temp = self.cur
        self.cur += self.prev
        self.prev = temp

        return temp
