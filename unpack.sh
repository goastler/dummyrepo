#! /bin/bash

if [ -z "$1" ]; then
	echo "Usage: $0 <package>"
	exit 1
fi

pkg="$1"
# find the version of the package
version=$(npm view "$pkg" version)

# get the tarball of the package from npm
echo "downloading $pkg@$version"
tarball=$(npm pack "$pkg@$version")

# find the package's dir in the workspace
pkgDir=$(npx -w "$pkg" node -e 'console.log(process.cwd())')

# extract the tarball into the package's dir
tar -xvzf "$tarball" -C "$pkgDir" --strip-components=1

# remove the tarball
rm "$tarball"
