Prime CMS
=========

Fully featured content management system written in php using Kohana as backend framework and TODC modded Twitter Bootstrap as frontend framework.

## Manual installation

1. `git clone git://github.com/kohana/kohana.git /var/www/yourdomain.com`
2. `cd /var/www/yourdomain.com`
3. `git submodule add git://github.com/birkir/prime.git modules/prime`
4. `git submodule add git://github.com/birkir/media.git modules/media`
5. `cd application && chmod -R 0777 cache logs views media`
6. Edit application/bootstrap.php and add `'prime' => MODPATH.'prime',` to Kohana::modules().
7. Open localhost.

## Automatic installation

1. Download the latest pre-compiled package from downloads.
2. Unzip to root of your web server.
3. Change permissions to 0777 for application/{cache,logs,views,media}.
4. Open localhost.


Required kohana modules
-----------------------

* Media
* ORM
* Database
* Auth
* Cache
* Image