define(['angular'], function(angular) {

  return {
    controller: ['$scope', '$http', '$location', '$cookieStore', '$timeout', function($scope, $http, $location, $cookieStore, $timeout) {

      var sm = new SimpleModal({
        width: 300,
        offsetTop: 150,
        hideFooter: true,
        autoClose: true
      });

      var url = '/default';

      $http.get('webapi/shop/users.ashx?act=logout')
        .success(function() {
          $cookieStore.remove('sdxfshoporg');
          $cookieStore.remove('sdxfshoporgcat');
          $cookieStore.remove('sdxfshoporgname');
          sm.on('hidden', function() {
            $timeout(function() {
              $location.path(url);
            }, 200);
          }).show({
            title: '提示消息',
            contents: '<p>退出登录成功</p>\
                          <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>'
          });

        })
        .error(function() {
          sm.show({
            title: '提示消息',
            contents: '请求失败了，稍后重试！'
          });
        });
    }]
  };
});
