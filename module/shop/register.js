define(['angular', 'text!module/shop/register.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$routeParams', '$http', '$location', '$cookieStore', '$timeout', function ($scope, $routeParams, $http, $location, $cookieStore, $timeout) {

			$scope.save = function(){

				$scope.myForm.$invalid = true;

				var sm = new SimpleModal({
					width:300,
					offsetTop:150,
					hideFooter:true,
					autoClose:true
				});

				$http.post('webapi/shop/users.ashx?act=save',{
					userName:$scope.userName,
					password:$scope.password,
					email:$scope.email
				})
	    		.success(function(response){

	    			if(data.result){
				    
				        var url = '/login';                   
				        
				        sm.on('hidden',function(){
				        	$timeout(function(){
				        		$location.path(url);
				        	});
				        }).show({
						    title:'提示消息',
						    contents:'<p>感谢您注册 UCON港韩美瞳代购网，现在将以 普通会员 身份登录站点</p>\
						    <p><a href="#/member">现在去完善资料 先去会员中心</a></p>\
						    <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>'
					    });
					    
				    }else{
				    
				        $scope.myForm.$invalid = false;
				        
				        sm.show({
						    title:'提示消息',
						    contents:data.msg
					    });
					    
				    }
				})
				.error(function(){
					
					$scope.myForm.$invalid = false;

					sm.show({
						title:'提示消息',
						contents:'请求失败了，稍后重试！'
					});
				});
			};

        }],
        tpl: tpl
    };
});