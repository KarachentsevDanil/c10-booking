#!/bin/bash
# .claude/hooks/lint-edited.sh
file=$(jq -r '.tool_input.file_path')

case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

if ! out=$(npx eslint "$file" 2>&1); then
  echo "$out" >&2
  exit 2
fi
exit 0
