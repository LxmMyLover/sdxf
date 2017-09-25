define(['angular', 'text!module/shop/articlelist.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();



      $http.get('../webapi/shop/notice.ashx?act=getNoticeList')
        .success(function(data) {
          $scope.notice_list = data.list || [];
          $scope.notice_list = $scope.notice_list.map(function(v) {
            v.addTime = new Date(v.addTime).toLocaleDateString();
            return v;
          })
          $scope.notice = $scope.notice_list[0];
        })

      $scope.goArticle = function(articleId) {
        $location.path('/article/' + articleId);
      }

    }],
    tpl: tpl
  };
});
