define(['angular','app'],function(angular,app){

	app.filter('replace',function($window,$document){

		return function (input,substr,replacement){
            return input.replace(new RegExp(substr,'g'),replacement);
        };

	});

	app.filter('rootPath',function($window,$document){

		return function (input){

			var regexp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

			if(input && !regexp.test(input) && input.charAt(0) !== '/'){
				return '/' + input;
			}
			return input;

        };

	});

});