from captain.decorators import ui_input


@ui_input
def toggle(x: bool):
    return x
