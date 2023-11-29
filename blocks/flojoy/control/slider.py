from captain.decorators import ui_input


@ui_input
def slider(x: int) -> int:
    return x
