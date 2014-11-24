define(function(require){
	
	function constructor(){
		
		_boolean = "boolean",
		_number = "number",
		_string = "string",
		_null = null,
		_undefined = undefined,
		_array = "array",
		_object = "object",
		_function = "function",
		_class = "class",
		_public = "public",
		_private = "private";
		
		var parameterType = {
				"_boolean":_boolean,
				"_number":_number,
				"_string":_string,
				"_null":_null,
				"_undefined":_undefined,
				"_array":_array,
				"_object":_object,
				"_function":_function
		};
		
		var category = {
				"_object":_object,
				"_class":_class
		};
		
		var scope = {
				"_public":_public,
				"_private":_private
		};
		
	};
	
	return new constructor();
	
});