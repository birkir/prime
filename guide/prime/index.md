# Prime

Manage your website's content with this easy-to-use CMS module for Kohana.

## Getting started

To get started you have to download the Prime module from [here](http://github.com/birkir/prime/archive/3.3/master.zip) and extract its contents to your modules directory.

Once you have extracted Prime and Media module, you will have to enable them in ``application/bootstrap.php`` by adding those lines.

	Kohana::modules([
		...
		'media'     => MODPATH.'media',
		'auth'      => MODPATH.'auth',
		'database'  => MODPATH.'database',
		'image'     => MODPATH.'image',
		'orm'       => MODPATH.'orm',
		'prime'     => MODPATH.'prime'
		...
	]);

[!!] These modules are requried for the Prime module to work. But the only module needs to configured is the database module.

## Thats it!

Next step is the database installation.