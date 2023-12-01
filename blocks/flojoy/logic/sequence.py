import time
import reactivex as rx


def sequence(start: int = 0, stop: int | None = None, step: int | None = None):
    return rx.range(start=start, stop=stop, step=step)
