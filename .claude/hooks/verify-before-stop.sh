#!/bin/bash
# .claude/hooks/verify-before-stop.sh
input=$(cat)

# Цей хід уже блокували — не блокуємо вдруге, інакше цикл
if [ "$(jq -r '.stop_hook_active' <<<"$input")" = "true" ]; then
  exit 0
fi

# Гілка нічим не відрізняється від main — нічого перевіряти
base=$(git merge-base HEAD origin/main)
if git diff --quiet "$base" && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  exit 0
fi

# Цей стан гілки вже був зеленим — не запускаємо вдруге
state=$( {
  git diff "$base"
  git ls-files --others --exclude-standard
  git ls-files --others --exclude-standard -z | xargs -0 cat
} 2>/dev/null | git hash-object --stdin )
cache="$(git rev-parse --git-dir)/verify-before-stop.ok"
if [ "$(cat "$cache" 2>/dev/null)" = "$state" ]; then
  exit 0
fi

if ! out=$( { npm run -s typecheck && npm run -s test:unit; } 2>&1 ); then
  echo "Typecheck або unit червоні. Виправ перед завершенням:" >&2
  echo "$out" | tail -n 40 >&2
  exit 2
fi
echo "$state" > "$cache"
exit 0
