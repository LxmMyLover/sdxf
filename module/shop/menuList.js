define(['angular', 'text!module/shop/menuList.html'], function(angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', 'ScrollPagination', '$timeout', function($scope, $rootScope, $routeParams, $http, ScrollPagination, $timeout) {
            $scope.menu = $rootScope.menus;
            $scope.url = location.href.split('#')[1].split('/')[2];
            console.log($rootScope.menus)
            console.log(window.location.href.split('#')[1].split('/')[2])
        }],
        tpl: tpl
    };
});
