#!/bin/sh

set -xe

find './deb-package/Applications' -type f -exec md5sum '{}' ';' | sed -e 's;./deb-package;;' > './deb-package/DEBIAN/md5sums'

SIZEKB=`du -skL ./deb-package/Applications/*.app | awk '{ print $1; }'`
perl -p -i -e 's/Installed-Size: \d+/Installed-Size: '"${SIZEKB}"'/g' './deb-package/DEBIAN/control'

VERS=`cat './deb-package/DEBIAN/control' | grep 'Version:' | sed -e 's/Version: //'`
NAME=`cat './deb-package/DEBIAN/control' | grep 'Package:' | sed -e 's/Package: //'`

rm -f "../cydia/${NAME}_${VERS}_iphoneos-arm.deb"
fakeroot dpkg-deb -Zgzip --build './deb-package' "../cydia/${NAME}_${VERS}_iphoneos-arm.deb"
