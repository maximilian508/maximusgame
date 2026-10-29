#!/bin/zsh
cd -- "$(dirname -- "$0")"
task_python="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [[ ! -x "$task_python" ]]; then
  task_python="$(command -v python3)"
fi
printf '\nMax Night Drive: öppna http://127.0.0.1:8765 i webbläsaren.\nStäng med Ctrl+C.\n\n'
exec "$task_python" -m http.server 8765 --bind 127.0.0.1
