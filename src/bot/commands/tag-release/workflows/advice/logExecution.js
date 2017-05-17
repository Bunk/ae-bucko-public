module.exports = ( { log } ) => {
	return {
		around( joinpoint ) {
			const { method } = joinpoint;
			log.debug( { method }, "Running flow step" );
			return joinpoint.proceed();
		}
	};
};
