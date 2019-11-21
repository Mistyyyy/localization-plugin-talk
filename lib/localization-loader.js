module.exports = function(source) {
	const { defaultLanguage } = this.query;
	const data = {};
	data[defaultLanguage] = JSON.parse(source);
	return JSON.stringify(data);
};
