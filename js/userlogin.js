var app = angular.module('login', ['ngCookies']);
app.directive('loginForm', function () {
    return {
        restrict: 'C',
        controller: ['$scope', '$http', '$window', '$cookieStore', function ($scope, $http,$window, $cookieStore) {
            $scope.entity = {
                userName: '',
                password: ''
            };
            $scope.alert = {
                msg: ''
            };
            $scope.init = false;
            $scope.pid = "";
            $http.get("/webapi/shop/logininit.ashx?act=loginInit")
                .success(function (data) {
                    $scope.init = true;
                    $scope.pid = data.pid;
                }
                )
                .error(function () {
                });

            $scope.login = function () {
                var usn;
                var ePassDigest;
                var ukeyNum=0;
                try {
                    var ukey = new ActiveXObject("ET99_FULL.ET99Full.1");
                    ukeyNum = ukey.FindToken($scope.pid);
                    if (ukeyNum != 1) {
                        alert("请确认电脑上插入了一个U盾！");
                        return false;
                    }
                    ukey.OpenToken($scope.pid, 1);
                    usn = ukey.GetSN();
                    //根据sn获取UserPIN

                    ukey.VerifyPIN(0, InitInfoForm.USERPIN.value);
                    alert("VerifyPIN Success!");

                    //硬件中进行计算。注意第二个参数是随机数，应该改为ASP或者JSP的代码，如："<%=Session["Message"].ToString()%>"
                    //这里作为示例，固定写死了。第三个参数是随机数的长度。
                    //这里的计算结果ePassDigest是客户端的结果，传给服务器，与服务器端的结果进行验证
                    ePassDigest = ukey.MD5HMAC(1, "asdfghjkllqwertyuiop", 20);
                    ukey.CloseToken();

                } catch (error) {
                    if (ukey != undefined)
                        ukey.CloseToken();
                    alert("请确认U盾已经插入并使用IE9以上浏览器访问本系统！");
                    return false;
                };
                $scope.myForm.$invalid = true;
                $http({
                    method: 'post',
                    url: '/webapi/admin/adminUser.ashx?act=login',
                    data: $scope.entity,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                        return str.join("&");
                    }
                }).success(function (response) {
                    if (response.entity.userId) {
                        $cookieStore.put('adminUser', response.entity);
                        $window.location.href = 'index.html';
                    } else {
                        $scope.alert.msg = '用户名或密码不正确';
                    }
                }).error(function (data) {
                    $scope.alert.msg = '提交失败了';
                })
				['finally'](function () {
				    $scope.myForm.$invalid = false;
				});
            };
        }]
    };
});
