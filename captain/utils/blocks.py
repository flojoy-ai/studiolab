import importlib.util
import os
from typing import Callable, Mapping

from captain.logging import logger


def import_blocks(blocks_dir: str) -> Mapping[str, Callable]:
    folder_path = os.path.join(blocks_dir, "flojoy")
    if not os.path.exists(folder_path):
        raise ValueError(
            f"{blocks_dir} does not seem to be a valid blocks directory since the 'flojoy' folder (which contains the Flojoy Standard Blocks Library) is missing here."
        )

    # example key: "flojoy.math.arithmetic.add"
    functions = {}

    for root, _, files in os.walk(blocks_dir):
        for file in files:
            if not file.endswith(".py"):
                continue

            block_name = file.strip(".py")

            block_path = os.path.join(root, file)

            # block_type is something like "flojoy.math.arithmetic.add"
            block_type = os.path.relpath(
                os.path.splitext(block_path)[0], blocks_dir
            ).replace(os.path.sep, ".")

            spec = importlib.util.spec_from_file_location(block_name, block_path)

            if not spec:
                raise ValueError(f"Invalid block spec from {block_path}")

            module = importlib.util.module_from_spec(spec)
            if not spec.loader:
                raise ValueError(f"Could not get loader from {block_path}")

            spec.loader.exec_module(module)
            func = getattr(module, block_name)

            logger.info(f"importing {block_type}")
            functions[block_type] = func

    return functions


def is_ui_input(func: Callable) -> bool:
    return getattr(func, "ui_input", False)
