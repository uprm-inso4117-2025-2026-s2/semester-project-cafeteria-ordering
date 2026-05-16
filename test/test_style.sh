#!/usr/bin/env bash
set -euo pipefail

DOC="documentation/LectureTopicTasks/performance-testing/order-queue-management-performance-testing-strategy.adoc"

if [[ ! -f "$DOC" ]]; then
  echo "Missing required documentation file: $DOC"
  exit 1
fi

if ! grep -q '^= LTT: Performance Testing Strategy Research - Order Queue Management$' "$DOC"; then
  echo "Document title is missing or does not match the expected LTT title."
  exit 1
fi

if grep -n $'\t' "$DOC"; then
  echo "Tabs found in documentation file. Use spaces for formatting."
  exit 1
fi

if grep -n '[[:blank:]]$' "$DOC"; then
  echo "Trailing whitespace found in documentation file."
  exit 1
fi

required_sections=(
  "== Performance Testing Types"
  "== Expected Workload and Traffic Scenarios"
  "== Queue-Specific Performance Bottlenecks"
  "== Cafeteria-Specific Risks"
  "== Ready for Review"
)

for section in "${required_sections[@]}"; do
  if ! grep -q "^${section}$" "$DOC"; then
    echo "Missing required section: $section"
    exit 1
  fi
done

echo "Style checks passed."
