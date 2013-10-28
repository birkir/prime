<span class="list-group-header"><?=__('Users');?></span>

<ul class="nav-tree list-group scrollable" data-identifier="user">

    <li class="list-group-item has-children open">

        <a href="#" onclick="return false;" unselectable="on" data-nocontext="1">
            <span><i class="icon-folder-open"></i> <?=__('Users');?>
        </a>

        <ul class="list-group">
            
			<li<?=HTML::attributes(['class' => 'list-group-item active']);?>>
				<b class="caret" onselectstart="return false;"></b>
				<a href="/Prime/User/List" onclick="return prime.view(this.href);" data-nocontext="1"><span><i class="icon-group"></i> <?=__('All users');?></span></a>
			</li>

			<li<?=HTML::attributes(['class' => 'list-group-item has-children open']);?>>

				<b class="caret" onselectstart="return false;"></b>

				<a href="#" onclick="return false;" unselectable="on" data-roles="1">
					<span><i class="icon-folder-open"></i> <?=__('Roles');?></span>
				</a>

				<ul class="list-group">
					<?php foreach ($nodes as $node): ?>
						<li<?=HTML::attributes(['class' => 'list-group-item']);?>>
							<b class="caret" onselectstart="return false;"></b>
							<a href="/Prime/User/List/<?=$node->id;?>" data-id="<?=$node->id;?>" onclick="return prime.view(this.href);">
								<span><i class="icon-user"></i> <?=UTF8::ucfirst($node->name);?></span>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>

			</li>
        </ul>

    </li>

    <script class="context" type="text/x-handlebars-template">
    {{#unless nocontext}}
        <ul class="dropdown-menu" role="menu">
        {{#if roles}}
        	<li><a href="/Prime/User/Create_Role" onclick="return prime.user.create_role(this);"><?=__('New role...');?></a></li>
        {{else}}
        	<li><a href="/Prime/User/List/{{id}}" onclick="return prime.view(this.href);"><?=__('Open');?></a></li>
        	<li class="divider"></li>
            <li><a href="/Prime/Field/Properties/Role:{{id}}" onclick="return prime.field.properties(this, {{id}});"><?=__('Properties');?></a></li>
        	<li class="divider"></li>
            <li><a href="/Prime/User/Rename_Role/{{id}}" tabindex="-1" onclick="return prime.rename(this);"><?=__('Rename...');?></a></li>
        	<li class="divider"></li>
        	<li><a href="/Prime/User/Remove_Role/{{id}}" onclick="return prime.user.remove(this, true);" data-title="<?=__('Delete role');?>" data-message="<?=__('Are you sure you want to delete this role?');?>"><i class="icon-trash"></i> <?=__('Delete');?></a></li>
        {{/if}}

        </ul>
    {{/unless}}
    </script>

</ul>