# Templates

All templates must be within **views/template** folder in the cascading file system.

## Default template

Default template is **default.php** which all pages will use if nothing else is set.

Prime comes shipped with bootstrap 3 default template file which can be overwritten.

## Template Variables

### $page

Page ORM model of the current page

### $user

User ORM model when users are logged in. Returns FALSE if no user is logged in.

### $region

Prime Region class that will allow you to define regions in the template. Region items will be attach to each page.

### $sticky

Alias of **$region** which sticks all region items to the template, not specific pages.

### $prime

Prime frontend module, allows you to add static modules to the template by its slug. ex. **$prime->module('prime.navigation')**

### $website

Website properties array.


## Defining regions

You can define regions by simply use the **$region** variable.

    <?=$region->content;?>
	...
	<?php if ($properties->sidebar === TRUE): ?>
		<?=$region->sidebar;?>
	<?php endif; ?>

You can also add sticky regions by using the **$sticky** variable.

	<?=$sticky->footer;?>

## Set template properties

Go to Explorer and right click desired template filename and hit **Properties**.