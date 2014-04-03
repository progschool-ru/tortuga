(function()
{


//==========================================================================

//------- Core logic ---------

//==========================================================================


// CI means index
var CI_TYPE = 0;
var CI_FAMILY = 1;

var slice = Array.prototype.slice
var bind = Function.prototype.bind

var test_count = 0;

var assert = function(bool, message)
{
	if(!bool)
	{
		console.log("Test #" + test_count + " failed: ", message);
	}
	++test_count;
}


var true_fun = function(){return true}

var and = function(fun1, fun2)
{
	return function()
	{
		return fun1.apply(null, arguments) && fun2.apply(null, arguments)
	}
};

(function test_and(){
	var more3 = function(x){return x > 3}
	var less7 = function(x){return x < 7}
	var more_less = and(more3, less7)
	assert(more_less(4), "3 < 4 < 7")
	assert(more_less(5), "3 < 5 < 7")
	assert(more_less(6), "3 < 6 < 7")
	assert(!more_less(3), "3 < 3 < 7!!!")
	assert(!more_less(7), "3 < 7 < 7!!!")
})()

var or = function(fun1, fun2)
{
	return function()
	{
		return fun1.apply(null, arguments) || fun2.apply(null, arguments)
	}
};

(function test_or(){
	var more6 = function(x){return x > 6}
	var less4 = function(x){return x < 4}
	var more_less = or(more6, less4)
	assert(!more_less(4), "3 < 4 < 7")
	assert(!more_less(5), "3 < 5 < 7")
	assert(!more_less(6), "3 < 6 < 7")
	assert(more_less(3), "3 < 3 < 7!!!")
	assert(more_less(7), "3 < 7 < 7!!!")
})()

var not = function(fun)
{
	return function()
	{
		return !fun.apply(null, arguments)
	}
};

(function test_not_and_true_fun(){
	var more3 = function(x){return x > 3}
	var less7 = function(x){return x < 7}
	var more6 = function(x){return x > 6}
	var less4 = function(x){return x < 4}
	var more_and_less = and(more3, less7)
	var more_or_less = or(more6, less4)
	assert(!not(more3)(4), "!(3 < 4)")
	assert(not(less7)(7), "!(7 < 7)")
	assert(not(more_or_less)(6), "!(3 > 6 > 7)")
	assert(not(more_and_less)(3), "!(3 < 3 < 7)")
	assert(not(more_and_less)(7), "!(3 < 7 < 7)")
	assert(true_fun(), "true_fun() always returns true")
	assert(true_fun(4), "true_fun() always returns true")
	assert(true_fun(4, 6, 3, 5), "true_fun() always returns true")
})()

var curry = function(fun /*, arguments */)
{
	var scope = this
	var args1 = slice.call(arguments, 1)
	return function(/* arguments */)
	{
		return fun.apply(scope, args1.concat(slice.apply(arguments)));
	}
}

var is_family_defined = function(obj)
{
	return obj[CI_FAMILY] !== undefined;
}

var compare_families = function(first, second)
{
	return first[CI_FAMILY] - second[CI_FAMILY]
}

var are_equal_families = function(first, second)
{
	return first[CI_FAMILY] == second[CI_FAMILY]
};

(function test_are_equal_families(){
	assert(are_equal_families(["volk", 0], ["koza", 0]), "0 == 0")
	assert(!are_equal_families(["volk", 0], ["volk", 1]), "0 != 1")
})()

var are_equal_types = function(first, second)
{
	return first[CI_TYPE] == second[CI_TYPE]
};

(function test_are_equal_types(){
	assert(are_equal_types(["volk", 0], ["volk", 1]), "volk == volk")
	assert(!are_equal_types(["volk", 0], ["koza", 0]), "volk != koza")
})()

var has_object = function(arr, obj)
{
	return !arr.every(curry(not(are_equal_types), obj))
};

(function test_has_object(){
	var one = [["volk", 0], ["koza", 1], ["volk", 1], ["kapusta", 0], ["muzhik", 1], ["kapusta", 0]]
	assert(has_object(one, ["volk"]), "There are volk")
	assert(has_object(one, ["koza"]), "There are koza")
	assert(has_object(one, ["kapusta"]), "There are kapusta")
	assert(has_object(one, ["muzhik"]), "There are muzhik")
	assert(!has_object(one, ["korova"]), "There are not korova")
})()

var has_at_least_numbers_of_objects = function(arr, obj, num)
{
	var len = arr.length
	for(var i = 0; i < len; ++i)
	{
		if(are_equal_types(arr[i], obj))
		{
			--num
		}
		if(num == 0)
		{
			return true;
		}
	}
	
	// if there are no elements and num == 0 at start we must return true.
	return num == 0;
};

(function test_has_at_least_numbers_of_objects(){
	var one = [["volk", 0], ["koza", 1], ["volk", 1], ["kapusta", 0], ["muzhik", 1], ["kapusta", 0]]
	assert(has_at_least_numbers_of_objects([], ["volk"], 0), "There are 0 volks")
	assert(has_at_least_numbers_of_objects(one, ["volk"], 2), "There are 2 volks")
	assert(has_at_least_numbers_of_objects(one, ["koza"], 1), "There are 1 koza")
	assert(has_at_least_numbers_of_objects(one, ["kapusta"], 1), "There are 2 kapustas")
	assert(!has_at_least_numbers_of_objects(one, ["muzhik"], 2), "There are 1 muzhik")
	assert(!has_at_least_numbers_of_objects(one, ["korova"], 1), "There are not korova")
	assert(has_at_least_numbers_of_objects(one, ["korova"], 0), "There are not korova")
	assert(!has_at_least_numbers_of_objects(one, ["volk"], 3), "There are 2 volks")
})()

var has_pair_of_checked_families = function(arr, first, second, family_checker)
{
	var first_compat = arr.filter(curry(are_equal_types, first))
	var second_compat = arr.filter(curry(are_equal_types, second))

	var first_length = first_compat.length
	var second_length = second_compat.length

	for(var i = 0; i < first_length; ++i)
	{
		var f = first_compat[i]
		for(var j = 0; j < second_length; ++j)
		{
			var s = second_compat[j]
			if(family_checker(f, s) && f != s)
			{
				return true;
			}
		}
	}
};

var has_pair_one_family = function(arr, first, second)
{
	return has_pair_of_checked_families(arr, first, second, are_equal_families)
}

var has_pair_different_families = function(arr, first, second)
{
	return has_pair_of_checked_families(arr, first, second, not(are_equal_families))
}

var has_pair_any_family = function(arr, first, second)
{
	return has_pair_of_checked_families(arr, first, second, true_fun)
}

var has_pair = function(arr, first, second)
{
	return !is_family_defined(second) ? has_pair_any_family(arr, first, second)
		: are_equal_families(first, second) ? has_pair_one_family(arr, first, second)
		: has_pair_different_families(arr, first, second)
};

(function test_has_pair_functions(){
	var one = [["volk", 0], ["koza", 1], ["volk", 1], ["kapusta", 0], ["muzhik", 1], ["kapusta", 0]]
	assert(has_pair_one_family(one, ["volk"], ["koza"]), one + " has volk & koza of family 1")
	assert(has_pair_one_family(one, ["volk"], ["kapusta"]), one + " has volk & kapusta of family 0")
	assert(has_pair_one_family(one, ["kapusta"], ["kapusta"]), one + " has two kapustas of family 0")
	assert(!has_pair_one_family(one, ["koza"], ["kapusta"]), one + " hasn't koza & kapusta of same family")
	assert(!has_pair_one_family(one, ["volk"], ["volk"]), one + " hasn't two volks of same family")
	assert(!has_pair_one_family(one, ["koza"], ["koza"]), one + " hasn't two kozas of same family")

	assert(has_pair_different_families(one, ["volk"], ["koza"]), one + " has volk & koza of different families")
	assert(has_pair_different_families(one, ["volk"], ["kapusta"]), one + " has volk & kapusta of different families")
	assert(has_pair_different_families(one, ["koza"], ["kapusta"]), one + " has koza & kapusta of different families")
	assert(has_pair_different_families(one, ["volk"], ["volk"]), one + " hasn two volks of different families")
	assert(!has_pair_different_families(one, ["muzhik"], ["koza"]), one + " hasn't muzhik & koza of different families")
	assert(!has_pair_different_families(one, ["kapusta"], ["kapusta"]), one + " hasn't two kapustas of different families")
	assert(!has_pair_different_families(one, ["koza"], ["koza"]), one + " hasn't two kozas of different families")

	assert(has_pair_any_family(one, ["volk"], ["koza"]), one + " has volk & koza")
	assert(has_pair_any_family(one, ["volk"], ["kapusta"]), one + " has volk & kapusta")
	assert(has_pair_any_family(one, ["kapusta"], ["kapusta"]), one + " has two kapustas")
	assert(has_pair_any_family(one, ["koza"], ["kapusta"]), one + " has koza & kapusta")
	assert(has_pair_any_family(one, ["volk"], ["volk"]), one + " has two volks of same family")
	assert(!has_pair_any_family(one, ["koza"], ["koza"]), one + " hasn't two kozas")
	assert(!has_pair_any_family(one, ["koza"], ["korova"]), one + " hasn't korova")

	assert(has_pair(one, ["volk", "i"], ["koza", "i"]), one + " has volk & koza of family 1")
	assert(has_pair(one, ["volk", "i"], ["kapusta", "i"]), one + " has volk & kapusta of family 2")
	assert(has_pair(one, ["kapusta", "i"], ["kapusta", "i"]), one + " has two kapustas of family 2")
	assert(!has_pair(one, ["koza", "i"], ["kapusta", "i"]), one + " hasn't koza & kapusta of same family")
	assert(!has_pair(one, ["volk", "i"], ["volk", "i"]), one + " hasn't two volks of same family")
	assert(!has_pair(one, ["koza", "i"], ["koza", "i"]), one + " hasn't two kozas of same family")

	assert(has_pair(one, ["volk", "i"], ["koza", "j"]), one + " has volk & koza of different families")
	assert(has_pair(one, ["volk", "i"], ["kapusta", "j"]), one + " has volk & kapusta of different families")
	assert(has_pair(one, ["koza", "i"], ["kapusta", "j"]), one + " has koza & kapusta of different families")
	assert(has_pair(one, ["volk", "i"], ["volk", "j"]), one + " hasn two volks of different families")
	assert(!has_pair(one, ["muzhik", "i"], ["koza", "j"]), one + " hasn't muzhik & koza of different families")
	assert(!has_pair(one, ["kapusta", "i"], ["kapusta", "j"]), one + " hasn't two kapustas of different families")
	assert(!has_pair(one, ["koza", "i"], ["koza", "j"]), one + " hasn't two kozas of different families")

	assert(has_pair(one, ["volk", "i"], ["koza"]), one + " has volk & koza")
	assert(has_pair(one, ["volk", "i"], ["kapusta"]), one + " has volk & kapusta")
	assert(has_pair(one, ["kapusta"], ["kapusta"]), one + " has two kapustas")
	assert(has_pair(one, ["koza"], ["kapusta"]), one + " has koza & kapusta")
	assert(has_pair(one, ["volk", "i"], ["volk"]), one + " has two volks of same family")
	assert(!has_pair(one, ["koza", "i"], ["koza"]), one + " hasn't two kozas")
	assert(!has_pair(one, ["koza"], ["korova"]), one + " hasn't korova")

})()

var has_object_without_pair_of_checked_families = function(arr, first, second, family_checker)
{
	var first_compat = arr.filter(curry(are_equal_types, first))
	var second_compat = arr.filter(curry(are_equal_types, second))

	var first_length = first_compat.length
	var second_length = second_compat.length

	for(var i = 0; i < first_length; ++i)
	{
		var f = first_compat[i]
		var contains = false;
		for(var j = 0; j < second_length; ++j)
		{
			var s = second_compat[j]
			if(family_checker(f, s) && f != s)
			{
				contains = true;
				break;
			}
		}

		if(!contains)
		{
			return true;
		}
	}

	return false
};

var has_object_without_pair_of_one_family = function(arr, first, second)
{
	return has_object_without_pair_of_checked_families(
		arr, first, second, are_equal_families)
};

var has_object_without_pair_of_any_family = function(arr, first, second)
{
	return has_object_without_pair_of_checked_families(
		arr, first, second, true_fun)
}

var has_object_without_pair_of_different_families = function(arr, first, second)
{
	return has_object_without_pair_of_checked_families(
		arr, first, second, not(are_equal_families))
};

var has_object_without_pair = function(arr, first, second)
{
	return (! is_family_defined(second))
		? has_object_without_pair_of_any_family(arr, first, second)
		: are_equal_families(first, second)
			? has_object_without_pair_of_one_family(arr, first, second)
			: has_object_without_pair_of_different_families(arr, first, second)
};

(function test_has_object_without_pair_punctions(){
	var one = [["volk", 0], ["koza", 1], ["volk", 1], ["kapusta", 0], ["muzhik", 1], ["kapusta", 0]]
	assert(has_object_without_pair_of_one_family(one, ["volk"], ["koza"]), one + " has volk-0 without koza-0")
	assert(!has_object_without_pair_of_one_family(one, ["koza"], ["volk"]), one + " has volk-1 for koza-1")
	assert(has_object_without_pair_of_one_family(one, ["volk"], ["kapusta"]), one + " has volk-1 without kapusta-1")
	assert(!has_object_without_pair_of_one_family(one, ["kapusta"], ["kapusta"]), one + " has two kapustas of family 0")
	assert(!has_object_without_pair_of_one_family(one, ["koza"], ["muzhik"]), one + " has muzhik-1 and koza-1")
	assert(has_object_without_pair_of_one_family(one, ["koza"], ["kapusta"]), one + " hasn't koza & kapusta of same family")
	assert(has_object_without_pair_of_one_family(one, ["volk"], ["volk"]), one + " hasn't two volks of same family")
	assert(has_object_without_pair_of_one_family(one, ["koza"], ["koza"]), one + " hasn't two kozas of same family")

	assert(!has_object_without_pair_of_any_family(one, ["volk"], ["koza"]), one + " has volk & koza")
	assert(!has_object_without_pair_of_any_family(one, ["koza"], ["volk"]), one + " has volk & koza")
	assert(!has_object_without_pair_of_any_family(one, ["volk"], ["kapusta"]), one + " has volk & kapusta")
	assert(!has_object_without_pair_of_any_family(one, ["kapusta"], ["kapusta"]), one + " has two kapustas")
	assert(!has_object_without_pair_of_any_family(one, ["koza"], ["muzhik"]), one + " has muzhik-1 and koza-1")
	assert(!has_object_without_pair_of_any_family(one, ["koza"], ["kapusta"]), one + " has koza & kapusta")
	assert(!has_object_without_pair_of_any_family(one, ["volk"], ["volk"]), one + " hasn't two volks")
	assert(has_object_without_pair_of_any_family(one, ["koza"], ["koza"]), one + " hasn't two kozas")
	assert(has_object_without_pair_of_any_family(one, ["koza"], ["korova"]), one + " hasn't korova for koza")

	assert(has_object_without_pair_of_different_families(one,
		["volk"], ["koza"]), one + " has volk-1 without koza-0")
	assert(!has_object_without_pair_of_different_families(one,
		["koza"], ["volk"]), one + " has volk-0 for koza-1")
	assert(has_object_without_pair_of_different_families(one,
		["volk"], ["kapusta"]), one + " has volk-0 without kapusta-1")
	assert(!has_object_without_pair_of_different_families(one,
		["koza"], ["kapusta"]), one + " has koza & kapusta of different families")
	assert(!has_object_without_pair_of_different_families(one,
		["kapusta"], ["koza"]), one + " has koza & kapusta of different families")
	assert(!has_object_without_pair_of_different_families(one,
		["volk"], ["volk"]), one + " hasn two volks of different families")
	assert(has_object_without_pair_of_different_families(one,
		["muzhik"], ["koza"]), one + " hasn't muzhik & koza of different families")
	assert(has_object_without_pair_of_different_families(one,
		["kapusta"], ["kapusta"]), one + " hasn't two kapustas of different families")
	assert(has_object_without_pair_of_different_families(one,
		["koza"], ["koza"]), one + " hasn't two kozas of different families")


	assert(has_object_without_pair(one, ["volk", "i"], ["koza", "i"]), one + " has volk-0 without koza-0")
	assert(!has_object_without_pair(one, ["koza", "i"], ["volk", "i"]), one + " has volk-1 for koza-1")
	assert(has_object_without_pair(one, ["volk", "i"], ["kapusta", "i"]), one + " has volk-1 without kapusta-1")
	assert(!has_object_without_pair(one, ["kapusta", "i"], ["kapusta", "i"]), one + " has two kapustas of family 0")
	assert(!has_object_without_pair(one, ["koza", "i"], ["muzhik", "i"]), one + " has muzhik-1 and koza-1")
	assert(has_object_without_pair(one, ["koza", "i"], ["kapusta", "i"]), one + " hasn't koza & kapusta of same family")
	assert(has_object_without_pair(one, ["volk", "i"], ["volk", "i"]), one + " hasn't two volks of same family")
	assert(has_object_without_pair(one, ["koza", "i"], ["koza", "i"]), one + " hasn't two kozas of same family")

	assert(has_object_without_pair(one, ["volk", "i"], ["koza", "j"]), one + " has volk-1 without koza-0")
	assert(!has_object_without_pair(one, ["koza", "i"], ["volk", "j"]), one + " has volk-0 for koza-1")
	assert(has_object_without_pair(one, ["volk", "i"], ["kapusta", "j"]), one + " has volk-0 without kapusta-1")
	assert(!has_object_without_pair(one, ["koza", "i"], ["kapusta", "j"]), one + " has koza & kapusta of different families")
	assert(!has_object_without_pair(one, ["kapusta", "i"], ["koza", "j"]), one + " has koza & kapusta of different families")
	assert(!has_object_without_pair(one, ["volk", "i"], ["volk", "j"]), one + " hasn two volks of different families")
	assert(has_object_without_pair(one, ["muzhik", "i"], ["koza", "j"]), one + " hasn't muzhik & koza of different families")
	assert(has_object_without_pair(one, ["kapusta", "i"], ["kapusta", "j"]), one + " hasn't two kapustas of different families")
	assert(has_object_without_pair(one, ["koza", "i"], ["koza", "j"]), one + " hasn't two kozas of different families")

	assert(!has_object_without_pair(one, ["volk", "i"], ["koza"]), one + " has volk & koza")
	assert(!has_object_without_pair(one, ["koza"], ["volk"]), one + " has volk & koza")
	assert(!has_object_without_pair(one, ["volk"], ["kapusta"]), one + " has volk & kapusta")
	assert(!has_object_without_pair(one, ["kapusta"], ["kapusta"]), one + " has two kapustas")
	assert(!has_object_without_pair(one, ["koza"], ["muzhik"]), one + " has muzhik-1 and koza-1")
	assert(!has_object_without_pair(one, ["koza"], ["kapusta"]), one + " has koza & kapusta")
	assert(!has_object_without_pair(one, ["volk"], ["volk"]), one + " hasn't two volks")
	assert(has_object_without_pair(one, ["koza", "i"], ["koza"]), one + " hasn't two kozas")
	assert(has_object_without_pair(one, ["koza"], ["korova"]), one + " hasn't korova for koza")

})()


var afraids = function(first, second)
{
	return function(arr)
	{
		return !has_pair(arr, first, second)
	}
}

var disabled = afraids

var needs = function(first, second)
{
	return function(arr)
	{
		return !has_object_without_pair(arr, first, second)
	}
}

var needs_at_least = function(first, second, number)
{
	return function(arr)
	{
		return !has_object(arr, first) || has_at_least_numbers_of_objects(arr, second, number)
	}
}

var necessary = function(obj)
{
	return function(arr)
	{
		return has_object(arr, obj)
	}
}

var required = function(first, second)
{
	return and(needs(first, second), first_need_second(second, first))
};

(function test_rules_functions(){
	var man = ["man"]
	var volk = ["volk"]
	var koza = ["koza"]
	var kapusta = ["kapusta"]

	var koza_volk = disabled(koza, volk)
	var koza_kapusta = disabled(kapusta, koza)
	var man_koza = needs(koza, man)
	var man_kapusta = needs(kapusta, man)

	var rule1 = and(or(man_koza, koza_volk), or(man_kapusta, koza_kapusta))
	var rule2 = or(necessary(man), and(koza_volk, koza_kapusta))

	var arrays = [
		[true, [man, volk, koza, kapusta], "That must be OK! man is there"],
		[false, [volk, koza, kapusta], "Alarm! they all eat each other"],
		[true, [man, volk, koza], "That must be OK! man is there"],
		[false, [volk, koza], "Alarm! volk eats koza"],
		[true, [koza, kapusta, man], "That must be OK! man is there"],
		[false, [koza, kapusta], "Alarm! koza eats kapusta"],
		[true, [volk, kapusta, man], "That must be OK! man is there"],
		[true, [volk, kapusta], "That must be OK! volk ok with kapusta"],
		[true, [volk], "That must be OK! any of them ok along"],
		[true, [man], "That must be OK! any of them ok along"],
		[true, [koza], "That must be OK! any of them ok along"],
		[true, [kapusta], "That must be OK! any of them ok along"],
		[true, [volk, man], "That must be OK! any of them ok with man"],
		[true, [koza, man], "That must be OK! any of them ok with man"],
		[true, [kapusta, man], "That must be OK! any of them ok with man"],
		[true, [], "That must be OK! nobody there, there are no conflicts"]
	]

	var test = function(rule, message)
	{
		arrays.forEach(function(elem){
			assert(elem[0] == rule(elem[1]), message + ": " + elem[2])
		})
	}

	test(rule1, "Rule 1")
	test(rule2, "Rule 2")

})();

(function test_needs_at_least(){
	var rule = needs_at_least(["stiralka"], ["muzhik"], 3)
	assert(!rule([["stiralka"]]), "needs 3 has 0")
	assert(!rule([["stiralka"], ["muzhik"]]), "needs 3 has 0")
	assert(!rule([["stiralka"], ["muzhik"], ["muzhik"]]), "needs 3 has 0")
	assert(rule([["stiralka"], ["muzhik"], ["muzhik"], ["muzhik"]]), "needs 3 has 3")
	assert(rule([["stiralka"], ["muzhik"], ["muzhik"], ["muzhik"], ["muzhik"]]), "needs 3 has 4")
})()










//==========================================================================

//--------- Game logic -----------

//==========================================================================

var POS_RIGHT = "right";
var POS_LEFT = "left";

(function()
{
	var select_boat_position = function(left, right)
	{
		return left.length > 0 ? POS_LEFT
				: right.length > 0 ? POS_RIGHT
				: POS_LEFT
	};

	(function test_select_boat_position(){
		assert(POS_LEFT == select_boat_position([1, 2], [3, 4]), "left priority")
		assert(POS_LEFT == select_boat_position([1, 2], []), "left priority")
		assert(POS_LEFT == select_boat_position([], []), "left priority")
		assert(POS_RIGHT == select_boat_position([], [1, 2]), "left is empty but right is not")
	})()

	var not_empty = function(arr)
	{
		return arr.length > 0
	}

	var get_weight = function(types_weights, arr)
	{
		var sum = 0;
		var len = arr.length;
		for(var i = 0; i < len; ++i)
		{
			var weight = types_weights[arr[i][0]]
			sum += weight === undefined ? 1 : weight
		}
		return sum
	};

	(function test_get_weight(){
		var types_weights = {
			volk: 2,
			muzhik: 1,
			nothing: 0
		}
		var arr = [["muzhik"], ["volk"], ["kapusta"], ["muzhik"], ["kapusta"], ["nothing"], ["nothing"]]
		assert(6 == get_weight(types_weights, arr), "Sum must be equal 6")
	})()

	var find = function(array, is_match, from, to)
	{
		var len = array.length
		from = from || 0;
		to = to === undefined ? len : to;
		for(var i = from; i < to; ++i)
		{
			if(is_match(array[i], i))
			{
				return i
			}
		}
		return -1
	};

	(function test_find(){
		assert(-1 == find([1, 2, 3, 4], function(){return false}), "must not find anyting")
		assert(0 == find([1, 2, 3, 4], function(){return true}), "must find first (ind=0) element")
		assert(1 == find([1, 2, 3, 4], function(elem){return elem % 2 == 0}), "arr[1] == 2 is first even element")
		assert(3 == find([1, 2, 3, 4], function(elem){return elem % 2 == 0}, 2), "arr[3] == 4 is first even element beginning from [2]")
		assert(-1 == find([1, 2, 3, 4], function(elem){return elem % 4 == 0}, 0, 3), "last elem%%4 is arr[3]==4 but it's over searching interval")
	})()

	var get_transaction_rule = function(transaction_rules, obj)
	{
		return transaction_rules[obj[CI_TYPE]] || true_fun;
	}

	var find_obj_in_arr = function(arr, obj)
	{
		return find(arr, curry(and(are_equal_types, are_equal_families), obj))
	}

	var move = function(transaction_rules, from, to, what)
	{
		var rest = from.slice()
		var target = to.slice()
		var real_what = []
		var all = from.concat(to)

		var what_len = what.length
		for(var i = 0; i < what_len; ++i)
		{
			var j = find_obj_in_arr(rest, what[i])

			if(j != -1 && get_transaction_rule(transaction_rules, what[i])(all))
			{
				var moved_obj = rest.splice(j, 1)[0]
				real_what.push(moved_obj)
				target.push(moved_obj)
			}
		}

		return {from: rest, to: target, what: real_what}
	};

	(function test_move(){
		var muzh1 = ["muzhik"]
		var transaction_rules = {stiralka: needs_at_least(["stiralka"], ["muzhik"], 3)}

		var from1 = [["muzhik"], ["muzhik"], ["muzhik"], ["stiralka"]]
		var to1 = []
		var what1 = [["muzhik"], ["stiralka"]] 
		var result1 = move(transaction_rules, from1, to1, what1)
		assert(result1.from.length == 2, "muzhik, muzhik in from")
		assert(result1.what.length == 2, "muzhik, stiralka were moved ")
		assert(result1.to.length == 2, "muzhik, stiralka in to")

		var from2 = [["muzhik"], ["muzhik"], ["stiralka"]]
		var to2 = [["korova"]]
		var what2 = [["muzhik"], ["stiralka"]] 
		var result2 = move(transaction_rules, from2, to2, what2)
		assert(result2.from.length == 2, "muzhik, stiralka are in from")
		assert(result2.what.length == 1, "muzhik was moved")
		assert(result2.to.length == 2, "muzhik, korova are in to")
	})()

	var do_transaction = function(game, from, to, what,
		from_boat_position, to_boat_position,
		from_rules, to_rules)
	{
		var config = game.config
		
		var result = move(config.transaction_rules, from, game.boat, what)
		if(game.boat_position != from_boat_position
			|| !from_rules(result.from)
			|| !config.boat_rules(result.to)
			|| !config.boat_moving_rules(result.to)
			|| get_weight(config.types_weights, result.to) > config.boat_capacity)
		{
			return false;
		}

		var to_result = move(config.transaction_rules, result.to, to, result.to)
		var to_all = to_result.from.concat(to_result.to)
		
		if(!to_rules(to_all))
		{
			return false;
		}

		game[from_boat_position] = result.from
		game.boat = to_result.from
		game[to_boat_position] = to_result.to
		game.boat_position = to_boat_position

		return true
	}

	var Game = function(cfg)
	{
		this.left = cfg.left || []
		this.right = cfg.right || []
		this.boat = cfg.boat || []
		this.boat_position = cfg.boat || select_boat_position(this.left, this.right)
		this.config = {
			left_rules: cfg.left_rules || cfg.rules || true_fun,
			right_rules: cfg.right_rules || cfg.rules || true_fun,
			boat_rules: cfg.boat_rules || cfg.rules || true_fun,
			boat_moving_rules: cfg.boat_moving_rules || not_empty,
			boat_capacity: cfg.boat_capacity || 0,
			types_weights: cfg.types_weights || [],
			transaction_rules: cfg.transaction_rules || true_fun
		}
	}

	Game.prototype.to_right = function(what)
	{
		var game = this
		return do_transaction(game, game.left, game.right, what,
			POS_LEFT, POS_RIGHT,
			game.config.left_rules, game.config.right_rules)
	}

	Game.prototype.to_left = function(what)
	{
		var game = this
		return do_transaction(game, game.right, game.left, what,
			POS_RIGHT, POS_LEFT,
			game.config.right_rules, game.config.left_rules)
	};

	(function test_game_stiralka(){
		var game = new Game({
			left: [["muzhik"], ["muzhik"], ["muzhik"], ["stiralka"]],
			boat_capacity: 3,
			boat_rules: necessary(["muzhik"]),
			transaction_rules: {stiralka: needs_at_least(["stiralka"], ["muzhik"], 3)}
		});

		assert(game.to_right([["muzhik"], ["muzhik"], ["stiralka"]]), "correct: [muzhik] --- [stiralka]-[muzhik, muzhik]")
		assert(!game.to_right([["muzhik"]]), "Incorrect boat side")
		assert(!game.to_left([]), "Can't go without muzhik")
		assert(game.to_left([["muzhik"]]), "correct: [muzhik, muzhik]-[stiralka] --- [muzhik]")
		assert(game.to_right([["muzhik"], ["muzhik"]]), "correct: [] --- [] - [muzhik, muzhik, muzhik, stiralka]")
	})();

	(function test_game_volk_koza_kapusta(){
		var muzhik = ["muzhik"]
		var volk = ["volk"]
		var koza = ["koza"]
		var kapusta = ["kapusta"]

		var koza_volk = disabled(koza, volk)
		var koza_kapusta = disabled(kapusta, koza)
		var muzhik_koza = needs(koza, muzhik)
		var muzhik_kapusta = needs(kapusta, muzhik)

		var game = new Game({
			left: [volk, koza, kapusta, muzhik],
			boat_capacity: 2,
			rules: or(necessary(muzhik), and(koza_volk, koza_kapusta)),
			boat_rules: necessary(muzhik)
		});

		assert(!game.to_right([volk]), "Can't go without muzhik")
		assert(!game.to_right([muzhik, kapusta]), "Can't go: volk eats koza")
		assert(!game.to_right([muzhik, volk]), "Can't go: koza eats kapusta")
		assert(game.to_right([muzhik, koza]), "Correct: [volk, kapusta] --- []-[muzhik, koza]")
		assert(!game.to_left([koza]), "Can't go without muzhik")
		assert(game.to_left([muzhik, volk]), "There are no volk but muzhik moves: [volk, kapusta, muzhik]-[] --- [koza]")
		assert(!game.to_left([muzhik]), "Boat is already on the left")
		assert(!game.to_right([muzhik, volk, kapusta]), "Overweight!")
		assert(!game.to_right([volk, kapusta]), "Can't go without muzhik")
		assert(game.to_right([muzhik, kapusta]), "Correct: [volk] --- []-[muzhik, koza, kapusta]")
		assert(!game.to_left([muzhik]), "Can't go: koza eats kapusta")
		assert(game.to_left([muzhik, koza]), "Correct: [volk, muzhik, koza]-[] --- [kapusta]")
		assert(game.to_right([muzhik, volk]), "Correct: [koza] --- []-[volk, muzhik, kapusta]")
		assert(game.to_left([muzhik]), "Correct: [koza, muzhik]-[] --- [volk, kapusta]")
		assert(game.to_right([muzhik, koza]), "Correct: [] --- []-[volk, koza, kapusta, muzhik")
	})()
})()
// var game = {
// 	right: [["man"], ["volk"], ["koza"], ["kapusta"]],
// 	left: [],
// 	boat: [],
// 	boat_position: "right",
// 	rules:
// }




})()