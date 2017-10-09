define(['angular', 'text!module/shop/login.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', '$location', '$cookieStore', '$timeout', function($scope, $routeParams, $http, $location, $cookieStore, $timeout) {

      $scope.register = function() {
        $location.path('/register');
      };

      $scope.save = function() {

        $scope.myForm.$invalid = true;

        var sm = new SimpleModal({
          width: 300,
          offsetTop: 150,
          hideFooter: true,
          autoClose: true
        });

        $http.post('webapi/shop/users.ashx?act=login', {
            userName: $scope.userName,
            password: $scope.password
          })
          .success(function(response) {

            var entity = response.entity;

            if (entity.userId) {

              url = '/default';

              sm.on('hidden', function() {
                $timeout(function() {
                  $cookieStore.put('users', entity);
                  $location.path(url);
                });
              }).show({
                title: '提示消息',
                contents: '<p>欢迎您回来，' + entity.userName + '，现在将转入登录前页面</p>\
						    <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>'
              });

            } else {

              $scope.myForm.$invalid = false;

              sm.show({
                title: '提示消息',
                contents: '用户名或密码不正确'
              });

            }
          })
          .error(function() {

            $scope.myForm.$invalid = false;

            sm.show({
              title: '提示消息',
              contents: '请求失败了，稍后重试！'
            });
          });
      };

    }],
    tpl: tpl
  };
});
