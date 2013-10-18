define(['jquery'], function($) {

	var fieldset = {};

	fieldset.item = {};

	fieldset.item.save = function (id) {
		$.ajax({
			url: '/Prime/Module/Fieldset/ItemSave',
			type: 'POST',
			data: $(form).serialize()
		})
		.done(function (response) {
			prime.view('/Prime/Module/Fieldset/Detail/' + id);
		});
	};

	return fieldset;
});