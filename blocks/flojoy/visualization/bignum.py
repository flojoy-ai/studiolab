import reactivex as rx


def bignum(x: int) -> rx.Observable[int]:
    return rx.just(x)
