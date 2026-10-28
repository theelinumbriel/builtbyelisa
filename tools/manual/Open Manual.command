#!/bin/zsh
cd -- "${0:A:h}" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null; then
  echo 'Install Node.js 22 or newer, then open Manual again.'
  read '?Press Return to close.'
  exit 1
fi
if /usr/bin/curl -fsS --max-time 2 http://localhost:4317/api/health >/dev/null 2>&1; then
  open http://localhost:4317
  exit 0
fi
node server/server.mjs &
manual_pid=$!
trap 'kill "$manual_pid" 2>/dev/null' EXIT INT TERM
for attempt in {1..50}; do
  if /usr/bin/curl -fsS --max-time 1 http://localhost:4317/api/health >/dev/null 2>&1; then
    open http://localhost:4317
    wait "$manual_pid"
    exit $?
  fi
  if ! kill -0 "$manual_pid" 2>/dev/null; then
    wait "$manual_pid"
    exit 1
  fi
  sleep 0.2
done
echo 'Manual did not start. Check the message above, then try again.'
read '?Press Return to close.'
exit 1
