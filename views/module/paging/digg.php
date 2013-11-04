<ul class="pagination">

	<li<?php if ( ! $previous_page): ?> class="disabled"<?php endif; ?>>
		<a href="<?=URL::query(['page' => $previous_page]);?>"><?='&laquo;&nbsp;'.__('Previous');?></a>
	</li>

	<?php if ($total_pages < 13): ?>

		<?php for ($i = 1; $i <= $total_pages; $i++): ?>
			<li<?php if ($current_page === $i): ?> class="active"<?php endif; ?>>
				<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
			</li>
		<?php endfor; ?>

	<?php elseif ($current_page < 9): ?>

		<?php for ($i = 1; $i <= 10; $i++): ?>
			<li<?php if ($current_page === $i): ?> class="active"<?php endif; ?>>
				<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
			</li>
		<?php endfor; ?>

		<li class="disabled"><a href="#">&hellip;</a></li>
		<li><a href="<?=URL::query(['page' => $total_pages - 1]);?>"><?=$total_pages - 1;?></a></li>
		<li><a href="<?=URL::query(['page' => $total_pages]);?>"><?=$total_pages;?></a></li>

	<?php elseif ($current_page > $total_pages - 8): ?>

		<li><a href="<?=URL::query(['page' => 1]);?>"><?=1;?></a></li>
		<li><a href="<?=URL::query(['page' => 2]);?>"><?=2;?></a></li>
		<li class="disabled"><a href="#">&hellip;</a></li>

		<?php for ($i = $total_pages - 9; $i <= $total_pages; $i++): ?>
			<li<?php if ($current_page === $i): ?> class="active"<?php endif; ?>>
				<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
			</li>
		<?php endfor; ?>

	<?php else: ?>

		<li><a href="<?=URL::query(['page' => 1]);?>"><?=1;?></a></li>
		<li><a href="<?=URL::query(['page' => 2]);?>"><?=2;?></a></li>
		<li class="disabled"><a href="#">&hellip;</a></li>

		<?php for ($i = $current_page - 5; $i <= $current_page + 5; $i++): ?>
			<li<?php if ($current_page === $i): ?> class="active"<?php endif; ?>>
				<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
			</li>
		<?php endfor; ?>

		<li class="disabled"><a href="#">&hellip;</a></li>
		<li><a href="<?=URL::query(['page' => $total_pages - 1]);?>"><?=$total_pages - 1;?></a></li>
		<li><a href="<?=URL::query(['page' => $total_pages]);?>"><?=$total_pages;?></a></li>

	<?php endif; ?>

	<li<?php if ( ! $next_page): ?> class="disabled"<?php endif; ?>>
		<a href="<?=URL::query(['page' => $next_page]);?>"><?=__('Next').'&nbsp;&raquo;';?></a>
	</li>

</ul>