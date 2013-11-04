<?php if ( ! function_exists('render_tree')): function render_tree($pages) { ?>

	<?php foreach ($pages as $page): ?>

		<li<?=($page['active'] ? ' class="active"' : NULL);?>>

			<?=HTML::anchor($page['url'], $page['name']);?>

			<?php if ( ! empty($page['pages'])): ?>

				<ul>
					<?php render_tree($page['pages']);?>
				</ul>

			<?php endif; ?>

		</li>

	<?php endforeach; ?>

<?php } endif; ?>

<?php render_tree($pages); ?>