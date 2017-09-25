define(['angular', 'text!module/shop/default.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope','$rootScope', '$routeParams', '$http', '$location','$anchorScroll', function($scope, $rootScope, $routeParams, $http, $location, $anchorScroll) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();

      //协议供货的锚点跳转
      $scope.goHot = function(){
          $location.hash('hot');
          $anchorScroll()
      }
      //导航栏的商品分类
      // $http.get('webapi/shop/category.ashx?act=nav').success(function(data) {
      //   $scope.category_list = data.list || [];
      // });
      $('#slider').nivoSlider();
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

        $scope.menu = convert(response.all || []);
        // 商品分类 图片等
        $scope.hotGoods = [];
        var send = function(obj) {
          if (obj < $scope.menu.length) {
            $http.get('../webapi/shop/goods.ashx?act=getSpecialGoodsByCat&CatId=' + $scope.menu[obj].catId)
              .success(function(data) {
                if (data.list.length > 0) {
                  $scope.hotGoods.push({
                    catId: $scope.menu[obj].catId,
                    catName: $scope.menu[obj].catName,
                    list: data.list
                  });
                }
                obj++;
                send(obj);

                $scope.goCatName = function(){
                    $location.hash($scope.menu[obj].catName);
                    $anchorScroll();
                }

              });
          }
        }
        console.log($scope.hotGoods)
        send(0);
      });

      // 搜索框搜索功能移至
        $http.get('webapi/shop/car.ashx?act=count').success(function(data) {
            $rootScope.goodsNumber = data;
        });

        $scope.search_keyup = function(e) {
            var key_code = window.event ? e.keyCode : e.which;
            if (key_code == 13) {
                $scope.search();
            }
        }
        $scope.search = function() {
            $location.path('/search/' + $scope.keywords);
        }




      $http.get('../webapi/shop/notice.ashx?act=getNoticeList')
        .success(function(data) {
          $scope.news_list = data.list || [];
          $scope.notice = $scope.news_list[0];
        })

      $scope.goArticle = function(articleId) {
        $location.path('/article/' + articleId);
      }




      // $scope.notice = {
      //   title: '中华人民共和国最高人民法院公告',
      //   content: '最高人民法院关于如何处理农村五保对象遗产问题的批复》已于2000年6月30日由最高人民法院审判委员会第1121次会议通过。现予公布，自2000年8月3日起施行。'
      // }
      //
      // $scope.news_list = [{
      //   img: '',
      //   content: "灭火器是这一种可携式灭火工具，灭火器内置化学"
      // }, {
      //   img: '',
      //   content: ""
      // }]

      //  商品展示标题部分背景色
      //   sklssb===谁看了谁傻逼 (张建武 武哥指示)
        $scope.sklssb = ["#4488a6","#ca3559","#734d8b","#518a79"]
        //商品展示标题部分 按钮背景颜色
        // $scope.sklssbBtn = ["#659eb2"," #cf5b72","#8c6da0","#6b9a8b"]
        // hot-great-classify的图片路径
        $scope.ZDiao = ["/images/101.jpg","/images/102.jpg"]


      $scope.goArticleList = function() {
        $location.path('/articlelist');
      }

      $scope.goSupplier = function() {
        $location.path('/supplier_login');
      }

      $scope.goCategory = function(_event, category_id) {
        $location.path('/category/' + category_id);
      }
      // 点击商品图片跳转对应页面
      $scope.viewGoods = function(id) {
        if (id) {
          $location.path('/goods/' + id);
        }
      }

    }],
    tpl: tpl
  };
});
