define(['angular', 'text!module/shop/search.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', 'ScrollPagination', function($scope, $rootScope, $routeParams, $http, ScrollPagination) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();
      $scope.$parent.keywords = $routeParams.keywords || '';

      var catId = 2;

      var defaults = {
        goodsName: $scope.keywords,
        intro: '',
        pageSize: 20
      };

      $scope.entity = {
        catId: 0,
        catName: ''
      };

      $scope.product = [];

      $scope.params = angular.copy(defaults, {});


      $http.post('webapi/shop/category.ashx?act=entity', {
          catId: catId
        })
        .success(function(response) {

          //当前分类的父级ID
          $scope.parentId = response.entity.parentId || 0;

          angular.extend($scope.entity, response.entity);
        });

      //左侧
      $http.post('webapi/shop/category.ashx?act=menu', {
          catId: catId
        })
        .success(function(response) {
          $scope.menu = response.list;
        });

      //推荐、最热、最新
      angular.forEach(['best', 'hot', 'new'], function(intro) {
        $scope[intro] = function() {
          $scope.params.intro = intro;
          $scope.conform();
        };
      });



      $scope.get_product = function() {
        var sm = new SimpleModal({
          width: '20%',
          center: true,
          show: true,
          overlayOpacity: 0.1,
          clickBgClose: false,
          keyEsc: false,
          loading_icon: '/images/loading.gif',
          skinClassName: 'loading'
        });
        sm.show({
          model: 'modal-loading'
        });

          // $http.post('webapi/shop/goods.ashx?act=list', $scope.params).success(function(response) {
          //
          // $scope.product = response.list;
          $http.get('webapi/shop/goods.ashx?act=GetListByKeyWord&goodsName=' + encodeURI($scope.keywords)).success(function(response) {

            $scope.product = response.all;

            $scope.noMore = true;

            //设置页码，数据总数，启用开关
            sp.reset({
              pageIndex: 2,
              totalItems: response.totalItems
            }, true);
          })['finally'](function() { // .finally的写法在IE8报错
            sm.hide();
          });
      }

      $scope.get_product();

      //确认
      $scope.conform = function(mode) {

        if (!mode && $scope.isFilter)
          return;

        angular.extend($scope.params, $scope.grade[0]);

        $scope.get_product();

        $scope.isFilter = false;
        $scope.loadMore = false;
      };

      var sp = new ScrollPagination({
        url: function(page) {
          return 'webapi/shop/goods.ashx?act=list&pageIndex=' + page;
        },
        postData: $scope.params,
        beforeLoad: function() {
          // $scope.noMore = true;
          // $scope.loadMore = false;
        },
        afterLoad: function(data, pageIndex, totalItems) {
          // $scope.loadMore = true;
          if ($scope.product.length) {
            angular.forEach(data.list, function(item) {
              $scope.product.push(item);
            });
          } else {
            $scope.product = data.list;
          }!totalItems && sp.reset({
            totalItems: data.totalItems
          });
        },
        finished: function() {
          // $scope.noMore = false;
        },
        pageSize: $scope.params.pageSize,
        offset: 100
      });

    }],
    tpl: tpl
  };
});
