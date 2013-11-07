<span class="list-group-header"><?=__('Explorer');?></span>

<ul class="nav-tree list-group scrollable" data-identifier="explorer">

	<li class="list-group-item has-children open">

		<a href="#" onclick="return false;" unselectable="on" data-folder="1" data-root="1">
			<span><i class="fa fa-th"></i> <?=__('Files');?></span>
		</a>

		<ul class="list-group">
			<?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $files)->set('open', $open);?>
		</ul>

	</li>

	<script class="context" type="text/x-handlebars-template">
		<ul class="dropdown-menu" role="menu">
			<li class="{{#if folder}} disabled{{/if}}{{#if root}} disabled{{/if}}"><a href="/Prime/Explorer/File/{{id}}" tabindex="-1" onclick="prime.view(this.href);"><?=__('Open');?></a></li>
			<li class="divider"></li>
			<li{{#unless folder}} class="disabled"{{/unless}}><a href="/Prime/Explorer/Create/{{id}}" tabindex="-1" onclick="return prime.explorer.create(this, 'file');"><?=__('New file...');?></a></li>
			<li{{#unless folder}} class="disabled"{{/unless}}><a href="/Prime/Explorer/New/{{id}}" tabindex="-1" onclick="return prime.explorer.create(this, 'folder');"><?=__('New folder...');?></a></li>
			<li class="divider"></li>
			<li class="{{#if root}} disabled{{/if}}"><a href="/Prime/Explorer/Remove/{{id}}" tabindex="-1" data-message="<?=__('You are about to delete this {{#if folder}}folder{{else}}file{{/if}}, are you sure?');?>" onclick="return prime.explorer.remove(this);"><i class="fa fa-trash-o"></i><?=__('Delete');?></a></li>
			<li class="{{#if root}} disabled{{/if}}"><a href="/Prime/Explorer/Rename/{{id}}" tabindex="-1" onclick=""><?=__('Rename');?></a></li>
			<li class="divider"></li>
			<li class="{{#if folder}} disabled{{/if}}{{#if root}} disabled{{/if}}"><a href="/Prime/Field/Properties/Template:{{id}}" tabindex="-1" onclick="return prime.field.properties(this);"><?=__('Properties');?></a></li>
		</ul>
	</script>
</ul>