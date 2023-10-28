dev:
  pnpm exec concurrently -n captain,electron -c green,blue "just dev-captain" "just dev-electron"

dev-captain:
  cd captain && poetry run uvicorn main:app --reload --port 2333

dev-electron:
  pnpm dev
