<?php if ( ! function_exists('RenderTree')): ?>
<?php function RenderTree($nodes, $c, $level = 1, $lastURI = NULL) { ?>
	<?php foreach ($nodes->recursive()->find_all() as $node): ?>
		<?php if ($level >= $c[0]['from_level'] AND $level <= $c[0]['to_level']): ?>
	        <?php $children = $node->recursive()->count_all() > 0; ?>
	        <li<?php if (in_array($node->id, $c[1])):?> class="active"<?php endif; ?>>
	            <a href="<?=$lastURI;?>/<?=$node->slug;?>"><?=$node->name;?></a>
	            <?php if ($children): ?>
	                <ul>
	                    <?php RenderTree($node, $c, $level + 1, $lastURI.'/'.$node->slug); ?>
	                </ul>
	            <?php endif; ?>
	        </li>
	    <?php elseif (in_array($node->id, $c[1])): ?>
			<?php RenderTree($node, $c, $level + 1, $lastURI.'/'.$node->slug); ?>
		<?php endif; ?>
	<?php endforeach; ?>
<?php } ?>
<?php endif; ?>
<?php RenderTree($items, [$settings, $actives]); ?>