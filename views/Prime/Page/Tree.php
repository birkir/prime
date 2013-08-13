<?php function RenderTree($nodes, $lastURI = NULL) { ?>
    <?php foreach ($nodes->recursive()->find_all() as $node): ?>
        <?php $children = $node->recursive()->count_all() > 0; ?>
        <li class="list-group-item<?php if ($children): ?> has-children<?php endif; ?>">
            <a href="<?=$lastURI;?>/<?=$node->slug;?>/?mode=design" target="PrimeLive" data-id="<?=$node->id;?>"><i class="icon-file"></i> <?=$node->name;?></a>
            <?php if ($children): ?>
                <ul class="list-group">
                    <?php RenderTree($node, $lastURI.'/'.$node->slug); ?>
                </ul>
            <?php endif; ?>
        </li>
    <?php endforeach; ?>
<?php } ?>

<span class="list-group-header" style="padding: 4px 10px;"><?=__('Site Tree');?></span>

<ul class="nav-tree list-group" style="border: 1px solid #e5e5e5; margin: 0 -1px;">
    <li class="list-group-item has-children open">
        <a href="#" data-root="true"><i class="icon-globe"></i> <?=Prime::$config->website['name'];?></a>
        <ul class="list-group">
            <?php RenderTree($nodes); ?>
        </ul>
    </li>
</ul>

<div id="TreeContext">
    <ul class="dropdown-menu" role="menu">
        <li><a href="#" tabindex="-1" data-action="open">Open</a></li>
        <li><a href="#" tabindex="-1" data-action="open-tab">Open in new tab</a></li>
        <li class="divider"></li>
        <li><a href="#" tabindex="-1" data-action="create">Create page</a></li>
        <li class="divider"></li>
        <li><a href="#" tabindex="-1" data-action="properties">Properties</a></li>
        <li class="divider"></li>
        <li><a href="#" tabindex="-1" data-action="move"><i class="icon-folder-close"></i>Move to...</a></li>
        <li><a href="#" tabindex="-1" data-action="rename">Rename...</a></li>
        <li class="divider"></li>
        <li><a href="#" tabindex="-1" data-action="delete"><i class="icon-trash"></i>Delete</a></li>
    </ul>
</div>

<div id="PageCreateModal" class="hidden">
    <form action="">
        <div class="control-group">
            <label for="createPageName" class="control-label">Page name</label>
            <div class="controls">
                <input type="text" name="name" id="createPageName">
            </div>
        </div>
    </form>
</div>

<script type="text/javascript">
<?php if ( ! Request::current()->is_ajax()): ?>window.onload = function () {<?php endif; ?>

    $('.nav-tree').each(Prime.TreeView)
    .find('.list-group').sortable({
        revert: 25,
        helper: function (event, original) {
            return $('<div/>', { 'class': 'tree-item-drag' }).text($(original).children('a').children('span').text());
        },
        cursorAt: { top: 1, left: 1 },
        update: function (e, ui) {
            $.ajax({
                url: '/Prime/Page/MovePage/' + $(ui.item).children('a').data('id') + '?ref=' + $(ui.item).prev().children('a').data('id')
            });
        }
    });

    // setup context menu
    $('.nav-tree a').contextmenu({
        target: '#TreeContext',
        before: function () {
            var menu = this.getMenu().children('ul')[0];
            menu.active = this.$element.parent('li');

            if (this.$element.data('root')) {
                $(menu).find('a').not('[data-action=create]').parent('li').addClass('disabled');
            } else {
                $(menu).children('li').removeClass('disabled');
            }

            return true;
        }
    });

    $('#TreeContext [data-action]').on('click', function () {

        var action = $(this).data('action'),
            active = $(this).parents('ul')[0].active;

        // only allow create for root node
        if (active.children('a').data('root') && action !== 'create')
            return false;

        // open page in live view
        if (action === 'open') {
            $('iframe[name=PrimeLive]').attr('src', active.children('a').trigger('click').attr('href'));
        }

        // open page in new tab
        if (action === 'open-tab') {
            window.open(active.children('a').attr('href'), '_blank').focus();
        }

        // rename page
        if (action === 'rename') {
            var editField = $('<input/>', { type: 'text', name: 'test', class: 'input-small', value: active.children('a').children('span').text().trim() })
            .on('blur keyup', function (e) {
                var inp = $(this);
                if (e.type === 'keyup' && e.keyCode !== 13) return;
                $.ajax({
                    url: '/Prime/Page/RenamePage/' + $(this).parent('span').parent('a').data('id'),
                    type: 'POST',
                    data: { name: inp.val() },
                    dataType: 'json'
                })
                .done(function (p) {
                    var url = inp.parent('span').parent('a').attr('href').split('/'),
                        query = url[url.length - 1].indexOf('?') !== -1 ? url[url.length - 1].substr(url[url.length - 1].indexOf('?')) : '';
                    url[url.length - 1] = p.slug + query;
                    inp.parent('span').parent('a').attr('href', url.join('/'));
                    inp.before('<i class="icon-file"></i> '+p.name);
                    inp.remove();
                })
            });
            active.children('a').children('span').empty().append(editField);
            editField.trigger('focus');
        }

        // delete page
        if (action === 'delete') {
            Prime.Confirm('Page', 'Are you sure you want to delete this page?', function () {
                $.ajax({
                    url: '/Prime/Page/DeletePage/' + active.children('a').data('id')
                })
                .done(function () {
                    if (active.parent('ul').children('li').length === 1) {
                        active.parent('ul').hide().parent('li').removeClass('has-children');
                    }
                    active.remove();
                });

                return true;
            });
        }

        // create page
        if (action === 'create') {
            var dialog = Prime.Confirm('Create page', $('#PageCreateModal').html(), function (modal) {
                modal.find('form').trigger('submit');
            });

            // focus create name
            dialog.find('input[name=name]').trigger('focus');
            dialog.find('form').on('submit', function (e) {
                $.ajax({
                    url: '/Prime/Page/CreatePage/' + active.children('a').data('id'),
                    type: 'POST',
                    data: {
                        name: dialog.find('input[name=name]').val()
                    }
                })
                .done(function (tree) {
                    $('.panel-left').empty().html(tree);
                    dialog.hide();
                });
                return false;
            });
        }

    });
<?php if ( ! Request::current()->is_ajax()): ?>};<?php endif; ?>
</script>