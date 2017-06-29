#!/bin/sh

for i do
	file=`basename "$i"`
	id=`echo ${i%.*} |awk '{print tolower($0)}' | sed -e 's/ /_/g'`

    echo "<piece id=\"$id\">"
	echo "  <base>russian</base>"
	echo "  <face type=\"image\" name=\"front\">$file</face>"
	echo "</piece>"
done
