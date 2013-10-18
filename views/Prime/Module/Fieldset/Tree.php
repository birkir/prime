<span class="list-group-header"><?=__('Fieldsets');?></span>

<ul class="nav-tree list-group scrollable" data-identifier="fieldsets">

    <li class="list-group-item has-children open">

        <a href="#" onclick="return false;" unselectable="on">
            <span><i class="icon-folder-close"></i> <?=__('Fieldsets');?>
        </a>

        <ul class="list-group">
            <?=View::factory('Prime/Module/Fieldset/Tree/Node')->set('nodes', $nodes)->set('open', $open);?>
        </ul>

    </li>

    <script class="context" type="text/x-handlebars-template">
        <ul class="dropdown-menu" role="menu">
            <li><a href="#" tabindex="-1"><?=__('Open');?></a></li>
        </ul>
    </script>

</ul>