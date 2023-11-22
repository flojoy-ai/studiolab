import importlib.util
import os
from typing import Callable, Mapping


def import_blocks(blocks_dir: str) -> Mapping[str, Callable]:
    """Imports all Flojoy blocks from the blocks directory.

    Note: This assumes all .py files in the directory contains Flojoy blocks.
    """
    functions = {}
    for file in os.listdir(blocks_dir):
        full_path = os.path.join(blocks_dir, file)
        if not os.path.isfile(full_path) or not file.endswith(".py"):
            continue

        block_name = file.strip(".py")
        spec = importlib.util.spec_from_file_location(block_name, full_path)

        if not spec:
            raise ValueError(f"Invalid block spec from {full_path}")

        module = importlib.util.module_from_spec(spec)
        if not spec.loader:
            raise ValueError(f"Could not get loader from {full_path}")

        spec.loader.exec_module(module)
        func = getattr(module, block_name)
        functions[block_name] = func

    return functions


def is_ui_input(func: Callable) -> bool:
    return getattr(func, "ui_input", False)
