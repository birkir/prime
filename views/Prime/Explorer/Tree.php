<span class="list-group-header"><?=__('Explorer');?></span>

<ul class="nav-tree list-group scrollable" data-identifier="explorer">

	<li class="list-group-item has-children open">

		<a href="#" onclick="return false;" unselectable="on">
			<span><i class="icon-th"></i> <?=__('Files');?></span>
		</a>

		<ul class="list-group">
			<?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $files)->set('open', $open);?>
		</ul>

	</li>

	<script class="context" type="text/x-handlebars-template">
		<ul class="dropdown-menu" role="menu">
			<li{{#if folder}} class="disabled"{{/if}}><a href="/Prime/Explorer/File/{{file}}" tabindex="-1" data-action="open">Open</a></li>
			<li class="divider"></li>
			<li><a href="#" tabindex="-1" data-action="cut"><i class="icon-cut"></i> Cut</a></li>
			<li><a href="#" tabindex="-1" data-action="copy"><i class="icon-copy"></i> Copy</a></li>
			<li class="divider"></li>
			<li><a href="#" tabindex="-1" data-action="delete"><i class="icon-trash"></i> Delete</a></li>
			<li><a href="#" tabindex="-1" data-action="rename">Rename</a></li>
			<li class="divider"></li>
			<li><a href="#" tabindex="-1" data-action="properties">Properties</a></li>
		</ul>
	</script>
</ul>