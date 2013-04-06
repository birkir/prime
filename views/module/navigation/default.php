<?php defined('SYSPATH') or die('No direct script access.');

/**
 * Render page tree
 * 
 * @param  ORM  $items
 * @return void
 */
if ( ! function_exists('render'))
{
	function render($items, $initial = TRUE)
	{
		// Only print list if nodes available
		if ( ! empty($items))
		{
			// List element starts
			echo '<ul'.($initial ? ' class="nav"' : NULL).'>';

			// Loop through nodes
			foreach ($items as $item)
			{
				// List item element starts
				echo '<li'.($item->active ? ' class="active"' : NULL).'>';

				// Print anchor element
				echo HTML::anchor($item->url, $item->name);

				// Render more items (if available)			
				render($item->children, FALSE);

				// List item element ends
				echo '</li>';
			}

			// List element ends
			echo '</ul>';
		}
	}
}

// Call tree render function
render($items);