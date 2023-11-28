import reactivex as rx
from reactivex import scheduler
import reactivex.operators as ops
import time


def CLOCK(interval: int):
    while True:
        time.sleep(interval)
        yield None


def bruh():
    while True:
        time.sleep(0.2)
        print("aslkdj")


initial: rx.Subject[int] = rx.Subject()

out = initial.pipe(
    ops.observe_on(scheduler.NewThreadScheduler()), ops.flat_map(lambda x: CLOCK(x))
)
# out = rx.range(0, 10)
#
out.subscribe(lambda x: print(x))
out.subscribe(lambda x: print("aslkdj"))
#
initial.on_next(1)

while True:
    pass
