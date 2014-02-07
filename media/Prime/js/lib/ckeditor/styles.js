/**
 * Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// This file contains style definitions that can be used by CKEditor plugins.
//
// The most common use for it is the "stylescombo" plugin, which shows a combo
// in the editor toolbar, containing all styles. Other plugins instead, like
// the div plugin, use a subset of the styles on their feature.
//
// If you don't have plugins that depend on this file, you can simply ignore it.
// Otherwise it is strongly recommended to customize this file to match your
// website requirements and design properly.

CKEDITOR.stylesSet.add( 'default', [

	{ name: 'Button',		element: 'button', attributes: { class: 'btn btn-default' } },
	{ name: 'Primary',		element: 'button', attributes: { class: 'btn btn-primary' } },
	{ name: 'Danger',		element: 'button', attributes: { class: 'btn btn-danger'  } },
	{ name: 'Warning',		element: 'button', attributes: { class: 'btn btn-warning'  } },
	{ name: 'Success',		element: 'button', attributes: { class: 'btn btn-success'  } },
	{ name: 'Info',	 		element: 'button', attributes: { class: 'btn btn-info'  } },

	{ name: 'Muted',		element: 'span',   attributes: { class: 'text-muted' } },
	{ name: 'Primary',		element: 'span',   attributes: { class: 'text-primary' } },
	{ name: 'Danger',		element: 'span',   attributes: { class: 'text-danger' } },
	{ name: 'Warning',		element: 'span',   attributes: { class: 'text-warning' } },
	{ name: 'Success',		element: 'span',   attributes: { class: 'text-success' } },
	{ name: 'Info',			element: 'span',   attributes: { class: 'text-info' } },

	{ name: 'Label',		element: 'span',   attributes: { class: 'label label-default' } },
	{ name: 'Primary',		element: 'span',   attributes: { class: 'label label-primary' } },
	{ name: 'Danger',		element: 'span',   attributes: { class: 'label label-danger' } },
	{ name: 'Warning',		element: 'span',   attributes: { class: 'label label-warning' } },
	{ name: 'Success',		element: 'span',   attributes: { class: 'label label-success' } },
	{ name: 'Info',			element: 'span',   attributes: { class: 'label label-info' } },

	{ name: 'Badge',		element: 'span',   attributes: { class: 'badge' } },

	{ name: 'Well',	 		element: 'div', attributes: { class: 'well'  } },

	{ name: 'Success',	 	element: 'div', attributes: { class: 'alert alert-success'  } },
	{ name: 'Danger',	 	element: 'div', attributes: { class: 'alert alert-danger'  } },
	{ name: 'Warning',	 	element: 'div', attributes: { class: 'alert alert-warning'  } },
	{ name: 'Info',	 		element: 'div', attributes: { class: 'alert alert-info'  } },

	{ name: 'Page header',	element: 'div', attributes: { class: 'page-header' } },	

	/* Block Styles */

	// These styles are already available in the "Format" combo ("format" plugin),
	// so they are not needed here by default. You may enable them to avoid
	// placing the "Format" combo in the toolbar, maintaining the same features.
	/*
	{ name: 'Paragraph',		element: 'p' },
	{ name: 'Heading 1',		element: 'h1' },
	{ name: 'Heading 2',		element: 'h2' },
	{ name: 'Heading 3',		element: 'h3' },
	{ name: 'Heading 4',		element: 'h4' },
	{ name: 'Heading 5',		element: 'h5' },
	{ name: 'Heading 6',		element: 'h6' },
	{ name: 'Preformatted Text',element: 'pre' },
	{ name: 'Address',			element: 'address' },
	

	{ name: 'Italic Title',		element: 'h2', styles: { 'font-style': 'italic' } },
	{ name: 'Subtitle',			element: 'h3', styles: { 'color': '#aaa', 'font-style': 'italic' } },
	{
		name: 'Special Container',
		element: 'div',
		styles: {
			padding: '5px 10px',
			background: '#eee',
			border: '1px solid #ccc'
		}
	},

	/* Inline Styles */

	// These are core styles available as toolbar buttons. You may opt enabling
	// some of them in the Styles combo, removing them from the toolbar.
	// (This requires the "stylescombo" plugin)
	/*
	{ name: 'Strong',			element: 'strong', overrides: 'b' },
	{ name: 'Emphasis',			element: 'em'	, overrides: 'i' },
	{ name: 'Underline',		element: 'u' },
	{ name: 'Strikethrough',	element: 'strike' },
	{ name: 'Subscript',		element: 'sub' },
	{ name: 'Superscript',		element: 'sup' },
	

	{ name: 'Marker',			element: 'span', attributes: { 'class': 'marker' } },

	{ name: 'Big',				element: 'big' },
	{ name: 'Small',			element: 'small' },
	{ name: 'Typewriter',		element: 'tt' },

	{ name: 'Computer Code',	element: 'code' },
	{ name: 'Keyboard Phrase',	element: 'kbd' },
	{ name: 'Sample Text',		element: 'samp' },
	{ name: 'Variable',			element: 'var' },

	{ name: 'Deleted Text',		element: 'del' },
	{ name: 'Inserted Text',	element: 'ins' },

	{ name: 'Cited Work',		element: 'cite' },
	{ name: 'Inline Quotation',	element: 'q' },

	{ name: 'Language: RTL',	element: 'span', attributes: { 'dir': 'rtl' } },
	{ name: 'Language: LTR',	element: 'span', attributes: { 'dir': 'ltr' } },

	/* Object Styles 

	{
		name: 'Styled image (left)',
		element: 'img',
		attributes: { 'class': 'left' }
	},

	{
		name: 'Styled image (right)',
		element: 'img',
		attributes: { 'class': 'right' }
	},

	{
		name: 'Compact table',
		element: 'table',
		attributes: {
			cellpadding: '5',
			cellspacing: '0',
			border: '1',
			bordercolor: '#ccc'
		},
		styles: {
			'border-collapse': 'collapse'
		}
	},

	{ name: 'Borderless Table',		element: 'table',	styles: { 'border-style': 'hidden', 'background-color': '#E6E6FA' } },
	{ name: 'Square Bulleted List',	element: 'ul',		styles: { 'list-style-type': 'square' } }
	*/
]);

