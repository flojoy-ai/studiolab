proto:
  just proto-py & just proto-js

proto-py:
  poetry run python3 -m grpc_tools.protoc -I. --python_out=. --pyi_out=. --grpc_python_out=. protos/hello.proto

proto-js:
  pnpm exec grpc_tools_node_protoc --js_out=import_style=commonjs,binary:. --grpc_out=grpc_js:. protos/hello.proto
