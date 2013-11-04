<?php if ( ! $request->is_initial()): ?>
    <span class="list-group-header"><?=__('Fieldsets');?></span>
<?php endif; ?>

<ul class="nav-tree list-group scrollable" <?php if ($request->is_initial()): ?>style="margin: -20px;border: none;overflow: auto;max-height: 220px;"<?php else: ?>data-identifier="fieldsets"<?php endif; ?>>

    <li class="list-group-item has-children open">

        <a href="#" onclick="return false;" unselectable="on" data-dir="1" data-root="1">
            <span><i class="fa fa-folder-open"></i> <?=__('Fieldsets');?>
        </a>

        <ul class="list-group">
            <?=View::factory('Prime/Module/Fieldset/Tree/Node')->set('nodes', $nodes)->set('open', $open)->set('request', $request);?>
        </ul>

    </li>
    <?php if ( ! $request->is_initial()): ?>
    <script class="context" type="text/x-handlebars-template">
        <ul class="dropdown-menu" role="menu">
            <li class="{{#if dir}}disabled{{/if}}"><a href="/Prime/Module/Fieldset/List/{{id}}" onclick="return prime.view(this.href);" tabindex="-1"><?=__('Open');?></a></li>
            <li class="divider"></li>
            <li class="{{#unless dir}}disabled{{/unless}}"><a href="#" onclick="return prime.fieldset.create(this, 0);"><?=__('New folder...');?></a></li>
            <li><a href="#" onclick="return prime.fieldset.create(this, 1);"><?=__('New fieldset...');?></a></li>
            <li class="divider"></li>
            <li class="{{#if dir}}disabled{{/if}}"><a href="/Prime/Field/Properties/Module_Fieldset:{{id}}" onclick="return prime.field.properties(this, {{id}});"><?=__('Properties');?></a></li>
            <li class="divider"></li>
            <li class="{{#if root}}disabled{{/if}}"><a href="/Prime/Module/Fieldset/Rename/{{id}}" tabindex="-1" onclick="return prime.rename(this);"><?=__('Rename...');?></a></li>
            <li class="divider"></li>
            <li class="{{#if root}}disabled{{/if}}"><a href="/Prime/Module/Fieldset/Remove/{{id}}" tabindex="-1" data-message="<?=__('You are about to delete this {{#if dir}}folder{{else}}fieldset{{/if}}, are you sure?');?>" onclick="return prime.fieldset.remove(this);"><i class="fa fa-trash-o"></i><?=__('Delete');?></a></li>
        </ul>
    </script>
<?php endif; ?>

</ul>