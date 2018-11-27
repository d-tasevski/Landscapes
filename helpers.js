/* eslint-disable prefer-rest-params */
/* eslint-disable func-names */
function to(promise, errorExt) {
	return promise
		.then(data => [null, data])
		.catch(err => {
			if (errorExt) {
				Object.assign(err, errorExt);
			}
			console.log('ERROR', err);
			return [err, undefined];
		});
}

function handleError(err) {
	throw new Error(err);
}

module.exports = { to, handleError };
