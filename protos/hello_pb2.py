# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: protos/hello.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x12protos/hello.proto\x12\x05hello\"\x1c\n\x0cHelloRequest\x12\x0c\n\x04name\x18\x01 \x01(\t\"\x1d\n\nHelloReply\x12\x0f\n\x07message\x18\x01 \x01(\t2z\n\x07Greeter\x12\x34\n\x08SayHello\x12\x13.hello.HelloRequest\x1a\x11.hello.HelloReply\"\x00\x12\x39\n\rSayHelloAgain\x12\x13.hello.HelloRequest\x1a\x11.hello.HelloReply\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'protos.hello_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  DESCRIPTOR._options = None
  _globals['_HELLOREQUEST']._serialized_start=29
  _globals['_HELLOREQUEST']._serialized_end=57
  _globals['_HELLOREPLY']._serialized_start=59
  _globals['_HELLOREPLY']._serialized_end=88
  _globals['_GREETER']._serialized_start=90
  _globals['_GREETER']._serialized_end=212
# @@protoc_insertion_point(module_scope)
