<ul class="pagination">

	<li<?php if ( ! $previous_page): ?> class="disabled"<?php endif; ?>>
		<a href="<?=URL::query(['page' => $previous_page]);?>"><?='&laquo;';?></a>
	</li>

	<?php for ($i = 1; $i <= $total_pages; $i++): ?>

		<li<?php if ($i === $current_page): ?> class="active"<?php endif; ?>>
			<a href="<?=URL::query(['page' => $i]);?>"><?=$i;?></a>
		</li>

	<?php endfor ?>

	<li<?php if ( ! $next_page): ?> class="disabled"<?php endif; ?>>
		<a href="<?=URL::query(['page' => $next_page]);?>"><?='&raquo;';?></a>
	</li>

</ul>