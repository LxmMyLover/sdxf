<%@ Page Language="C#" AutoEventWireup="true" CodeFile="userlogin.aspx.cs" Inherits="userlogin" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1.0,maximum-scale=1.0,minimum-sacle=1.0">
    <meta http-equiv="X-UA-Compatible">
    <link rel="stylesheet" type="text/css" href="css/userlogin.css" />
    <script src="libs/angular/angular.min.js"></script>
    <script src="libs/angular/angular-cookies.min.js"></script>
    <script src="js/userlogin.js"></script>
    <title>山东省公安消防总队网上商城</title>
</head>
<body ng-app="login">
    <img src="/images/userlogin.jpg" alt="" class="imgbj" /> 
    <div class="content">
        <form name="loginForm" class="login-form" autocomplete="off">
            <div class="login">
                <p>
                    <img src="/images/userpass.png" width="28" height="28" alt="" class="password" />
                    <input type="password" ng-keypress="keyLogin($event);"  id="userpass" ng-model="entity.password" placeholder="请输入密码" />
                </p>

                <a href="javascript:void(0);" ng-click="login();">
                    <img src="/images/login.png" width="50" height="50" alt="" class="denglu" />
                </a>
            </div>
        </form>
    </div>
</body>
</html>
<script type="text/javascript">
    var app = angular.module('login', ['ngCookies']);
    app.directive('loginForm', function () {
        return {
            restrict: 'C',
            controller: ['$scope', '$http', '$window', '$cookieStore', function ($scope, $http, $window, $cookieStore) {
                $scope.entity = {
                    password: '',
                    sn: '',
                    hcode:''
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
                $scope.keyLogin = function (e)
                {
                    var keycode = window.event ? e.keyCode : e.which;
                    if (keycode == 13) {
                        $scope.login();
                    }
                };
                $scope.login = function() {
                    var usn;
                    var ePassDigest;
                    var ukeyNum = 0;
                    try {
                        var ukey = new ActiveXObject("ET99_FULL.ET99Full.1");
                        ukeyNum = ukey.FindToken($scope.pid);
                        if (ukeyNum != 1) {
                            alert("请确认电脑上插入了一个U盾！");
                            return false;
                        }
                        ukey.OpenToken($scope.pid, 1);
                        $scope.entity.sn = ukey.GetSN();                      
                        $http({
                            method: 'post',
                            url: '/webapi/shop/logininit.ashx?act=sninit&sn=' + $scope.entity.sn,
                            dataType: "json",
                            data: $scope.entity,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.result == "1") {
                                ukey.VerifyPIN(0, data.pin);
                                $scope.entity.hcode = ukey.MD5HMAC(1, data.seed, data.seedlen);
                                ukey.CloseToken();
                                $http({
                                    method: 'post',
                                    url: '/webapi/shop/logininit.ashx?act=login&sn=' + $scope.entity.sn + "&hcode=" + $scope.entity.hcode+"&password="+$scope.entity.password,
                                    data: $scope.entity,
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                }).success(function (response) {
                                    if (response.result=="1") {                                        
                                        $window.location.href = response.url;
                                    } else {
                                        alert(response.msg);
                                    }
                                }).error(function (data) {
                                    $scope.alert.msg = '提交失败了';
                                })
                   ['finally'](function () {

                   });
                            }
                            else
                            {
                                alert("此U盾未被识别！");
                                return false;
                            }
                        }
                    )
                    .error(function () {
                    });

                    } catch (error) {
                        if (ukey != undefined)
                            ukey.CloseToken();
                        alert("请确认U盾已经插入并使用IE9以上浏览器访问本系统！");
                        return false;
                    };                    
                };


            }]
        };
    });
</script>