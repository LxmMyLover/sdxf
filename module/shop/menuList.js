define(['angular', 'text!module/shop/menuList.html'], function(angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {

        controller: ['$scope', '$rootScope', '$routeParams', '$http', 'ScrollPagination', '$timeout', 'locals', function($scope, $rootScope, $routeParams, $http, ScrollPagination, $timeout, locals) {
            //angular不识别location 定义一个变量赋值应用
            $scope.url = location.href.split('#')[1].split('/')[2];

            //读取default.js存储的菜单导航
            $scope.menus = locals.getObject('menu','');
            console.log(locals.getObject('menu',''))

            //定义变量接受 读取default.js存储的菜单导航
            $scope.menu = $scope.menus;
        }],
        tpl: tpl
    };
});
