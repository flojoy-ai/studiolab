import functools
import inspect
import importlib.util
import os
from typing import Callable, Mapping, Type, TypeAlias
from dataclasses import dataclass

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


def import_blocks(blocks_dir: str) -> Mapping[str, FlojoyBlock]:
    functions: dict[str, FlojoyBlock] = {}

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

        sig = inspect.signature(func)
        inputs = {name: param.annotation for name, param in sig.parameters.items()}
        outputs = sig.return_annotation

        functions[block_name] = FlojoyBlock(func, inputs, outputs)

    return functions
