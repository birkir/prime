<span class="list-group-header"><?=__('Site Tree');?></span>

<ul class="nav-tree list-group scrollable" data-identifier="page">

	<li class="list-group-item has-children open">

		<a href="#" onclick="return false;" unselectable="on">
			<span><i class="icon-globe"></i> <?=Prime::$config->website['name'];?></span>
		</a>

		<ul class="list-group">
			<?=View::factory('Prime/Page/Tree/Node')->set('nodes', $nodes)->set('open', $open)->set('url', '');?>
		</ul>

	</li>

	<script class="context" type="text/x-handlebars-template">
		<ul class="dropdown-menu" role="menu">
			<li><a href="{{href}}?mode=design" tabindex="-1" target="PrimeLive"><?=__('Open');?></a></li>
			<li><a href="{{href}}" tabindex="-1" target="_blank"><?=__('Open in new tab');?></a></li>
			<li class="divider"></li>
			<li><a href="/Prime/Page/Create/{{id}}" tabindex="-1" data-id="{{id}}" onclick="return prime.page.create(this);"><?=__('New page...');?></a></li>
			<li class="divider"></li>
			<li><a href="/Prime/Page/Properties/{{id}}" tabindex="-1" onclick="return prime.page.properties(this);"><?=__('Properties');?></a></li>
			<li class="divider"></li>
			<li class="disabled"><a href="/Prime/Page/Move/{{id}}" tabindex="-1" onclick="return false;"><i class="icon-folderalt"></i><?=__('Move to...');?></a></li>
			<li><a href="/Prime/Page/Rename/{{id}}" tabindex="-1" onclick="return prime.rename(this, prime.page.rename);"><?=__('Rename...');?></a></li>
			<li class="divider"></li>
			<li><a href="/Prime/Page/Remove/{{id}}" tabindex="-1" data-message="<?=__('You are about to delete this page, are you sure?');?>" onclick="return prime.page.remove(this);"><i class="icon-trash"></i><?=__('Delete');?></a></li>
		</ul>
	</script>

</ul>