dev:
  pnpm exec concurrently -n captain,electron -c green,blue "just dev-captain" "just dev-electron"

dev-captain:
  poetry run python3 main.py

dev-electron:
  pnpm dev
