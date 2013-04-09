<?php defined('SYSPATH') or die('No direct script access.');

/**
 * Render page tree
 * 
 * @param  ORM  $items
 * @return void
 */
if ( ! function_exists('render_navigation_breadcrumbs'))
{
	function render($items, $initial = TRUE)
	{
		// Only print list if nodes available
		if ( ! empty($items))
		{
			// Loop through nodes
			foreach ($items as $item)
			{
				// only active nodes
				if ($item->active)
				{
					echo '<li>';
					echo HTML::anchor($item->url, $item->name);
					echo '</li>';

					// loop items
					render_navigation_breadcrumbs($item->childrens, FALSE);
				}
			}
		}
	}
}

echo '<ul'.HTML::attributes(array('class' => 'breadcrumbs')).'>';

render_navigation_breadcrumbs($items);

echo '</ul>';