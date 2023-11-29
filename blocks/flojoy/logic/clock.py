import time


def clock(interval: float):
    while True:
        time.sleep(interval)
        yield None
