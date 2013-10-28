define(['jquery'], function($) {

	var user = {};

	/**
	 * Calculate password strength score
	 *
	 * @param string String to calculate
	 * @param object Element to attach visual appearence
	 * @return void
	 */
	user.passwordStrength = function (str, element) {

		// setup variables
		var score = 0,
		map = [
			{ score: 1, regex: /[a-z]/ },
			{ score: 3, regex: /[A-Z]/ },
			{ score: 3, regex: /\d+/ },
			{ score: 5, regex: /(.*[0-9].*[0-9].*[0-9])/ },
			{ score: 3, regex: /.[!,@,#,$,%,\^,&,*,?,_,~]/ },
			{ score: 5, regex: /(.*[!,@,#,$,%,\^,&,*,?,_,~].*[!,@,#,$,%,\^,&,*,?,_,~])/ },
			{ score: 2, regex: /([a-z].*[A-Z])|([A-Z].*[a-z])/ }
		];

		// length check
		score += Math.min(Math.pow(str.length, 1.25), 28);

		// loop through regexes and add to score
		for (var i = 0; i < map.length; i++) {
			if (str.match(map[i].regex)) {
				score += map[i].score;
			}
		}

		// get a percentage of one hundred
		score = (score * 2) / 100;

		// when some password is entered
		if (str.length > 0) {

			// create progress bar if not exist
			if ( ! element.progressBar) {
				element.progressBar = $('<div/>', { class: 'progress password-strength' }).append($('<div/>', { class: 'progress-bar' }));
				$(element).parent().prepend(element.progressBar);
			}

			// get bar
			var bar = element.progressBar.find('.progress-bar');

			// set bar width
			bar.css({ width: score * 100 + '%' });

			// set color
			if (score < 0.26) bar.attr('class', 'progress-bar progress-bar-danger');
			else if (score < 0.50) bar.attr('class', 'progress-bar progress-bar-warning');
			else bar.attr('class', 'progress-bar progress-bar-success');
		}

		// else remove progress bar
		else if (element.progressBar) {
			element.progressBar.remove();
			element.progressBar = null;
		}
	};

	/**
	 * Create new user modal window
	 *
	 * @return boolean
	 */
	user.create = function () {

		// create buttons
		var save = $('<button/>', { class: 'btn btn-primary', text: 'Save' }),
			cancel = $('<button/>', { class: 'btn btn-default', text: 'Cancel', 'data-dismiss': 'modal' }),
			form;

		// create dialog
		var dialog = prime.dialog({
			title: 'New user',
			remote: '/Prime/User/Create',
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
	user.remove = function (element, role) {

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

	return user;
});