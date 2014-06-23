/*
	counterStop object
	when executing count reachs the num, then it will return false (or true when flag is set to false)
	
	the return function should only use in one place, no reuse.
	because it is using the closure that preserve the increasing count each time.
*/

var counterStop = {
	newCounterStop: function(num, flag) {
		var count = 0
		var bool = !!flag
		return function(reset) {
			if (reset) {
				count = 0
				return
			}
			count += 1
			return count < num ? !bool : bool
		}
	}, 
	newCounterLoop: function(n, flag) {
		var base = 1,
			count = base,
			bool = !!flag
		return function(reset) {
			if (reset) {
				count = base
				return
			}
			if (count < n) {
				count += 1
				return !bool
			} else {
				count = base
				return bool
			}
		}
	}
}


module.exports = counterStop