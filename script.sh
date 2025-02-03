
# get the workspace dirs
dirs=$(npm list --workspaces --parseable | xargs realpath)
# echo "dirs: $dirs"

# list all files which have changed
files=$(git diff --name-only | xargs realpath)
# echo "changed_files: $files"

changed_dirs=()
# loop through all workspace dirs
for dir in $dirs; do
  # loop through all changed files
  	for file in $files; do
		# check if the file is in the workspace dir
		if [[ $file == "$dir"/* ]]; then
			changed_dirs+=($dir)
		fi
  	done
done

# remove duplicates
changed_dirs=$(echo "${changed_dirs[@]}" | tr ' ' '\n' | sort -u -r)
# echo "$changed_dirs"

# find the package.json for each changed dir and get the pkg name
pkgs=$(echo "$changed_dirs" | xargs -I {} bash -c 'cat {}/package.json | jq -r ".name"')
echo "$pkgs"
