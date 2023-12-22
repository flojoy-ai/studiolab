from typing import Tuple, TypeVar, Callable

T = TypeVar("T")


def partition_by(pred: Callable[[T], bool], xs: list[T]) -> Tuple[list[T], list[T]]:
    matched, not_matched = [], []

    for x in xs:
        if pred(x):
            matched.append(x)
        else:
            not_matched.append(x)

    return matched, not_matched
