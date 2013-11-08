define(['jquery'], function($) {

	var user = {};

	/**
	 * Create new user modal window
	 *
	 * @return boolean
	 */
	user.create = function (element) {

		// create buttons
		var save = $('<button/>', { class: 'btn btn-primary', text: $(element).data('save') }),
			cancel = $('<button/>', { class: 'btn btn-default', text: $(element).data('cancel'), 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: $(element).data('title'),
			remote: element.href,
			buttons: [save, cancel]
		},

		// on modal ready
		function (modal) {

			// set form
			form = modal.find('form');

			// password onkeyup event
			form.find('input[name=password]').on('keyup', function () {

				// setup variables
				var confirm = form.find('input[name=password_confirm]').parent('.collapse'),
				    value = $(this).val();

				// show or hide passwordconfirm
				confirm[value.length > 0 ? 'addClass' : 'removeClass']('in');

				// set password strength
				prime.passwordStrength(value, this);
			});

			// validate and handle form submit
			prime.validate(form, function () {

				// hide dialog
				dialog.modal('hide');

				// reload current view (todo!)
				prime.view('/Prime/User/List/' + $('table[data-role]').data('role'));
			});

			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	/**
	 * Create new role in tree
	 */
	user.create_role = function (item) {

		// get node
		var node = $('.has-context').parent(),
		    id = node.children('a').data('id');

		var li = $('<li/>', { class: 'list-group-item' }),
		    b  = $('<b/>', { class: 'caret', onselectstart: 'return false;' }).appendTo(li),
		    a  = $('<a/>', { href: '#', class: 'has-context' }).appendTo(li),
		    span = $('<span/>', { html: '<i class="icon-user"></i> Role name...' }).appendTo(a);

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
			$.ajax({
				url: item.href,
				type: 'POST',
				data: { name: text }
			})
			.done(function (response) {
				try {
					var data = JSON.parse(response);
					prime.dialog({
						alert: true,
						title: 'Error',
						body: data.message
					});
					prime.view('/Prime/User/Tree', $('.panel-left'));
				} catch (error) {
					$('.panel-left').html(response).find('[data-id=' + id + ']').parent().addClass('open');
				}
			});
		}, function () {
			li.remove();
			if (node.children('ul').children('li').length === 0) {
				node.removeClass('has-children open').children('ul').remove();
			}
		});

		return false;
	};

	/**
	 * Edit user modal window
	 *
	 * @return boolean
	 */
	user.edit = function (element) {

		var id = $(element).data('id');

		// create buttons
		var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: 'Edit user',
			remote: '/Prime/User/Edit/' + id,
			buttons: [save, cancel]
		},

		// on modal ready
		function (modal) {

			// set form
			form = modal.find('form');

			// password onkeyup event
			form.find('input[name=password]').on('keyup', function () {

				// setup variables
				var confirm = form.find('input[name=password_confirm]').parent('.collapse'),
				    value = $(this).val();

				// show or hide passwordconfirm
				confirm[value.length > 0 ? 'addClass' : 'removeClass']('in');

				// set password strength
				user.passwordStrength(value, this);
			});

			// validate and handle form submit
			prime.validate(form, function () {

				// hide dialog
				dialog.modal('hide');

				// reload current view (todo!)
				prime.view('/Prime/User/List/' + $('table[data-role]').data('role'));
			});

			save.on('click', function () {
				form.trigger('submit');
			});
		});

		return false;
	};

	/**
	 * Remove user or role confirm dialog
	 *
	 * @return boolean
	 */
	user.delete = function (element, role) {

		// set where
		role = role || false;

		// create confirm dialog
		var dialog = prime.dialog({
			backdrop: true,
			title: $(element).data('title'),
			body: $(element).data('message'),
			confirm: function () {
				$.ajax({
					url: element.href
				})
				.done(function (response) {
					if (role)
						$('.panel-left').html(response).each(prime.elements);
					else
						prime.view('/Prime/User/List/' + $('table[data-role]').data('role'));
				});
			}
		});

		return false;
	};

	/** 
	 * Rename role in tree
	 *
	 * @return boolean
	 */
	user.rename = function (element) {
		return prime.rename(element, function (response, oldText, newText, node) {
			try {
				var data = JSON.parse(response);
				if (data.status === false) {
					prime.dialog({
						alert: true,
						title: 'Error',
						body: data.message
					});
					node.children('span').contents().last()[0].textContent = ' ' + oldText;
				}
			} catch (error) {}
		});
	};

	return user;
});