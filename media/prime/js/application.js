/*global $, jQuery, plupload, prettyPrint */
/*jslint nomen: true, browser: true, devel: true, indent: 4 */
var app = (function () {

    'use strict';

    // return obj
    var _app = {};

    // selects
    _app.selects = function () {
        $('select.select').each(function () {
            var select_options = {
                minimumResultsForSearch: $(this).data('search') ? 1 : 100
            };
            if ($(this).data('tree')) {
                select_options.formatResult = function (node, container, query) {
                    if (node.text.match(/\*\*/)) {
                        node.text = node.text.replace(/\*\*/, '');
                        node.text = '<span class="muted">' + node.text + '</span>';
                    }
                    if (query.term !== '') {
                        node.text = node.text.replace(/[┌|│|├|└]/g, '');
                        node.text = node.text.replace(/^\s+|\s+$/g, '');
                        node.text = '&nbsp;&nbsp;' + node.text + ' <span class="muted">id=' + node.id + '</span>';
                    } else {
                        node.text = node.text.replace(/┌/g, '<b>┌</b>');
                        node.text = node.text.replace(/│/g, '<b>│</b>');
                        node.text = node.text.replace(/├/g, '<b>├</b>');
                        node.text = node.text.replace(/└/g, '<b>└</b>');
                    }
                    return node.text;
                };
                select_options.formatSelection = function (node) {
                    node.text = node.text.replace(/<[a-z]*>[┌|│|├|└]<\/[a-z]*>/g, '');
                    node.text = node.text.replace(/[┌|│|├|└]/g, '');
                    node.text = node.text.replace(/^\s+|\s+$/g, '');
                    node.text = node.text.replace(/\*\*/, '');
                    return node.text;
                };
                select_options.dropdownCssClass = 'tree-select';
            }
            $(this).removeClass('select').select2(select_options);
        });
    };

    // data grids
    _app.datagrid = function () {

        // not loaded datagrids
        $('.data-grid').not('.loaded').each(function () {

            // set scope
            var scope = $(this),
                table = $(this).find('table'),
                actions = $(this).find('.actions');

            // set datagrid as loaded
            scope.addClass('loaded');

            // fix thead on every resize
            table.theadFixed = function () {

                // find th's in table
                table.find('thead tr:eq(0) th').each(function (i, item) {

                    // fix its width
                    $(item).children().css({
                        width: $(item).width() - 6
                    });
                });
            };

            // check for table-selectable
            if (table.hasClass('table-select')) {

                // attach tableselect
                table.tableselect({
                    activeClass: 'warning'
                }).on('select', function (e, rows) {

                    // update datagrid rows selected count
                    scope.rows = [];

                    // loop through rows
                    $(rows).each(function (i, item) {
                        scope.rows.push($(item).data('id'));
                    });

                    // loop through actions
                    actions.find('.action').each(function () {

                        // set rows for easy 'onclick' access
                        this.rcount = scope.rows.length;
                        this.rone = scope.rows[0];
                        this.rlist = scope.rows;

                        // check if equals data attribute is set
                        if ($(this).data('eq') !== undefined) {
                            if (rows.length === $(this).data('eq')) {
                                $(this).removeClass('disabled');
                                this.disabled = false;
                            } else {
                                $(this).addClass('disabled');
                                this.disabled = true;
                            }
                        }

                        // check if greater than data attribute is set
                        if ($(this).data('gt') !== undefined) {
                            if (rows.length > $(this).data('gt')) {
                                $(this).removeClass('disabled');
                                this.disabled = false;
                            } else {
                                $(this).addClass('disabled');
                                this.disabled = true;
                            }
                        }
                    });
                }).on('tableselect.dblclick', function (e, item) {

                    // double click url
                    var url = $(this).data('dblclick');

                    // go to url, replaced %1 with item id
                    window.location = url.replace('%1', item.data('id'));
                }).tablesorter().tablesorterPager({
                    container: scope.find('.navbar-fixed-bottom'),
                    positionFixed: false
                }).on('applyWidgets', table.theadFixed);

                // loop through actions
                actions.find('.action').on('click', function () {

                    // attach disabled flag for onclick events
                    this.disabled = $(this).hasClass('disabled');

                    // disable link anchor
                    return false;
                });

                $(window).on('resize', table.theadFixed).trigger('resize');
            }
        });
    };

    // multiupload handler
    _app.upload = function () {

        if ($(this).hasClass('loaded')) {
            return false;
        }

        // create variables
        var browseButton = $(this).find('.act-select'),
            startButton = $(this).find('.act-start'),
            stopButton = $(this).find('.act-stop'),
            infoSpeed = $(this).next().find('.info-speed'),
            fileList = $(this).find('tbody'),
            uploadId = Math.floor(Math.random() * 6565),
            dropText = $(this).find('tbody tr.droptext');

        // set loaded state
        $(this).attr('id', 'u' + uploadId).addClass('loaded');

        browseButton.attr('id', 'uBrowse' + uploadId);

        fileList.attr('id', 'uFilelist' + uploadId);

        // initialize uploader
        var uploader = new plupload.Uploader({
            runtimes: 'gears,html5,flash,silverlight,browserplus',
            browse_button: 'uBrowse' + uploadId,
            container: 'u' + uploadId,
            max_file_size: '50mb',
            chunk_size: '5mb',
            drop_element: 'uFilelist' + uploadId,
            dragdrop: true,
            url: $(this).data('endpoint'),
            flash_swf_url: '/media/prime/js/plupload/flash.swf',
            silverlight_xap_url: '/media/prime/js/plupload/silverlight.xap',
            filters: []/*
                { title: 'Image files', extensions: 'jpg,gif,png' },
                { title: 'Zip files', extensions: 'zip' }
            ]*/
        });

        // when the queue changes
        uploader.bind('QueueChanged', function (u) {
            $(uploader.files).each(function (i, file) {
                if (file.status === 5) {
                    uploader.removeFile(file);
                }
            });
            if (u.files.length === 0) {
                startButton.addClass('disabled');
                fileList.append(dropText);
            } else {
                startButton.removeClass('disabled');
                fileList.find('.droptext').remove();
            }
        });

        uploader.bind('StateChanged', function (u) {
            if (u.state === plupload.STARTED) {
                startButton.addClass('disabled');
                stopButton.removeClass('disabled');
            } else {
                startButton.removeClass('disabled');
                stopButton.addClass('disabled');
            }
        });

        // when files are added event
        uploader.bind('FilesAdded', function (u, files) {

            // loop through files
            $.each(files, function (i, file) {

                // dom object
                var item = {
                    row: $('<tr/>', { 'id': file.id }),
                    td_name: $('<td/>', { 'class': '' }).text(file.name),
                    td_size: $('<td/>', { 'class': '' }).text(plupload.formatSize(file.size)),
                    td_load: $('<td/>', { 'class': '' }),
                    td_actions: $('<td/>', { 'class' : ''}),
                    remove: $('<a/>', { 'class': 'icon-remove remove pull-right', 'href': '#' }),
                    progress: $('<div/>', { 'class': 'progress active' }),
                    bar: $('<div/>', { 'class': 'bar', 'style': 'width: 0%;' })
                };

                // loading table cell
                item.td_load.append(item.progress.append(item.bar));

                // actions table cell
                item.td_actions.append(item.remove);

                // create dom
                item.row.append(item.td_name).append(item.td_size).append(item.td_load).append(item.td_actions);

                // remove on click
                item.remove.on('click', function (e) {

                    // proxy function
                    uploader.removeFile(file);

                    return false;
                });

                // attach to file list
                fileList.append(item.row);
            });
        });

        // upload progress event
        uploader.bind('UploadProgress', function (u, file) {
            var _file = $(document.getElementById(file.id));
            _file.find('.bar').css({  width: file.percent + '%' });
            infoSpeed.html(u.total.percent + '%');
        });

        // attach to error event
        uploader.bind('Error', function (u, error) {
            var _file = $(document.getElementById(error.file.id));

            // do some progress bar movements
            _file.find('.remove').remove();
            _file.find('.progress').removeClass('active');
            _file.find('.bar').addClass('bar-danger').css({ width: '100%' });

            // remove file on specific codes
            if (error.code === -600) {
                _file.remove();
            }

            infoSpeed.html('<span class="text-error">' + error.message + '</span>');
        });

        // on removing of files
        uploader.bind('FilesRemoved', function (u, files) {
            $(files).each(function (i, file) {
                var _file = $(document.getElementById(file.id));
                _file.remove();
            });
        });

        // attach to uploaded event
        uploader.bind('FileUploaded', function (u, file) {
            var _file = $(document.getElementById(file.id));

            _file.find('.remove').remove();
            _file.find('.progress').removeClass('active');
            _file.find('.bar').addClass('bar-success').css({ width: '100%' });

            $('.jstree').each(function () {
                $(this).jstree('refresh');
            });
        });

        // initialize uploader
        uploader.init();

        // start the upload button
        startButton.on('click', function (e) {
            uploader.start();
            e.preventDefault();
            return false;
        });

        // stop the upload and remove files in queue
        stopButton.on('click', function (e) {
            uploader.stop();
            $(uploader.files).each(function (i, file) {
                uploader.removeFile(file);
            });
            e.preventDefault();
            return false;
        });

        return uploader;
    };

    // modal window
    _app.modal = function (url, backdrop, classes) {

        // default add backdrop
        if (backdrop === undefined) {
            backdrop = false;
        }

        // default to fade
        if (classes === undefined) {
            classes = [];
        }

        // find all open modal windows and close them
        $('body > .modal:hidden').remove();

        // request url with jquery ajax
        var request = $.ajax({
            type: 'GET',
            url: url,
            cache: false
        });

        // on done
        request.done(function (response) {
            var modal = $('<div/>', {
                'class': 'modal ' + classes.join(' ')
            }).append(response);

            modal.modal({ backdrop: backdrop });
        });

        // on failure
        request.fail(function (jqXHR, textStatus) {
            console.log('Request failed: ' + textStatus);
            console.log(jqXHR);
        });

        return false;
    };

    // alert dialog
    _app.alert = function (config) {

        // default options
        var defaults = {
            closeButton: true,
            classes: null,
            title: null,
            content: '',
            timeout: 0,
            styles: { position: 'absolute', bottom: 0, right: 15, zIndex: 10 }
        };

        // extend options
        var options = $.extend({}, defaults, config);

        // setup dom
        var _alert = $('<div/>', { 'class' : 'alert fade in' }).css(options.styles),
            _alertClose = $('<button/>', { 'type' : 'button', 'class': 'close', 'data-dismiss' : 'alert' }).html('&times;');

        // check for close button
        if (options.closeButton === true) {
            _alert.append(_alertClose);
        }

        // check for optimal classes
        if (options.classes !== null) {
            _alert.addClass(options.classes);
        }

        // append title and content
        _alert.append((options.title !== null ? '<strong>' + options.title + '</strong><br>' : '') + options.content);

        // check for timeout
        if (options.timeout > 0) {

            // set timeout to ms
            setTimeout(function () { _alert.alert('close'); }, options.timeout);
        }

        // append alert to body
        $('body').append(_alert);
    };

    // update panel with url
    _app.panel = function (where, url, callback) {

        // remove body classes
        if (where === '.rightpanel' || where === '.leftpanel') {
            $('body').removeClass('with-' + where.substring(1)).find(where).empty();
        }

        // request url with ajax
        var request = $.ajax({
            type: 'GET',
            url: url,
            cache: false
        });

        // on done
        request.done(function (response) {

            // set where
            $(where).html(response);

            // set body classes
            if (where === '.rightpanel' || where === '.leftpanel') {
                $('body').addClass('with-' + where.substring(1));
            }

            // setup callback
            if (callback !== undefined && typeof callback  === 'function') {
                callback(where, response);
            }
        });

        // on failure
        request.fail(function (jqXHR, textStatus) {
            console.log('Request failed: ' + textStatus);
            console.log(jqXHR);
        });
    };

    // confirm dialog
    _app.confirm = function (title, text, callback) {

        // find all open modal windows and close them
        $('body > .modal:hidden').remove();

        // dom definition
        var modal = $('<div/>', { 'class': 'modal' }),
            header = $('<div/>', { 'class': 'modal-header' }).appendTo(modal),
            button = $('<button/>', { 'class': 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' }).html('&times;').appendTo(header),
            h3 = $('<h3/>').text(title).appendTo(header),
            mbody = $('<div/>', { 'class': 'modal-body scrollable' }).html(text).appendTo(modal),
            mfooter = $('<div/>', { 'class': 'modal-footer' }).appendTo(modal),
            cancel = $('<button/>', { 'class': 'btn', 'data-dismiss': 'modal', 'aria-hidden': 'true' }).text('Cancel').appendTo(mfooter),
            confirm = $('<button/>', { 'class': 'btn btn-danger', 'type': 'submit' }).text('Confirm').appendTo(mfooter);

        // open modal
        modal.modal({ backdrop: true });

        // trigger focus event to cancel button
        cancel.trigger('focus');

        // confirm handler
        confirm.on('click', function () {

            // callback
            if (callback !== undefined && typeof callback  === 'function') {
                callback(true);
            }

            // close the modal
            modal.modal('hide');

            // dont do anything
            return false;
        });

        return false;
    };

    // mouse up function
    _app.mouseup = function () {

        // trigger document click
        $(document).trigger('click');

        // also hide jstree context menu
        $('#vakata-contextmenu').css({ visibility: 'hidden' });
    };

    // tree core
    _app.tree = function (options) {

        // default options
        var defaults = {
            icons: false,
            ajax: function (node) {
                return options.url + '/tree/' + (node.data ? node.data('id') : '');
            },
            dragdrop: true,
            sort: true,
            url: '',
            context: function (node) {
                return {};
            },
            pushState: true,
            selectNode: function (id) {
                return options.url + '/edit/' + id;
            },
            renameNode: function (name, id) {
                var tree = this;
                $.create(options.url + '/rename/' + id, { name: name }, function (response) {
                    if (response.status === 'success') {
                        tree.rslt.obj.data('id', response.message);
                    } else {
                        tree.inst.refresh();
                        app.alert({ content: response.message, classes: 'alert-error' });
                    }
                });
                return true;
            },
            createNode: function (name, parent) {
                var tree = this;
                $.create(options.url + '/create', { name: name, type: $(tree.rslt.obj).data('type'), parent: parent }, function (response) {
                    if (response.status === 'success') {
                        tree.rslt.obj.data('id', response.message);
                    } else {
                        tree.inst.refresh();
                        app.alert({ content: response.message, classes: 'alert-error' });
                    }
                });
            },
            moveNode: function (id, ref, pos) {
                var tree = this;
                $.create(options.url + '/move/' + id, { reference: ref, position: pos }, function (response) {
                    if (response.status === 'success') {
                        console.log('doneeh');
                    } else {
                        tree.inst.refresh();
                        app.alert({ content: response.message, classes: 'alert-error' });
                    }
                });
            },
            deleteNode: function (id) {
                return true;
            }
        };

        // options extended
        options = $.extend(defaults, options);

        var tree_config = {
            plugins: [
                'json_data',
                'themes',
                'ui',
                'crrm',
                'contextmenu',
                'cookies'
            ],
            core: {
                animation: false
            },
            json_data: {
                ajax: {
                    url: options.ajax,
                    success: function (data) {
                        return data.items;
                    }
                }
            },
            themes: {
                theme: '',
                dots: false,
                icons: options.icons
            },
            cookies: {
                cookie_options: {
                    path: options.url
                }
            },
            contextmenu: {
                items: options.context
            }
        };

        if (options.sort === true) {
            tree_config.sort = function (a, b) {
                var aa = (($(a).data('type') === 'folder' ? 'a' : 'b') + this.get_text(a));
                var bb = (($(b).data('type') === 'folder' ? 'a' : 'b') + this.get_text(b));
                return aa.localeCompare(bb);
            };
            tree_config.plugins.push('sort');
        }

        if (options.dragdrop === true) {
            tree_config.plugins.push('dnd');
        }

        // tree
        var tree = $('.jstree').on('loaded.jstree', function (event, data) {

            // check if path is set to jstree node
            if ($(this).data('path')) {

                // dont select anything from cookies
                data.inst.data.ui.to_select = [];

                // deselect nodes
                $(this).jstree('deselect_all');

                // select node wanted
                $(this).jstree('select_node', $(this).find('#' + $(this).data('path')));
            }
        }).jstree(tree_config);

        tree.createNode = function (name, type) {
            return 'awesome';
        };

        // select node event
        tree.bind('select_node.jstree', function (e, tree) {

            // get selectNode callback
            var location = options.selectNode.call(tree, $(tree.rslt.obj).data('id'));

            // check for location
            if (location && options.pushState === true && window.location.pathname !== location) {

                // send location to history
                window.history.pushState({ node: $(tree.rslt.obj).data('id') }, window.document.title, location);
            }
        });

        // rename node event
        tree.bind('rename_node.jstree', function (e, tree) {

            // variables
            var node = $(tree.rslt.obj);

            // check if no id is set
            if (node.data('id') === undefined) {
                options.createNode.call(tree, tree.inst.get_text(node), node.parents('li').data('id'));
            } else {
                options.renameNode.call(tree, tree.inst.get_text(node), node.data('id'));
            }
        });

        // move node event
        tree.bind('move_node.jstree', function (e, tree) {

            // setup variables
            var node = tree.rslt.o,
                ref  = tree.rslt.r,
                pos  = tree.rslt.p;

            // call move node function
            options.moveNode.call(tree.inst, node.data('id'), ref.data('id'), pos);
        });

        // remove node event
        tree.bind('delete_node.jstree', function (node, tree) {

            // call remove node function
            options.deleteNode.call(tree.inst, $(tree.rslt.obj).data('id'));
        });

        // check if push state is wanted
        if (options.pushState === true) {

            // set popState event
            window.onpopstate = function (event) {

                // only when state is available
                if (event.state) {

                    // deselect nodes
                    tree.jstree('deselect_all');

                    // select correct node
                    tree.jstree('select_node', tree.find('[data-id=' + event.state.node + ']'));
                }
            };
        }

        return tree;
    };

    // page function
    _app.page = (function () {

        // page scope
        var page = {
            region: {
                reload: function (id) {

                    // reload via ajax
                    app.panel($('#live').contents().find('[data-prime-module=' + id + ']'), '/prime/region/load/' + id, function (obj, html) {

                        // reinvoke context menus
                        document.getElementById('live').contentWindow.prime.context();
                    });
                },
                remove: function (id) {

                    // setup confirm dialog
                    return app.confirm('Are you sure?', 'You are about to delete page region.', function () {

                        // remove module div from live view
                        $('#live').contents().find('[data-prime-module=' + id + ']').remove();

                        // reload context menus and drop zones
                        document.getElementById('live').contentWindow.prime.context();

                        // make sure we have page settings loaded
                        app.page.settings();
                    });
                },
                settings: function (id) {
                    app.panel('.rightpanel', '/prime/region/settings/' + id);
                }
            },
            settings: function (id) {
                app.panel('.rightpanel', '/prime/page/settings/' + id);
            },
            create: function (id) {
                app.modal('/prime/page/create?parent=' + id);
            },
            remove: function (id) {
                return app.confirm('Are you sure?', 'You are about to remove a page and all its subpages.', function () {
                    $.destroy('/prime/page/rest/' + id, {}, function (request) {
                        if (request.status === 'success') {
                            var tree = jQuery.jstree._reference(jQuery('.jstree')[0]);
                            tree.remove(document.getElementById('page_id_<?=$item->id;?>'));
                        }
                    });
                });
            },
            properties: function (id) {
                app.modal('/prime/page/properties/' + id);
            }
        };

        // make sure tree pages is available
        if ($('.tree-pages').length === 1) {

            // page tree
            page.tree = _app.tree({
                url: '/prime/page',
                ajax: function (node) {
                    return '/prime/page/rest' + (node.data ? '/' + node.data('id') : '');
                },
                sort: false,
                context: function () {
                    return {
                        reload: { label: 'Refresh tree', action: function (obj) { this.refresh(obj); }, separator_after: true },
                        create: { label: 'Create page', action: function (obj) { page.create($(obj).data('id')); }},
                        rename: { label: 'Rename page', action: function (obj) { this.rename(obj); }},
                        remove: { label: 'Delete page', action: function (obj) { page.remove($(obj).data('id')); }, separator_after: true },
                        properties: { label: 'Properties', action: function (obj) { page.properties($(obj).data('id')); }}
                    };
                },
                selectNode: function (n) {

                    var node = $(this.rslt.obj),
                        parents = node.parents('li[data-id]'),
                        buff = [],
                        iframe = document.getElementById('live');
                    page.id = node.data('id');
                    parents.each(function (i, item) {
                        if ($(this).data('alias') !== '') {
                            buff.push($(this).data('alias'));
                        }
                    });
                    buff.reverse();
                    buff.push(node.data('alias'));
                    console.log(buff.join('/'));
                    iframe.src = '/' + buff.join('/');
                    iframe.onload = function () {
                        var script = document.createElement('script'),
                            style = document.createElement('link'),
                            head = $('#live').contents().find('head')[0];
                        script.src = '/media/prime/js/frontend.js';
                        style.href = '/media/prime/css/frontend.css';
                        script.type = 'text/javascript';
                        style.rel = 'stylesheet';
                        head.appendChild(script);
                        head.appendChild(style);
                        page.settings();
                    };

                    return '/prime/page/index/' + n;
                },
                renameNode: function (name, id) {
                    $.getJSON('/prime/page/rename/' + id + '?name=' + encodeURI(name), function (request) {
                        if (request.status === 'error') {
                            page.tree.jstree('refresh');
                        }
                    });
                }
            });

            // proxy click callback
            $(document).on('click', function () {
                if (document.getElementById('live').contentWindow.prime) {
                    document.getElementById('live').contentWindow.prime.mouseup();
                }
            });
        }

        // return page object
        return page;
    }());

    // template
    _app.template = (function () {

        // scope
        var template = {};

        // create new file or folder
        template.create = function (obj, tree, type) {

            // create node in jstree
            app.template._tree.jstree(
                'create',
                obj,
                'last',
                {
                    attr: { 'data-type' : type },
                    data: { icon: 'icon-' + (type === 'file' ? 'file' : 'folder-close'), title: (type === 'file' ? 'New file' : 'New folder'), attr: { href: '#' }}
                },

                // callback on creation
                function (newobj) {

                    // wait for sort function to run
                    setTimeout(function () {

                        // call rename on created node
                        app.template._tree.jstree('rename', newobj);

                    }, 100);
                },
                true
            );
        };

        // edit file
        template.edit = function (filepath) {

            // reload center panel with ace editor
            app.panel('.centerpanel', '/prime/template/editor/' + filepath);
        };

        // remove file or folder
        template.remove = function (node, tree) {

            // setup confirm dialog
            app.confirm('Are you sure?', 'Are you sure you want to remove this file or folder?', function () {

                // send create request
                $.create('/prime/template/remove/' + node.data('id'), function (response) {

                    // check if succeeded
                    if (response.status === 'success') {

                        // remote node from tree
                        tree.remove(node);

                    } else {

                        // alert user of error
                        app.alert({
                            classes: 'alert-error',
                            content: response.message
                        });
                    }
                });
            });
        };

        // save template
        template.save = function (name, value) {

            // send request to service
            $.update('/prime/template/save/' + name, value, function (response) {

                // setup alert configure
                var conf = {
                    timeout: 1250,
                    content: response.message,
                    classes: 'alert-success'
                };

                // check for error
                if (response.status === 'error') {
                    conf.classes = 'alert-error';
                    conf.timeout = 0;
                }

                // open alert
                app.alert(conf);
            });
        };

        // tree configure and setup
        template.tree = function () {

            var tree = _app.tree({
                url: '/prime/template',
                ajax: function (node) {
                    return '/prime/template/tree/' + (node.data ? node.data('id') : '');
                },
                context: function (node) {

                    var items = {};

                    items.reload = { label: 'Refresh tree', action: function (obj) { this.refresh(); }, separator_after: true };

                    if ($(node).data('type') === 'folder') {
                        items.create = { label: 'Create folder', action: function (obj) { template.create(obj, this, 'folder'); }};
                        items.rename = { label: 'Rename folder', action: function (obj) { this.rename(obj); }};
                        items.remove = { label: 'Delete folder', action: function (obj) { template.remove(obj, this); }, separator_after: true };
                        items.file = { label: 'New file', action: function (obj) { template.create(obj, this, 'file'); }};
                    } else {
                        items.rename = { label: 'Rename', action: function (obj) { this.rename(obj); }};
                        items.remove = { label: 'Delete', action: function (obj) { template.remove(obj, this); }, separator_after: true };
                    }

                    return items;
                },
                selectNode: function (id) {
                    if (this.rslt.obj.data('type') === 'file') {
                        app.template.edit(id);
                    }
                    return '/prime/template/edit/' + id;
                }
            });

            return tree;
        };

        // identify tree fieldsets
        if ($('.tree-templates').length === 1) {

            // call tree
            template._tree = template.tree();
        }

        return template;
    }());

    // media
    _app.media = (function () {

        var media = {
            edit: function (filepath) {

                // show panel
                app.panel('.centerpanel', '/prime/media/editor/' + filepath);
            },
            save: function (name, value) {

                // send request to service
                $.update('/prime/media/save/' + name, value, function (response) {

                    // setup alert configure
                    var conf = {
                        timeout: 1250,
                        content: response.message,
                        classes: 'alert-success'
                    };

                    // check for error
                    if (response.status === 'error') {
                        conf.classes = 'alert-error';
                        conf.timeout = 0;
                    }

                    // open alert
                    app.alert(conf);
                });
            },
            upload: function (obj, tree) {
                app.modal('/prime/media/upload/' + obj.children('a').attr('href'));
                return false;
            },
            remove: function (obj, tree) {

                // send create request
                $.create('/prime/media/remove/' + $(obj).children('a').attr('href'), function (response) {

                    // check if succeeded
                    if (response.status === 'success') {

                        // remote node from tree
                        tree.remove(obj);

                    } else {

                        // alert user of error
                        app.alert({
                            classes: 'alert-error',
                            content: response.message
                        });
                    }
                });
            },
            create: function (obj, tree, type) {

                // create node in jstree
                app.media._tree.jstree(
                    'create',
                    obj,
                    'last',
                    {
                        attr: { 'data-type' : type },
                        data: { icon: 'icon-' + (type === 'file' ? 'file' : 'folder-close'), title: (type === 'file' ? 'New file' : 'New folder'), attr: { href: '#' }}
                    },

                    // callback on creation
                    function (newobj) {

                        // wait for sort function to run
                        setTimeout(function () {

                            // call rename on created node
                            app.media._tree.jstree('rename', newobj);

                        }, 100);
                    },
                    true
                );
            },
            tree: function () {
                return _app.tree({
                    url: '/prime/media',
                    sort: true,
                    context: function (node) {

                        var ret = {
                            reload: { label: 'Refresh tree', action: function (obj) { this.refresh(); }, separator_after: true }
                        };

                        if ($(node).data('type') === 'folder') {
                            ret.create_folder = { label: 'Create folder', action: function (obj) { media.create(obj, this, 'folder'); }};
                            ret.rename_folder = { label: 'Rename folder', action: function (obj) { this.rename(obj); }};
                            ret.remove_folder = { label: 'Delete folder', action: function (obj) { media.remove(obj, this); }, separator_after: true };
                            ret.create_file = { label: 'New file', action: function (obj) { media.create(obj, this, 'file'); }};
                            ret.upload_file = { label: 'Upload files', action: function (obj) { media.upload(obj, this); }};
                        } else {
                            ret.rename_file = { label: 'Rename', action: function (obj) { this.rename(obj); }};
                            ret.remove_file = { label: 'Delete', action: function (obj) { media.remove(obj, this); }, separator_after: true };
                        }

                        return ret;
                    },
                    selectNode: function (id) {

                        var unload = window.onbeforeunload !== null ? window.onbeforeunload() : null,
                            go = true;

                        if (unload !== undefined && unload !== null) {
                            go = confirm('You havent saved your changes.' + "\n" + ' Do you want to discard changes?');
                        }

                        if (go) {

                            if (this.rslt.obj.data('type') === 'file') {
                                app.media.edit(id);
                            }

                            return '/prime/media/edit/' + id;
                        }

                        return false;
                    }
                });
            }
        };

        // identify tree fieldsets
        if ($('.tree-media').length === 1) {

            // call tree
            media._tree = media.tree();
        }

        return media;
    }());

    // logs
    _app.log = (function () {
        $('section.log').each(function () {
            var scope = $(this);

            scope.find('.select-date').datepicker({
                todayHighlight: true,
                selectable: scope.find('.available').text().split(',')
            }).on('changeDate', function (e) {
                var y = e.date.getFullYear(),
                    _m = e.date.getMonth() + 1,
                    m = (_m > 9 ? _m : '0' + _m),
                    _d = e.date.getDate(),
                    d = (_d > 9 ? _d : '0' + _d),
                    date = [y, m, d].join('/');

                app.panel('.centerpanel', '/prime/log/details/' + date);
            });
        });
    }());

    // users
    _app.users = (function () {

        // setup scope
        var users = {};

        // return users
        return users;
    }());

    // modules container
    _app.module = {};

    // module: html
    _app.module.html = (function () {

        // module scope
        var _module = {};

        // html edit method
        _module.edit = function (id) {

            // load modal via ajax
            app.modal('/prime/modules/html/edit/' + id, false, ['fade', 'large']);
        };

        // return module
        return _module;
    }());

    // module: fieldset
    _app.module.fieldset = (function () {

        // module scope
        var _module = {};

        // item object
        _module.item = {
            list: function (id) {
                $.ajax({
                    type: 'GET',
                    url: '/prime/modules/fieldset/item_list/' + id
                }).done(function (response) {
                    $('.centerpanel').html(response);
                }).fail(function (err) {
                    console.log('No list retrieved.');
                });

                return false;
            },
            create: function (id) {
                app.panel('.centerpanel', '/prime/modules/fieldset/item_create/' + id);
                return false;
            },
            edit: function (id) {
                app.panel('.centerpanel', '/prime/modules/fieldset/item_edit/' + id);
                return false;
            },
            remove: function (id) {
                return false;
            }
        };

        // field object
        _module.field = {
            list: function (id) {
                app.modal('/prime/modules/fieldset/field_list/' + id, false, ['fade', 'large']);
                return false;
            },
            create: function (id) {
                app.modal('/prime/modules/fieldset/field_create/' + id);
                return false;
            },
            edit: function (id) {
                app.modal('/prime/modules/fieldset/field_edit/' + id);
                return false;
            },
            remove: function (id) {
                return false;
            }
        };

        // create new fieldset or folder
        _module.create = function (obj, tree, type) {
            app.module.fieldset._tree.jstree('create', obj, 'last', {
                attr: { 'data-type' : type },
                data: { icon: 'icon-' + (type === 'file' ? 'list-alt' : 'folder-close'), title: (type === 'file' ? 'New fieldset' : 'New folder'), attr: { href: '#' }}
            }, function (newobj) {
                setTimeout(function () {
                    tree.rename(newobj);
                }, 30);
            }, true);
        };

        // remove fieldset item
        _module.remove = function (obj, tree) {

            // send remove request
            $.create('/prime/modules/fieldset/remove/' + obj.data('id'), function (response) {

                // remove from tree
                tree.remove(obj);
            });
        };

        // fieldset tree
        _module.tree = (function () {
            $('.jstree.tree-fieldsets').each(function () {
                _module._tree = _app.tree({
                    icons: true,
                    dragdrop: false,
                    url: '/prime/modules/fieldset',
                    context: function (node) {
                        // reset context items
                        var items = { refresh: { label: 'Refresh', action: function (obj) { this.refresh(); }, separator_after: true }};

                        // check if node is category
                        if ($(node).data('type') === 'folder') {
                            items.create = {
                                label: 'Create',
                                submenu: {
                                    fieldset: { label: 'Fieldset', action: function (obj) { app.module.fieldset.create(obj, this, 'file'); }},
                                    folder: { label: 'Folder', action: function (obj) { app.module.fieldset.create(obj, this, 'folder'); }}
                                },
                                separator_after: true
                            };
                            items.remove = { label: 'Delete', action: function (obj) { app.module.fieldset.remove(obj, this); }};
                            items.rename = { label: 'Rename', action: function (obj) { this.rename(obj); }};
                        } else {
                            items.create = { label: 'Create', action: function (obj) { app.module.fieldset.create(obj, this, 'file'); }, separator_after: true };
                            items.remove = { label: 'Delete', action: function (obj) { app.module.fieldset.remove(obj, this); }};
                            items.rename = { label: 'Rename', action: function (obj) { this.rename(obj); }};
                            items.properties = { label: 'Properties', action: function (obj) { app.module.fieldset.field.list($(obj).data('id')); }, separator_before: true };
                        }

                        return items;
                    },
                    selectNode: function (id) {
                        if (this.rslt.obj.data('type') === 'file') {
                            app.module.fieldset.item.list(id);
                        }
                        return '/prime/modules/fieldset/detail/' + id;
                    }
                });
            });
        }());

        // return module
        return _module;
    }());

    // run some funcs by init
    _app.selects();
    _app.datagrid();
    prettyPrint();
    $('.uploader').each(_app.upload);

    // return app object
    return _app;
}());
/*jslint nomen: false, browser: false, devel: false */