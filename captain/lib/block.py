from typing import TypeVar, Callable, Any, Mapping, Type, TypeAlias
from abc import ABCMeta

T = TypeVar("T")
Name: TypeAlias = str


class FlojoyBlock(metaclass=ABCMeta):
    __inputs: Mapping[Name, Type]
    __output: Type

    def __init__(self, inputs: Mapping[Name, Type], output: Type):
        self.__inputs = inputs
        self.__output = output
        self.setup()

    def setup(self):
        pass

    def name(self):
        pass

    @property
    def inputs(self) -> Mapping[Name, Type]:
        return self.__inputs

    @property
    def output(self) -> Type:
        return self.__output

    def description(self):
        pass

    def __call__(self, *args, **kwargs) -> Any:
        ...

    def publish(self):
        pass

    def memoize(self, function: Callable[[], T], deps: list[Any]):
        return


class LambdaBlock(FlojoyBlock):
    __func: Callable

    def __init__(self, func: Callable, inputs: Mapping[Name, Type], output: Type):
        self.__func = func
        super().__init__(inputs, output)

    def __call__(self, *args, **kwargs):
        return self.__func(*args, **kwargs)
