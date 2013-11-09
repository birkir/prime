<?php if ( ! $request->is_initial()): ?>
    <span class="list-group-header"><?=__('Files');?></span>
<?php endif; ?>

<ul class="nav-tree list-group scrollable" <?php if ($request->is_initial()): ?>style="margin: -20px;border: none;overflow: auto;max-height: 220px;"<?php else: ?>data-identifier="files"<?php endif; ?>>

    <li class="list-group-item has-children open">

        <a href="#" onclick="return false;" unselectable="on" data-dir="1" data-root="1">
            <span><i class="fa fa-folder-open"></i> <?=__('Files');?>
        </a>

        <ul class="list-group">
            <?=View::factory('Prime/File/Tree/Node')->set('nodes', $nodes)->set('open', $open)->set('request', $request);?>
        </ul>

    </li>
    <?php if ( ! $request->is_initial()): ?>
    <script class="context" type="text/x-handlebars-template">
        <ul class="dropdown-menu" role="menu">
            <li class="{{#if root}}disabled{{/if}}"><a href="/Prime/File/List/{{id}}" onclick="return prime.view(this.href);" tabindex="-1"><?=__('Open');?></a></li>
            <li class="divider"></li>
            <li><a href="/Prime/File/Folder_Create" onclick="return prime.file.create(this);"><?=__('New folder...');?></a></li>
            <li class="divider"></li>
            <li class="{{#if root}}disabled{{/if}}"><a href="/Prime/File/Folder_Rename/{{id}}" tabindex="-1" onclick="return prime.rename(this);"><?=__('Rename...');?></a></li>
            <li class="divider"></li>
            <li class="{{#if root}}disabled{{/if}}"><a href="/Prime/File/Folder_Delete/{{id}}" tabindex="-1" data-message="<?=__('You are about to delete this folder, are you sure?');?>" onclick="return prime.file.delete_folder(this);"><i class="fa fa-trash-o"></i><?=__('Delete');?></a></li>
        </ul>
    </script>
<?php endif; ?>

</ul>