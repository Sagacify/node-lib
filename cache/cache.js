module.exports = function(redisClient){
	require('./model');
	require('./redis')(redisClient);
};