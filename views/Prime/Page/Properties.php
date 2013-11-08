<?=Form::open($action, ['role' => 'form']);?>
	<?=Form::hidden('slug_auto', '0');?>
	<?=Form::hidden('visible', '0');?>
	<?=Form::hidden('disabled', '0');?>
	<?=Form::hidden('noindex', '0');?>
	<?=Form::hidden('nofollow', '0');?>
	<?=Form::hidden('redirect', '0');?>
	<?=Form::hidden('ajax', '0');?>
	<?=Form::hidden('gzip', '0');?>
	<div class="tabbable tabs-left">
		<ul class="nav nav-tabs">
			<li class="active"><?=HTML::anchor('#pp01', __('General'), ['data-toggle' => 'tab']);?></li>
			<li><?=HTML::anchor('#pp02', __('Content'), ['data-toggle' => 'tab']);?></li>
			<li><?=HTML::anchor('#pp03', __('Request'), ['data-toggle' => 'tab']);?></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane active" id="pp01">
				<div class="form-group">
					<?=Form::label('formName', __('Page name'), ['class' => 'control-label']);?>
					<?=Form::input('name', $page->name, ['class' => 'form-control', 'id' => 'formName', ($page->loaded() ? 'no' : 'autofocus') => 'autofocus']);?>
				</div>

				<div class="form-group">
					<?=Form::label('formTemplate', __('Template'), ['class' => 'control-label']);?>
					<?=Form::select('template', $templates, $page->template, ['class' => 'form-control', 'id' => 'formTemplate']);?>
				</div>

				<div class="form-group">
					<label for="formAutoSlug" class="checkbox-inline pull-right">
						<?=Form::checkbox('slug_auto', 1, (bool) $page->slug_auto, ['id' => 'formAutoSlug']);?>
						<?=__('Generate slug');?>
					</label>
					<?=Form::label('formName', __('Page slug'), ['class' => 'control-label']);?>
					<?=Form::input('slug', $page->slug, ['class' => 'form-control generate-slug disabled', 'id' => 'formSlug']);?>
				</div>

				<div class="form-group">
					<label for="formVisible" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('visible', 1, (bool) $page->visible, ['id' => 'formVisible']);?>
						<?=__('Visible in menu');?>
					</label>
					<label for="formDisabled" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('disabled', 1, $page->disabled, ['id' => 'formDisabled']);?>
						<?=__('Disabled for guests');?>
					</label>
				</div>
			</div>
			<div class="tab-pane" id="pp02">

				<div class="form-group">
					<?=Form::label('formDescription', __('Description'), ['class' => 'control-label']);?>
					<?=Form::textarea('description', $page->description, ['class' => 'form-control', 'id' => 'formDescription', 'rows' => 2]);?>
				</div>

				<div class="form-group">
					<?=Form::label('formKeywords', __('Keywords'), ['class' => 'control-label']);?>
					<?=Form::input('keywords', $page->keywords, ['class' => 'form-control', 'id' => 'formKeywords', 'rows' => 2]);?>
				</div>

				<div class="form-group">
					<?=Form::label('formLanguage', __('Languge'), ['class' => 'control-label']);?>
					<?=Form::select('language', $languages, $page->language, ['class' => 'form-control', 'id' => 'formLanguage']);?>
				</div>

				<div class="form-group">
					<?=Form::label(NULL, __('Search Engines'), ['class' => 'control-label']);?>
					<label for="formNoIndex" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('noindex', 1, (bool) $page->noindex, ['id' => 'formNoIndex']);?>
						<?=__('Exclude from search engines');?>
					</label>
					<label for="formNoFollow" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('nofollow', 1, (bool) $page->nofollow, ['id' => 'formNoFollow']);?>
						<?=__('Do not follow links on this page');?>
					</label>
				</div>
			</div>
			<div class="tab-pane" id="pp03">
				<div class="form-group">
					<label for="formRedirect" class="checkbox-inline pull-right">
						<?=Form::checkbox('redirect', 1, (bool) $page->redirect, ['id' => 'formRedirect', 'onclick' => 'document.getElementById(\'formRedirectURL\').disabled = ! this.checked;']);?>
						<?=__('Enable redirect');?>
					</label>
					<?=Form::label('formRedirectURL', __('Redirect URL'), ['class' => 'control-label']);?>
					<?=Form::input('redirect_url', $page->redirect_url, ['class' => 'form-control', 'id' => 'formRedirectURL', ((bool) $page->redirect ? 'not' : 'disabled') => 'disabled']);?>
				</div>
				<div class="form-group">
					<?=Form::label('formProtocol', __('Protocol'), ['class' => 'control-label']);?>
					<?=Form::select('protocol', [
						'both'  => __('Accept HTTP and HTTPS request'),
						'http'  => __('Accept HTTP request only'),
						'https' => __('Accept HTTPS request only'),
						'https_enforced' => __('Accept and enforce HTTPS request') 
					], $page->protocol, ['class' => 'form-control', 'id' => 'formProtocol']);?>
				</div>
				<div class="form-group">
					<?=Form::label('formMethod', __('Methods'), ['class' => 'control-label']);?>
					<?=Form::select('method', [
						'get'  => __('GET'),
						'get,post'  => __('GET and POST only'),
						'all' => __('All methods accepted')
					], $page->method, ['class' => 'form-control', 'id' => 'formMethod']);?>
				</div>
				<div class="form-group">
					<label for="formAllowAjax" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('ajax', 1, (bool) $page->ajax, ['id' => 'formAllowAjax']);?>
						<?=__('Allow asynchronous requests (ajax)');?>
					</label>
					<label for="formAllowGzip" class="checkbox" style="font-weight: normal;">
						<?=Form::checkbox('gzip', 1, (bool) $page->gzip, ['id' => 'formAllowGzip']);?>
						<?=__('Compress response for compatible clients (gzip)');?>
					</label>
				</div>
			</div>
		</div>
	</div>
	<input type="submit" class="sr-only" />
<?=Form::close();?>