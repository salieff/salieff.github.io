#!/bin/sh

set -xe

rm -f Packages Packages.gz Packages.bz2

dpkg-scanpackages -m . /dev/null > Packages
gzip -c9 Packages > Packages.gz
bzip2 -c9 Packages > Packages.bz2
