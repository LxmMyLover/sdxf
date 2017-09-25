define(['angular', 'text!module/shop/goods.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$sce', '$scope', '$rootScope', '$routeParams', '$http', '$location', '$compile', '$timeout', '$cookieStore', '$anchorScroll', 'ScrollPagination', 'FileUploader', 'alertSrv', function($sce, $scope, $rootScope, $routeParams, $http, $location, $compile, $timeout, $cookieStore, $anchorScroll, ScrollPagination, FileUploader, alertSrv) {
      $scope.$parent.isShopUser = true;
      if ($cookieStore.get('sdxfshoporgcat')) {
        $scope.$parent.setTitle();
        $scope.$parent.isShopUser = $cookieStore.get('sdxfshoporgcat') == '1';
      }
      var goodsId = $routeParams.id || 0;

      var regexp = /^([1-9][0-9]*)$/;

      var iSwiper, zSwiper, hSwiper;

      //定时器
      var timer = null;

      //app需要获取配置文件，暂时写死
      var app = {
        commentCheck: 1
      };

      var gidsCookie = $cookieStore.get('gids') || [];

      var postData = function() {
        var data = angular.extend({}, $scope.goods.params);
        data.goodsAttrId = [];
        angular.forEach($scope.goods.params.gaids, function(item) {

          if (angular.isArray(item)) {
            data.goodsAttrId.concat(item);
          } else {
            data.goodsAttrId.push(item);
          }
        });
        data.goodsAttrId = data.goodsAttrId.join(',');
        return data;
      };

      //检查商品是否已收藏
      var checkCollected = function() {
        $http.post('webapi/shop/collectGoods.ashx?act=check', {
            goodsId: goodsId
          })
          .success(function(resp) {
            $scope.isCollected = angular.equals(resp, 'true');
          });
      };

      //购物车商品总件数
      var shoppingCount = function() {
        $http.get('webapi/shop/car.ashx?act=count')
          .success(function(data) {
            $scope.goodsNumber = data;
            $rootScope.goodsNumber = data;
          });
      };

      //记录商品点击数
      var clickCountCookie = function() {

        if (!gidsCookie.length) {
          $http.post('webapi/shop/goods.ashx?act=updateClickCount', {
              goodsId: goodsId
            })
            .success(function(data) {
              if (data.result) {
                $cookieStore.put('gids', [goodsId]);
              }
            });
        } else {
          if (gidsCookie.indexOf(goodsId) === -1) {
            $http.post('webapi/shop/goods.ashx?act=updateClickCount', {
                goodsId: goodsId
              })
              .success(function(data) {
                if (data.result) {
                  gidsCookie.push(goodsId);
                  $cookieStore.put('gids', gidsCookie);
                }
              });
          }
        }
      };

      $scope.goods = {
        //市场价
        marketPrice: [],
        shopPrice: [],
        //商品信息
        showProInfo: [],
        entity: {
          goodsId: goodsId,
          catId: 0,
          goodsName: ''
        },
        params: {
          goodsId: goodsId,
          goodsNumber: 1,
          gaids: []
        }
      };

      $scope.category = {
        catId: 0,
        catName: '',
        parentId: 0
      };

      $scope.comment = {
        list: [],
        page: 1,
        points: 0,
        items: 0,
        alerts: [],
        uploader: new FileUploader({
          url: '../webapi/file.ashx?act=upload&sizeLimit=300KB&fileType=jpg,gif,png,bmp',
          queueLimit: 1, //文件个数
          removeAfterUpload: true //上传后删除文件
        }),
        rating: {
          max: 5,
          isReadonly: false,
          overStar: null,
          hoveringOver: function(value) {
            $scope.comment.rating.overStar = value;
            $scope.comment.rating.percent = 100 * (value / $scope.comment.rating.max);
          }
        },
        params: {
          goodsId: goodsId,
          status: 1,
          pageSize: 20
        },
        entity: {
          goodsId: goodsId,
          commentRank: 5,
          content: ''
        }
      };

      $scope.anchor = {};

      angular.forEach(['brief', 'desc', 'comment', 'param', 'service'], function(name) {
        $scope.anchor[name] = function() {
          $location.hash('span-' + name);
          $anchorScroll();
        };
      });

      $scope.current = [];
      $scope.breadcrumb = [];

      //上传文件缓存列表
      $scope.pictureCache = [];

      $scope.comment.alerts = alertSrv.alerts = [];

      $scope.comment.uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/ , options) {
          return this.queue.length < 1;
        }
      });

      $scope.comment.uploader.onSuccessItem = function(fileItem, response, status, headers) {

        $scope.pictureCache = response.fileInfo || [];

        if (response.msg.length) {
          alertSrv.addAlert('warning', response.msg);
        }

        if ($scope.pictureCache.length) {
          //显示缩率图
          $scope.comment.entity.picture = '/temp/' + $scope.pictureCache[0].fileName;

          //存入文件名缓存列表
          $rootScope.files.push($scope.pictureCache[0].fileName);

          //清除定时器
          $timeout.cancel(timer);

          //1分钟清除文件缓存
          timer = $timeout(function() {
            $scope.pictureCache.length = 0;
            $rootScope.files.clearAllCache();
            $scope.comment.entity.picture = '';
            alertSrv.addAlert('warning', '每隔1分钟自动清理一次图片，请重新上传');
          }, 1000 * 60);
        }
      };

      $scope.iSwiper = function() {
        iSwiper = new Swiper('.shop-gallery .swiper-container', {
          pagination: '.shop-gallery .swiper-pagination',
          paginationClickable: true,
          autoplay: 2500,
          autoplayDisableOnInteraction: false,
          calculateHeight: true
        });
      };

      $scope.zSwiper = function() {
        zSwiper = new Swiper('.shop-zoombox .swiper-container', {
          paginationClickable: true,
          slidesPerView: 5,
          slidesPerGroup: 5,
          onlyExternal: true
        });
      };

      $scope.hSwiper = function() {
        hSwiper = new Swiper('.shop-history .swiper-container', {
          paginationClickable: true,
          slidesPerView: 3,
          slidesPerGroup: 3,
          mode: 'vertical',
          //loop: true,
          onlyExternal: true
        });
      };

      //历史记录图片向上移动
      $scope.arrowU = function() {
        hSwiper.swipePrev();
      };

      //历史记录图片向下移动
      $scope.arrowD = function() {
        hSwiper.swipeNext();
      };

      //相册小图左移动
      $scope.arrowL = function() {
        zSwiper.swipePrev();
      };

      //相册小图右移动
      $scope.arrowR = function() {
        zSwiper.swipeNext();
      };

      //相册图片切换
      $scope.changeImg = function(i) {
        $scope.zoomPic = $scope.gallery[i].imgOriginal;
        angular.forEach($scope.gallery, function(item, index) {
          $scope.current[index] = false;
        });
        $scope.current[i] = true;
      };

      //减少购买数量
      $scope.minus = function() {
        $scope.goods.params.goodsNumber = Math.max(--$scope.goods.params.goodsNumber, 1);
      };

      //增加购买数量
      $scope.plus = function() {
        ++$scope.goods.params.goodsNumber;
      };

      //购买数量输入检测
      $scope.limit = function() {
        if (!regexp.test($scope.goods.params.goodsNumber) || parseFloat($scope.goods.params.goodsNumber) < 1) {
          $scope.goods.params.goodsNumber = 1;
        }
      };

      //立即购买
      $scope.quickBuy = function() {

        $scope.button = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true
        });

        $http.post('webapi/shop/car.ashx?act=save', postData())
          .success(function(data) {
            if (data.result) {
              $timeout(function() {
                $location.path('/reckoning');
              });
            } else {
              $scope.button = false;

              sm.show({
                title: '提示消息',
                contents: data.msg
              });
            }
          })
          .error(function(data) {
            $scope.button = false;

            sm.show({
              title: '提示消息',
              contents: '购买失败了，稍后重试！'
            });
          });
      };

      //加入购物车
      $scope.addCart = function() {

        $scope.button = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true
        });

        var content = '<p>加入购物车成功！\
				    <a href="" ng-click="goShopping()">继续购物</a>\
				    <a href="" ng-click="goCart()">去购物车</a></p>';

        $scope.goShopping = function() {
          sm.hide();
        };

        $scope.goCart = function() {
          sm.on('hidden', function() {
              $timeout(function() {
                $location.path('/cart');
              });
            })
            .hide();
        };

        $http.post('webapi/shop/car.ashx?act=save', postData())
          .success(function(data) {

            shoppingCount();

            sm.show({
              title: '提示消息',
              contents: data.result ? $compile(content)($scope) : data.msg
            });


            $timeout(function() {
              sm.hide();
            }, 2000);
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '加入购物车失败了，稍后重试！'
            });
          })['finally'](function() {
            $scope.button = false;
          });

      };

      //收藏
      $scope.shoucang = function() {

        $scope.button = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true
        });

        $http.post('webapi/shop/collectGoods.ashx?act=save', postData())
          .success(function(data) {
            sm.show({
              title: '提示消息',
              contents: data.result ? '收藏成功！' : data.msg
            });
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '收藏失败了，稍后重试！'
            });
          })['finally'](function() {
            $scope.button = false;
          });

      };

      //发表评论
      $scope.save = function() {



        $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
          //检测是否登录
          if (response.result != undefined && response.result == "9999") {
            window.location.href = "/userlogin.aspx";
            return false;
          } else {

            $scope.button = true;

            $http.post('webapi/shop/comment.ashx?act=save', $scope.comment.entity)
              .success(function(resp) {
                if (resp.result > 0) {

                  var defer = $q.defer();

                  //上传图片
                  if ($scope.pictureCache.length) {

                    $http.post('webapi/shop/comment.ashx?act=upload', {
                        commentId: resp.entity.commentId,
                        picture: $scope.pictureCache[0].fileName
                      })
                      .success(function(resp) {
                        if (resp.result > 0)
                          defer.resolve({
                            type: 'success',
                            msg: '图片上传成功'
                          });
                        else
                          defer.resolve({
                            type: 'warning',
                            msg: resp.msg
                          });
                      })
                      .error(function(resp) {
                        defer.reject({
                          type: 'danger',
                          msg: resp
                        });
                      });

                  } else {
                    defer.resolve();
                  }

                  defer.promise.then(function(value) {

                      resp && alertSrv.addAlert(value.type, value.msg);

                      alertSrv.addAlert('success', resp.msg, function() {
                        //如果不需要管理审核直接添加到评论列表
                        if (!app.commentCheck) {
                          $scope.comment.list.push(resp.entity);
                        }
                        //清除文件缓存
                        $rootScope.files.clearAllCache();
                      });

                    })
                    .catch(function(error) {
                      alertSrv.addAlert(error.type, error.msg);
                    });

                } else {
                  alertSrv.addAlert('warning', resp.msg);
                }
              })
              .error(function(resp) {
                alertSrv.addAlert('danger', resp);
              })['finally'](function() {
                $scope.button = false;
              });

          }
        });
      };

      //商品详情
      $http.post('webapi/shop/goods.ashx?act=entity', {
          goodsId: goodsId
        })
        .success(function(resp) {

          angular.extend($scope.goods.entity, resp.entity);

          $scope.goods.entity.goodsDesc = $sce.trustAsHtml($scope.goods.entity.goodsDesc);

          //分类树
          $http.post('webapi/shop/category.ashx?act=tree', {
              catId: $scope.goods.entity.catId
            })
            .success(function(response) {
              var list = response.list || [];
              var entity = list.length ? list[0] : {};

              //当前商品所属分类的父级ID
              $scope.parentId = list.length ? list[list.length - 1].parentId : 0;

              //面包屑
              $scope.breadcrumb = list;

              angular.extend($scope.category, entity);

              //创建属性值
              angular.forEach($scope.goods.entity.attribute, function(item, index) {

                if (item.attrType < 2) {
                  $scope.goods.params.gaids[index] = item.goodsAttr.length ? item.goodsAttr[0].goodsAttrId : 0;
                } else {
                  $scope.goods.params.gaids[index] = [];
                  angular.forEach(item.goodsAttr, function(item2, index2) {
                    $scope.goods.params.gaids[index][index2] = 0;
                  });
                }

              });

              //左侧菜单
              // $http.post('webapi/shop/category.ashx?act=menu', {
              //     catId: entity.catId || 0
              //   })
              //   .success(function(response) {
              //     $scope.menu = response.list || [];
              //   });
            });

          //市场价
          $scope.goods.marketPrice.push({
            text: '价格',
            value: $scope.goods.entity.marketPrice
          });

          //市场价
          $scope.goods.shopPrice.push({
            text: '价格',
            value: $scope.goods.entity.shopPrice
          });

          //商品信息
          $scope.goods.showProInfo.push({
            text: '货号',
            value: $scope.goods.entity.goodsSn
          });

          $scope.goods.showProInfo.push({
            text: '品牌',
            value: $scope.goods.entity.brand.brandName
          });

          $scope.goods.showProInfo.push({
            text: '商品产地',
            value: $scope.goods.entity.originPlace
          });

          $scope.goods.showProInfo.push({
            text: '上架时间',
            value: new Date($scope.goods.entity.addTime).toLocaleDateString()
          });

        });

      //相册
      $http.post('webapi/shop/goodsGallery.ashx?act=list', {
        goodsId: goodsId
      }).success(function(resp) {
        $scope.gallery = resp.list || [];
        $scope.gallery.length && $scope.changeImg(0);
      });

      //销售量
      $http.post('webapi/shop/goods.ashx?act=sale', {
          pageSize: 20
        })
        .success(function(resp) {
          $scope.sale = resp.list || [];
        });

      //浏览数
      $http.post('webapi/shop/goods.ashx?act=visit', {
        pageSize: 20
      }).success(function(resp) {
        $scope.visit = resp.list || [];
      });

      //历史记录
      $scope.history = [];
      if (gidsCookie.length > 0) {
        $http.post('webapi/shop/goods.ashx?act=info', {
            gids: gidsCookie.join(',')
          })
          .success(function(data) {
            $scope.history = data.list || [];
          });
      }

      //用户评论
      $http.post('webapi/shop/comment.ashx?act=list', $scope.comment.params)
        .success(function(data) {
          $scope.comment.list = data.list || [];
          $scope.comment.points = data.totalPoints || 0;
          $scope.comment.items = data.totalItems || 0;

          /*用户评论滚动翻页*/
          var sp = new ScrollPagination({
            url: function(page) {
              return 'webapi/shop/comment.ashx?act=list&pageIndex=' + page;
            },
            postData: $scope.comment.params,
            beforeLoad: function() {
              $scope.noMore = true;
              $scope.loadMore = false;
              return angular.element('#navbar-example').is(':hidden') && angular.element('.comment-container').is(':visible');
            },
            afterLoad: function(data, pageIndex, totalItems) {
              $scope.loadMore = true;
              if ($scope.comment.list.length) {
                angular.forEach(data.list, function(item) {
                  $scope.comment.list.push(item);
                });
              } else {
                $scope.comment.list = data.list;
              }
            },
            finished: function() {
              $scope.noMore = false;
            },
            pageIndex: 2,
            pageSize: $scope.comment.params.pageSize,
            totalItems: data.totalItems,
            offset: 10
          });

          //评论加载更多
          $scope.commentMore = function() {
            $http.post('webapi/shop/comment.ashx?act=list&pageIndex=' + (++$scope.comment.page), $scope.comment.params)
              .success(function(data) {
                if ($scope.comment.list.length) {
                  angular.forEach(data.list, function(item) {
                    $scope.comment.list.push(item);
                  });
                } else {
                  $scope.comment.list = data.list;
                }
                sp.reset({
                  pageIndex: $scope.comment.page + 1
                });
              });
          };
        });

      //登录成功的回调函数
      $rootScope.loginCallback = checkCollected;

      checkCollected();
      shoppingCount();
      clickCountCookie();

      $(window).scrollTop(0);

    }],
    tpl: tpl
  };
});
