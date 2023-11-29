from typing import TypedDict
from captain.types.builtins import Ignore


class Output(TypedDict):
    true: Ignore | None
    false: Ignore | None


def conditional(b: bool) -> Output:
    return Output(
        true=None if b else Ignore(),
        false=Ignore() if b else None,
    )
