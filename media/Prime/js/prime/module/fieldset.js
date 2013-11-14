define(['jquery'], function($) {

	var fieldset = {};

	// Create
	// ------
	fieldset.create = function (item, type) {

		// get node
		var node = $('.has-context').parent(),
		    id = node.children('a').data('id'),
		    icon = type === 0 ? 'icon-folder-close' : 'icon-list-alt';

		var li = $('<li/>', { class: 'list-group-item' }),
		    b  = $('<b/>', { class: 'caret', onselectstart: 'return false;' }).appendTo(li),
		    a  = $('<a/>', { href: '#', class: 'has-context' }).appendTo(li),
		    span = $('<span/>', { html: '<i class="'+icon+'"></i> ' + (type === 0 ? 'Folder' : 'Fieldset') + ' name...' }).appendTo(a);

		// add ul to node if needed
		if ( ! node.hasClass('has-children')) {
			$('<ul/>', { class: 'list-group' }).appendTo(node);
			node.addClass('has-children');
		}

		// open node
		node.addClass('open');

		// append list item to ul
		node.children('ul').append(li);
		node.children('a').removeClass('has-context');
		$('.open.tree-context').remove();

		// fake context menu
		a[0].context = $();

		prime.rename({ href: null }, function (text) {
			var parent_id = node.children('a').data('id');
			parent_id = parent_id || '';
			$.ajax({
				url: '/Prime/Module/Fieldset/New/' + parent_id,
				type: 'POST',
				data: {
					name: text,
					type: type
				}
			})
			.done(function (response) {
				$('.panel-left').html(response).find('[data-id=' + id + ']').parent().addClass('open');
			});
		}, function () {
			li.remove();
			if (node.children('ul').children('li').length === 0) {
				node.removeClass('has-children open').children('ul').remove();
			}
		});

		return false;
	};

	fieldset.remove = function (item) {

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: 'Delete fieldset',
			body: $(item).data('message'),
			confirm: function () {
				$.ajax({
					url: item.href
				})
				.done(function (response) {
					$('.panel-left').html(response);
				});
			}
		});

		return false;
	};

	fieldset.delete = function (item) {

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: 'Delete fieldset item',
			body: 'Are you sure you want to delete this fieldset item?',
			confirm: function () {
				$.ajax({
					url: item.href
				})
				.done(function (response) {
					$('.panel-center').html(response).each(prime.elements);
				});
			}
		});

		return false;
	};

	fieldset.publish = function (item) {

		$.ajax({
			url: item.href
		})
		.done(function (response) {
			$('.panel-center').html(response).each(prime.elements);
		});

		return false;
	};

	fieldset.save = function (form) {
		$.ajax({
			url: $(form).attr('action'),
			type: 'POST',
			data: $(form).serialize()
		})
		.done(function (response) {
			prime.view('/Prime/Module/Fieldset/List/' + $(form).data('id'));
		});

		return false;
	};

	fieldset.selectNode = function () {
		$('.panel-left').find('.active').removeClass('active');
		$('.panel-left [data-id='+$(this).data('fieldset-id')+']').parent().addClass('active').parents('.has-children').addClass('open');
	};
	prime.elementsExternal.push(function () {
		$(this).find('[data-fieldset-id]').each(fieldset.selectNode);
	});
	$('[data-fieldset-id]').each(fieldset.selectNode);

	return fieldset;
});