# Fields

Fields can be added to Prime by extending the [Prime_Field] class. It needs to have a view for rendering field using bootstrap 3, see [Prime_String] for reference.

They can have options that are stored as JSON schema in database, but array in Prime views.

## Provided Fields

Prime provides a set of fields that should cover everyones need:

Name             | Class                     | Options
---------------- |-------------------------- |-------------------------------------------
String           | Prime_Field_String        | **type**: (text,url,date,email)
Text             | Prime_Field_Text          | **type**: (plaintext,wysiwyg)<br>**rows**: integer
Boolean          | Prime_Field_Boolean       | **type**: (checkbox, radio,select)
Choose           | Prime_Field_Choose        | **type**: (select,radio)<br>**items**: { "key": "value", ... }
File upload      | Prime_Field_File          | **directory**: string<br>**allowed_mime**: {"image/png", ...}<br>**max_size**: integer
Page             | Prime_Field_Page          | 
Template         | Prime_Field_Template      |
*Fieldset*       | Prime_Field_Fieldset      | **todo**

## How to use

Pop up the field editor and assign the fields to the list.