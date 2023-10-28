dev:
  pnpm exec concurrently -n captain,electron -c green,blue "just dev-captain" "just dev-electron"

dev-captain:
  poetry run python3 main.py

dev-electron:
  pnpm dev

build-captain:
  echo "Stub..."

build-win: build-captain
  pnpm run build:win

build-mac: build-captain
  pnpm run build:mac

build-linux: build-captain
  pnpm run build:linux
