from typing import Callable


def ui_input(block: Callable) -> Callable:
    """Decorator that a block as being a UI input."""
    block.ui_input = True
    return block
