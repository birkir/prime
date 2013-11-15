<div class="alert alert-warning pchanges hide" style="position: absolute; top: -2px; right: -2px; border: none; box-shadow: inset 0px -2px 0px 0px rgba(0, 0, 0, 0.075); padding: 8px 10px 6px 8px; opacity: 0.975; border-radius: 0;">
	<a href="#" class="btn btn-danger btn-sm publish">Publish</a>
	<a href="#" class="btn btn-info btn-sm discard">Discard</a>
</div>
<iframe<?=HTML::attributes([
	'src' => $url,
	'frameborder' => 0,
	'class' => 'scrollable prime-live-iframe',
	'style' => 'width: 100%; height: 100%;',
	'name' => 'PrimeLive'
]);?>></iframe>