<span class="list-group-header" style="padding: 4px 10px;"><?=__('Explorer');?></span>

<ul class="nav-tree list-group" style="border: 1px solid #e5e5e5; margin: 0 -1px;">
	<li class="list-group-item has-children open">
		<a href="#" onclick="return false;" unselectable="on">
			<span style="margin-left: 7px;">
				<i class="icon-folder-open"></i> <?=__('Files');?>
			</span>
		</a>
		<ul class="list-group">
			<?=View::factory('Prime/Explorer/Tree/Node')->set('nodes', $files);?>
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