define(['angular', 'text!module/shop/category.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', 'ScrollPagination', '$timeout', function($scope, $rootScope, $routeParams, $http, ScrollPagination, $timeout) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();
      var catId = $scope.catId = $routeParams.id || 0;

      $scope.default_brandId = 0;

      var defaults = {
        intro: '',
        catId: catId,
        brandId: 0,
        aids: [],
        min: 0,
        max: 0,
        pageSize: 20
      };

      $scope.entity = {
        catId: catId,
        catName: ''
      };

      $scope.breadcrumb =
        $scope.brand =
        $scope.price =
        $scope.attribute =
        $scope.product = [];

      $scope.grade = [{
        min: 0,
        max: 0
      }];

      $scope.params = angular.copy(defaults, {});


      $http.post('webapi/shop/category.ashx?act=entity', {
        catId: catId
      }).success(function(response) {

        //当前分类的父级ID
        $scope.parentId = response.entity.parentId || 0;

        //价格
        $http.post('webapi/shop/category.ashx?act=grade', response.entity)
          .success(function(response) {
            $scope.price = response.list;
          });

        //属性
        $http.post('webapi/shop/attribute.ashx?act=list', {
          attrIds: response.entity.filterAttr
        }).success(function(response) {
          $scope.attribute = response.list;
          angular.forEach(response.list, function(item, index) {
            defaults.aids.push(0);
            $scope.params.aids.push(0);
          });
        });

      });

      //分类树
      $http.post('webapi/shop/category.ashx?act=tree', {
          catId: catId
        })
        .success(function(response) {

          var entity = response.list.length ? response.list[response.list.length - 1] : {};

          //面包屑
          $scope.breadcrumb = response.list;
          $scope.breadcrumblist = $scope.breadcrumb.map(function(v) {
            return v.catId;
          });
          console.log($scope.breadcrumblist)

          angular.extend($scope.entity, entity);


          //左侧菜单
          $http.post('webapi/shop/category.ashx?act=getTotal').success(function(response) {

            var convert = function(list) {
              var result = [];
              for (var i = 0; i < list.length; i++) {
                var ri = list[i];
                for (var j = 0; j < list.length; j++) {
                  for (var k = 0; k < list.length; k++) {
                    if (list[k].parentId == list[j].catId) {
                      break;
                    }
                  }
                }

                if (ri.parentId != null && ri.parentId != 'null') {
                  for (var j = 0; j < list.length; j++) {
                    var rj = list[j];
                    if (rj.catId == ri.parentId) {
                      rj.children = !rj.children ? [] : rj.children;
                      rj.children.push(ri);
                      break;
                    }
                  }
                }

                if (ri.parentId == 0) {
                  result.push(ri);
                }
              }
              return result;
            }

            $scope.menu = convert(response.all);

          });

          // $http.post('webapi/shop/category.ashx?act=menu', {
          //     catId: entity.catId || 0
          //   })
          //   .success(function(response) {
          //     $scope.menu = response.list;
          //   });

        });

      //品牌
      $http.get('webapi/shop/brand.ashx?act=all')
        .success(function(response) {
          $scope.brand = response.all;
        });


      //推荐、最热、最新
      angular.forEach(['best', 'hot', 'new'], function(intro) {
        $scope[intro] = function() {
          $scope.params.intro = intro;
          $scope.conform();
        };
      });

      //筛选
      $scope.filter = function() {
        $scope.isFilter = true;
        $scope.filterY = {
          height: document.documentElement.clientHeight + 'px'
        };
        $scope.filterX = {
          left: 0
        };
      };

      //重置
      $scope.reset = function() {
        $scope.params = angular.copy(defaults, {});
        $scope.grade[0] = {
          min: 0,
          max: 0
        };
      };

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

        $http.post('webapi/shop/goods.ashx?act=list', $scope.params).success(function(response) {

          $scope.product = response.list;

          //设置页码，数据总数，启用开关
          sp.reset({
            pageIndex: 2,
            totalItems: response.totalItems
          }, true);
        })['finally'](function() { // .finally的写法在IE8报错
          sm.hide();
        });

        $scope.noMore = true;
      }

      $scope.get_product();

      //确认
      $scope.conform = function(type, param) {

        angular.extend($scope.params, $scope.grade[0]);

        if (type == 'brand') {
          $scope.params.brandId = param;
        } else if (type == 'price') {
          angular.extend($scope.params, param);
        }

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
          $scope.loadMore = true;
          $scope.noMore = false;
          //return $('.page-product .page').is(':visible') || $('.page-filter').offset().left > 0;
          return !$scope.isFilter;
        },
        afterLoad: function(data, pageIndex, totalItems) {
          $scope.loadMore = false;
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
          $scope.noMore = true;
        },
        pageSize: $scope.params.pageSize,
        offset: 100
      });

    }],
    tpl: tpl
  };
});
