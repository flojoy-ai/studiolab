import inspect
import importlib.util
import os
from typing import Callable, Mapping, Type, TypeAlias
from dataclasses import dataclass

from captain.types.flowchart import BlockType

Name: TypeAlias = str


@dataclass
class FlojoyBlock:
    func: Callable
    inputs: Mapping[Name, Type]
    output: Type

    def __call__(self, *args, **kwargs):
        return self.func(*args, **kwargs)

    @property
    def is_ui_input(self) -> bool:
        return getattr(self.func, "ui_input", False)


def import_blocks(blocks_dir: str) -> Mapping[BlockType, FlojoyBlock]:
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

            block_name = file.rstrip(".py")
            block_path = os.path.join(root, file)
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

            sig = inspect.signature(func)
            inputs = {name: param.annotation for name, param in sig.parameters.items()}
            outputs = sig.return_annotation

            functions[block_type] = FlojoyBlock(func, inputs, outputs)

    return functions
