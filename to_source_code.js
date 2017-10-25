function to_source_code({value, indent="", function_names=false, newObject_paths=false,
                        job_names=false, robot_names=false,
                        depth_limit=Infinity, depth=0, original_do_list=false} = {}){
        //if ((typeof(arguments[0]) == "object") && arguments[0].hasOwnProperty("value")) {}
        //else { value = arguments[0] } //so that I can do to_source_code 123) and win
        if (depth > depth_limit) { return "***" } //stops infinite recursion in circular structures.
        if      (value === undefined)       { return "undefined" }
        else if (value === null)            { return "null" } //since typeof(null) == "object", this must be before the typeof(value) == "object" clause
        else if (value === true)            { return "true"}
        else if (value === false)           { return "false"}
        else if (typeof(value) == "number") { return value.toString() } //works for NaN too, no need to use (isNaN(value)) { result = "NaN" } //note the check for number before checking isNanN is necessary because JS wasn't designed.
        else if (typeof(value) == "string") {
            if (value.includes("\n") ||
                (value.includes("'") && value.includes('"')))
                                             { return indent + "`" + value + "`" }
            else if  (value.includes('"'))   { return indent + "'" + value + "'" }
            else                             { return indent + '"' + value + '"' }
        }
        else if (value instanceof Date)     { return value.toString() }
        else if (typeof(value) == "function") {
            let fn_name = function_name(value)
            if (function_names && (fn_name !== null) && (fn_name !== "")) { return fn_name }
            else {
                let src = value.toString()
                return replace_substrings(src, "\n", indent + "\n")
            }
        }
        else if (Object.isNewObject(value)) {
            if (newObject_paths) { return value.objectPath }
            else                 { return value.sourceCode() }
        }
        else if (typed_array_name(value)){ //any type of array
            return to_source_code_array(arguments[0])
        }
        //Job. Robot, Instruction, Duration
        else if (value.to_source_code) { return value.to_source_code(arguments[0]) }
        else if (value === window)     { return "{window object: stores globals}"  } //too many weird values in there and too slow so punt.
        else if (typeof(value) == "object"){//beware if we didn't catch arrays above this would hit
                                            //assumes at this point we just have a lit obj.
            return to_source_code_lit_obj(arguments[0])
        }
        else {
            shouldnt("to_source_code passed: " + arguments[0] + " which is not a handled type.")
        }
}


function to_source_code_array(args){
    let value = args.value
    if (Instruction.is_instruction_array(value)) {
        return to_source_code_instruction_array(args)
    }
    let chars_added_since_last_newline = 0
    let result = "["
    let len = value.length
    for (let i = 0; i < len; i++){ //don't use "for ... in here as it gets some wrong stuff
        let prefix = ""
        let val = value[i]
        let val_str = to_source_code({value: val})
        let comma_maybe = ((i < (len - 1)) ? "," : "")
        let newline_or_space_suffix = ((i == (len - 1))? "" : " ")
        let str_and_suffix_len = val_str.length
        if (args.one_line_per_array_elt) { newline_or_space_suffix = "\n" }
        else if (chars_added_since_last_newline > 60) {
            prefix = "\n"
            chars_added_since_last_newline = str_and_suffix_len
        }
        else if ((chars_added_since_last_newline == 0) && (val_str.length > 60)) {
            chars_added_since_last_newline = str_and_suffix_len //add it in the usual way
        }
        else if ((chars_added_since_last_newline + str_and_suffix_len) > 60) {
            prefix = "\n"
            chars_added_since_last_newline = str_and_suffix_len
        }
        else { chars_added_since_last_newline += str_and_suffix_len }
        //if (Array.isArray(elt_val)) sep = sep + "<br/>" //put each sub-array on its own line
        result += prefix + val_str + comma_maybe + newline_or_space_suffix
    }
    result += "]"
    return result
}

function to_source_code_instruction_array(args){
    let inst_array = args.value
    let result = args.indent + "make_ins("
    let prop_args = jQuery.extend({}, args)
    prop_args.indent = ""
    for(let prop_index in inst_array) {
        prop_args.value = inst_array[prop_index]
        let prop_src = to_source_code(prop_args)
        let suffix = ((prop_index == (inst_array.length - 1)) ? "" : ", ")
        result += prop_src + suffix
    }
    result += ")"
    return result
}

function to_source_code_lit_obj(args){
        let value = args.value
        let result = "{"
        let prop_names = Object.getOwnPropertyNames(value) //long objects like cv cause problems
        for (var prop_index = 0; prop_index < prop_names.length; prop_index++) {
            let prop_name   = prop_names[prop_index]
            let prop_val    = value[prop_name]
            let prop_args = jQuery.extend({}, args) //copy the args
            prop_args.value = prop_val
            let quote_char = ""
            if (prop_name.indexOf(" ") != -1){
                quote_char = '"'
                if (prop_name.indexOf('"') != -1) { prop_name = replace_substrings(prop_name, '"',  '\\"') }
            }
            result += quote_char + prop_name + quote_char + ": " + to_source_code(prop_args) +  "\n"
        }
        result += "}"
        return result
}
