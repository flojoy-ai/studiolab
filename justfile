PROTO_DEST := './protos'

proto:
  just proto-py & just proto-js & just proto-ts

proto-py:
  poetry run python3 -m grpc_tools.protoc \
    -I. --python_out=. --pyi_out=. --grpc_python_out=. protos/*.proto

proto-js:
  pnpm exec grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:{{PROTO_DEST}} \
    --grpc_out=grpc_js:{{PROTO_DEST}} \
    -I ./protos \
    protos/*.proto

proto-ts:
  pnpm exec grpc_tools_node_protoc \
    --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
    --ts_out={{PROTO_DEST}} \
    -I ./protos \
    protos/*.proto

