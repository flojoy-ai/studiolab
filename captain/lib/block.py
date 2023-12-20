from typing import TypeVar, Callable, Any, Mapping, Type, TypeAlias
from abc import ABCMeta, abstractmethod

T = TypeVar("T")
Name: TypeAlias = str


class FlojoyBlock(metaclass=ABCMeta):
    __inputs: Mapping[Name, Type]
    __output: Type
    __hooks: list
    __hook_index: int

    def __init__(self, inputs: Mapping[Name, Type], output: Type):
        self.__inputs = inputs
        self.__output = output
        self.__hooks = []
        self.__hook_index = 0
        self.setup()

    def setup(self) -> None:
        pass

    @property
    def name(self) -> str:
        return self.__class__.__name__

    @property
    def inputs(self) -> Mapping[Name, Type]:
        return self.__inputs

    @property
    def output(self) -> Type:
        return self.__output

    @property
    def description(self) -> str | None:
        return self.__doc__

    def __call__(self, *args, **kwargs) -> Any:
        self.__hook_index = 0
        return self.on_next(*args, **kwargs)

    @abstractmethod
    def on_next(self, *args, **kwargs):
        ...

    def publish(self):
        pass

    def memoize(self, func: Callable[[], T], deps: list[Any]) -> T:
        # First time calling the hook
        if self.__hook_index >= len(self.__hooks):
            val = func()
            self.__hooks.append((val, deps))
            self.__hook_index += 1
            return val

        memoized_val, prev_deps = self.__hooks[self.__hook_index]

        if len(prev_deps) != len(deps):
            raise ValueError("Number of dependencies for hook should not change")

        if all(a == b for a, b in zip(deps, prev_deps)):
            val = memoized_val
        else:
            # deps changed, recompute value
            val = func()
            self.__hooks[self.__hook_index] = (val, deps)

        self.__hook_index += 1
        return val

    def effect(self, func: Callable[[], None], deps: list[Any]) -> None:
        self.memoize(func, deps)


class LambdaBlock(FlojoyBlock):
    __func: Callable

    def __init__(self, func: Callable, inputs: Mapping[Name, Type], output: Type):
        self.__func = func
        super().__init__(inputs, output)

    @property
    def name(self):
        return self.__func.__name__

    @property
    def description(self):
        return self.__func.__doc__

    def on_next(self, *args, **kwargs):
        return self.__func(*args, **kwargs)
