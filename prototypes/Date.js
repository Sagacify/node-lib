Date.prototype.getWeekDayName = function(){
	return this.weekDayName()[this.getDay()];
};

Date.prototype.weekDayName = function(){
	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
};