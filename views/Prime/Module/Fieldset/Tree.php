<?php function RenderFieldsetTree($nodes) { ?>
    <?php foreach ($nodes->recursive()->find_all() as $node): ?>
        <?php $children = $node->recursive()->count_all() > 0; ?>
        <li class="list-group-item<?php if ($children): ?> has-children<?php endif; ?>">
            <?php if ((int) $node->type === 1): ?>
                <a href="/Prime/Module/Fieldset/Detail/<?=$node->id;?>" onclick="Prime.LoadView(this.href); return false;">
                    <i class="icon-list-alt"></i>
                    <?=$node->name;?>
                </a>
            <?php else: ?>
                <a href="#" onclick="return false;" unselectable="on">
                    <i class="icon-folder-close"></i>
                    <?=$node->name;?>
                </a>
            <?php endif; ?> 
            <?php if ($children): ?>
                <ul class="list-group">
                    <?php RenderFieldsetTree($node); ?>
                </ul>
            <?php endif; ?>
        </li>
    <?php endforeach; ?>
<?php } ?>

<span class="list-group-header" style="padding: 4px 10px;"><?=__('Fieldsets');?></span>

<ul class="nav-tree list-group" style="border: 1px solid #e5e5e5; margin: 0 -1px;">
    <li class="list-group-item has-children open">
        <a href="#" onclick="return false;" unselectable="on"><i class="icon-folder-close"></i> <?=__('Fieldsets');?></a>
        <ul class="list-group">
            <?php RenderFieldsetTree($nodes); ?>
        </ul>
    </li>
</ul>


<script type="text/javascript">
<?php if ( ! Request::current()->is_ajax()): ?>window.onload = function () {<?php endif; ?>
    $('.nav-tree').each(Prime.TreeView);
<?php if ( ! Request::current()->is_ajax()): ?>}<?php endif; ?>
</script>