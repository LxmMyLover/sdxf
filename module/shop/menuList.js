define(['angular', 'text!module/shop/menuList.html'], function(angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', 'ScrollPagination', '$timeout', function($scope, $rootScope, $routeParams, $http, ScrollPagination, $timeout) {
            //接收default.js传递过来的菜单导航
            $scope.menu = $rootScope.menus;
            //angular不识别location 定义一个变量赋值应用
            $scope.url = location.href.split('#')[1].split('/')[2];
        }],
        tpl: tpl
    };
});
