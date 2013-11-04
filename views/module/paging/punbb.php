<ul class="pagination">

	<?php if ($current_page > 3): ?>
		<li>
			<a href="<?=URL::query(['page' => 1]);?>"><?=1;?></a>
		</li>

		<?php if ($current_page !== 4): ?>
			<li class="disabled"><a href="#">&hellip;</a></li>
		<?php endif; ?>
	<?php endif ?>

	<?php for ($i = $current_page - 2, $stop = $current_page + 3; $i < $stop; ++$i): ?>
		<?php if ($i < 1 OR $i > $total_pages) continue ?>

		<li<?php if ($i === $current_page): ?> class="active"<?php endif; ?>>
			<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
		</li>
	<?php endfor ?>

	<?php if ($current_page <= $total_pages - 3): ?>
		<?php if ($current_page !== $total_pages - 3): ?>
			<li class="disabled"><a href="#">&hellip;</a></li>
		<?php endif; ?>

		<li>
			<a href="<?=URL::query(['page' => $total_pages]);?>"><?=$total_pages;?></a>
		</li>
	<?php endif ?>

</ul>