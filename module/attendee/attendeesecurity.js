/**
 * Modify by baitl on 2017/7/31.
 */
define(['angular', 'text!module/attendee/attendeesecurity.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$routeParams', '$http', '$modal', 'alertSrv', function ($scope, $routeParams, $http, $modal, alertSrv) {
            $scope.entity = {
                orinalPassword: "",
                newPassword: "",
                confirmPassword:""
            };
            $scope.ModifyPassword = function () {
                if ($scope.entity.newPassword.replace(/(^\s*)|(\s*$)/g, '') == "")
                {
                    alert("新密码不能为空！");
                    return false;
                }
			    if ($scope.entity.newPassword.replace(/(^\s*)|(\s*$)/g, '') != $scope.entity.confirmPassword.replace(/(^\s*)|(\s*$)/g, ''))
			    {
			        alert("两次输入的密码不一致！");
			        return false;
			    }
				var sm = new SimpleModal({
					width:'20%',
					center:true,
					show:true,
					overlayOpacity:0.1,
					clickBgClose:false,
					keyEsc:false,
					loading_icon:'../images/loading.gif',
					skinClassName:'loading'
				});
				sm.show({
					model:'modal-loading'
				});
			    $http.get('../webapi/attendee/userinfochange.ashx?act=changePassword&orinalPassword=' + $scope.entity.orinalPassword + "&newPassword=" + $scope.entity.newPassword)
				.success(function (response) {
				    if (response.result != undefined && response.result == "9999") {
				        window.location.href = "/userlogin.aspx";
				        return false;
				    }
				    if(response.result=="1")
				    {
				        alert("密码修改成功,请重新登录！");
				        window.location.href = "/userlogin.aspx";
				    }
				    if(response.result=="0")
				    {
				        alert(response.msg);
				    }
				    
				})
				['finally'](function(){
					sm.hide();
				});
			};			
        }],
        tpl: tpl
    };
});