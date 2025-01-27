#! /bin/bash

workspaces=$(jq -r '.workspaces[]' < package.json)
echo "Workspaces directories: $workspaces"

changed_files=$(git diff --name-only 8c2b165 HEAD)
echo "Changed files: $changed_files"

for file in $changed_files; do
  for workspace in $workspaces; do
	if [[ $file == $workspace* ]]; then
	  echo "File $file is in workspace $workspace"
	fi
  done
done

