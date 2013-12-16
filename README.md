# Prime CMS Framework

[Prime](http://github.com/birkir/prime) is a CMS built on top of Kohana, the elegant, open source and object oriented HMCV framework.

The source is currently closed for personal reasons.

## Documentation
No documentation has been created, but is planned in the near future. It will be based on Kohana's `userguide` module using Markdown files.

## Installation
1. Download Kohana and follow the [install guide](http://kohanaframework.org/3.3/guide/kohana/install).
2. Download the latest stable release of Prime and unzip to your **modules** folder.
3. Open **application/bootstrap.php** and find [Kohana::modules] function and replace it with the following content:

~~~
Kohana::modules(array(
	'prime'      => MODPATH.'prime',      // Prime CMS
	'image'      => MODPATH.'image',      // Image manipulation
	'cache'      => MODPATH.'cache',      // Caching with multiple backends
	'orm'        => MODPATH.'orm',        // Object Relationship Mapping
	'database'   => MODPATH.'database',   // Database access
	'auth'       => MODPATH.'auth',       // Basic authentication
	));
~~~

4. Allow write permissions recursivly to **application** folder (chmod -R 0777).
5. Open up http://yourdomain/Prime and hit install. 
6. You are good to go!

## Quick Up & Running

~~~
git clone git@github.com:kohana/kohana.git .
git submodule add git@github.com:morgan/kohana-storage.git modules/storage
git submodule update --init --recursive
git clone git@github.com:birkir/prime.git modules/prime
chmod -R 0777 application
sed -i -e "s/\/\/ 'auth'/'auth'   /g" application/bootstrap.php
sed -i -e "s/\/\/ 'cache'/'cache'   /g" application/bootstrap.php
sed -i -e "s/\/\/ 'database'/'database'   /g" application/bootstrap.php
sed -i -e "s/\/\/ 'orm'/'orm'   /g" application/bootstrap.php
sed -i -e "s/\/\/ 'image'/'image'   /g" application/bootstrap.php
sed -i -e "s/Kohana\:\:modules(array(/Kohana\:\:modules(array(\n        'prime'         \=\> MODPATH\.'prime'\,      \/\/ Prime CMS\n        'storage'       \=\> MODPATH\.'storage'\,    \/\/ Kohana Storage/g" application/bootstrap.php
rm install.php
~~~

## Running with HHVM

Prime runs with Hip Hop virtual machine, created by Facebook.
