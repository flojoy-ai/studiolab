import reactivex as rx


def clock():
    return rx.interval(1 / 60)
