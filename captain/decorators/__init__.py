from typing import Callable


def ui_input(block: Callable) -> Callable:
    block.ui_input = True
    return block
