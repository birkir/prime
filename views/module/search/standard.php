<div class="panel panel-default">
	<div class="panel-heading">
		<h3><?=__('Search Results');?></h3>
		<?php if (empty($query)): ?>
			<p><?=__('Please enter a search query.');?></p>
		<?php elseif ($count === 0): ?>
			<p><?=__('No results found for :query', array(':query' => $query)); ?>
		<?php else: ?>
			<p><?=__('About :count results were found for ":query"', array(':count' => $count, ':query' => $query));?></p>
		<?php endif;?>
	</div>
	<div class="list-group">
		<?php foreach ($results as $i => $result): ?>
			<a href="<?=$result->uri();?>" class="list-group-item">
				<small class="text-muted pull-right"><?=Num::round($result->score * 100, 2);?>%</small>
				<h4 class="list-group-item-heading"><?=$result->name;?></h4>
				<p class="list-group-item-text"><?=$result->description;?></p>
				<span class="btn-link"><?=$result->uri();?></span>
			</a>
		<?php endforeach; ?>
	</div>
</div>

<?=$pagination;?>