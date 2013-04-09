/*jslint nomen: true*/
/*jslint unparam: true*/
var prime = (function () {

    'use strict';

    // use jquery from parent
    var $ = window.top.jQuery,
        _prime = {};

    // is user authenticated
    _prime.authenticate = function () {

        // send json request
        $.getJSON('/prime/frontend/authenticated', function (request) {
            if (request.status === 'success') {
                prime.init();
            }
        });
    };

    // init frontend live edit
    _prime.init = function () {

        // set prime scope
        prime.scope = window.top.app;

        // set click handler to document
        $(document).on('click', function () {
            prime.scope.mouseup();
            prime.mouseup();
        });

        // preload context images
        $(document).find('body').append($('<div class="preloadiconimage"></div>'));

        // when probably loaded
        setTimeout(function () {

            // throw them out
            $(document).find('.preloadiconimage').remove();
        }, 2500);

        // load context
        prime.context();
    };

    // context menus
    _prime.context = function () {

        // load frontend module contexts
        $.getJSON('/prime/frontend/modules/' + prime.scope.page.id, function (modules) {

            // attach drag'n'drop operation to regions
            $(document).find('[data-prime-region]').each(function (i, item) {

                // remove previous dropzones
                $(this).find('.prime-dropzone').remove();

                // attach dropzone to end of region
                $(this).append($('<div class="prime-dropzone">Dropzone</div>'));
            });

            // add controls to module
            $(document).find('[data-prime-module]').each(function (i, item) {

                // attach dropzone before each module
                $(this).before($('<div class="prime-dropzone">Dropzone</div>'));

                // setup some variables
                var module = modules[$(this).data('prime-module')],
                    x = 0,
                    li;

                // setup context menu
                this.context = $('<ul class="dropdown-menu contextmenu"></ul>');

                // append to first level module for positioning of menu
                this.context.appendTo($(this).parents('.prime-module:last').length === 0 ? this : $(this).parents('.prime-module:last'));

                // loop through menu items
                while (x < module.length) {

                    // create list item
                    li = $('<a/>', {
                        'href': '#',
                        'onclick': module[x].action
                    });

                    // set list item name and (?icon)
                    li.html('<i class="icon-' + module[x].icon + '"></i> ' + module[x].name);

                    // append to context ul
                    this.context.append($('<li/>').append(li));

                    // js lint does not like x++
                    x = x + 1;
                }

                // double click on module handler
                $(this).on('dblclick', function (e) {

                    // load region settings
                    prime.scope.page.region.settings($(this).data('prime-module'));

                    // revert selection
                    if (window.getSelection) {
                        window.getSelection().removeAllRanges();
                    } else if (document.selection) {
                        document.selection.empty();
                    }
                });

                // on contextmenu
                $(this).on('contextmenu', function (e) {

                    // hide previous open contextmenus
                    $(document).find('.contextmenu').removeClass('open');

                    // accurate to mouse position
                    this.context.css({
                        top: e.pageY + 1,
                        left: e.pageX + 1
                    }).addClass('open');

                    // prevent default context menu (need force flag for this one)
                    e.preventDefault();

                    // and return false
                    return false;
                });
            });
        });
    };

    // mouseup handler
    _prime.mouseup = function () {
        $(document).find('.contextmenu.open').removeClass('open');
    };

    // try authenticate
    _prime.authenticate();

    // return prime object
    return _prime;
}());
/*jslint unparam: false*/
/*jslint nomen: false*/