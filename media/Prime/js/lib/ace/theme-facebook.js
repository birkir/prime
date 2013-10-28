/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" A
ND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED

 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS

 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

ace.define('ace/theme/facebook', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

	exports.isDark = true;
	exports.cssClass = "ace-facebook";
	exports.cssText = ".ace-facebook .ace_gutter {background: #252b39;color: #747c8e;}\
.ace-facebook .ace_print-margin {width: 1px;background: #4c5363;}\
.ace-facebook .ace_scroller {background-color: rgba(37,43,57,1);}\
.ace-facebook .ace_text-layer {color: rgba(195,206,227,1);}\
.ace-facebook .ace_cursor {border-left: 2px solid rgba(151,158,134,1);}\
.ace-facebook .ace_overwrite-cursors .ace_cursor {border-left: 0px;border-bottom: 1px solid rgba(151,158,134,1);}\
.ace-facebook .ace_marker-layer .ace_selection {background: rgba(26,31,41,1);}\
.ace-facebook.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0pxrgba(37,43,57,1);border-radius: 2px;}\
.ace-facebook .ace_marker-layer .ace_step {background: rgb(198, 219, 174);}\
.ace-facebook .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1pxsolid rgba(255,0,0,1);}\
.ace-facebook .ace_marker-layer .ace_active-line {background: rgba(47,55,77,1);}\
.ace-facebook .ace_gutter-active-line {background-color: rgba(47,55,77,1);}\
.ace-facebook .ace_marker-layer .ace_selected-word {border: 1px solidrgba(26,31,41,1);}\
.ace-facebook .ace_fold {background-color: rgba(139,233,238,1);border-color: rgba(195,206,227,1);}\
.ace-facebook .ace_keyword{color:rgba(255,255,255,1);}\
.ace-facebook .ace_keyword.ace_operator{color:rgba(228,234,240,1);}\
.ace-facebook .ace_keyword.ace_other.ace_unit{color:rgba(24,201,201,1);}\
.ace-facebook .ace_constant.ace_language{color:rgba(228,234,240,1);}\
.ace-facebook .ace_constant.ace_numeric{color:rgba(24,201,201,1);}\
.ace-facebook .ace_constant.ace_character{color:rgba(213,213,202,1);}\
.ace-facebook .ace_constant.ace_character.ace_entity{color:rgba(214,124,155,1);}\
.ace-facebook .ace_constant.ace_other{color:rgba(24,201,201,1);}\
.ace-facebook .ace_support.ace_function{color:rgba(139,233,238,1);}\
.ace-facebook .ace_support.ace_constant{color:rgba(228,234,240,1);}\
.ace-facebook .ace_support.ace_constant.ace_property-value{color:rgba(195,206,227,1);}\
.ace-facebook .ace_support.ace_class{color:rgba(227,199,138,1);}\
.ace-facebook .ace_support.ace_type{font-style:italic;color:rgba(211,175,197,1);}\
.ace-facebook .ace_storage{color:rgba(255,255,255,1);}\
.ace-facebook .ace_storage.ace_type{font-style:italic;color:rgba(211,175,197,1);}\
.ace-facebook .ace_invalid.ace_illegal{color:rgba(232,137,181,1);background-color:rgba(114,44,64,1);}\
.ace-facebook .ace_string.ace_regexp{color:rgba(24,201,201,1);}\
.ace-facebook .ace_comment{color:rgba(112,129,190,1);}\
.ace-facebook .ace_variable{color:rgba(139,233,238,1);}\
.ace-facebook .ace_variable.ace_language{color:rgba(179,178,162,1);}\
.ace-facebook .ace_variable.ace_parameter{font-style:italic;color:rgba(24,201,201,1);}\
.ace-facebook .ace_entity.ace_other.ace_attribute-name{color:rgba(144,214,205,1);}\
.ace-facebook .ace_entity.ace_name.ace_function{color:rgba(139,233,238,1);}\
.ace-facebook .ace_entity.ace_name.ace_tag{color:rgba(141,179,255,1);}\
.ace-facebook .ace_markup.ace_heading{color:rgba(201,117,149,1);}\
.ace-facebook .ace_markup.ace_heading.ace_1{color:rgba(204,112,147,1);}";

	var dom = require("../lib/dom");
	dom.importCssString(exports.cssText, exports.cssClass);

});
