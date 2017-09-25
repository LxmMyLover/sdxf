/**
 * Created by melody on 2017/8/9.
 */
define(['angular', 'text!module/supplier/supplier_goods.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', '$cookies', '$q', '$window', '$modal', 'FileUploader', 'publicSrv', 'alertSrv', function($scope, $routeParams, $http, $cookies, $q, $window, $modal, FileUploader, publicSrv, alertSrv) {

      //angular.injector(['webapp']).get("aService").test();
      //aService.test();
      $scope.$parent.isShopUser = false;

      var suppliersId = 0;

      //获取分类列表
      $http.get('../webapi/admin/category.ashx?act=all')
        .success(function(response) {
          $scope.clist = [];
          publicSrv.bulidTree(response.all, 0, -1, $scope.clist, {
            id: 'catId',
            text: 'catName',
            pid: 'parentId'
          });
          $scope.clist2 = angular.copy($scope.clist);

          var newCat = angular.copy($scope.category);
          $scope.clist.unshift(newCat.cur1);
          $scope.clist2.unshift(newCat.cur2);
        });

      //获取品牌列表
      $http.get('../webapi/admin/brand.ashx?act=all')
        .success(function(response) {
          $scope.blist = response.all || [];

          var newBrand = angular.copy($scope.brand);
          $scope.blist.unshift(newBrand.cur);
        });

      //获取供货商列表
      $http.post('../webapi/admin/suppliers.ashx?act=all', {
          suppliersId: suppliersId
        })
        .success(function(response) {
          $scope.slist = response.all || [];

          if (suppliersId) {
            $scope.suppliers.cur = $scope.slist[0];
          } else {
            var newSuppliers = angular.copy($scope.suppliers);
            $scope.slist.unshift(newSuppliers.cur);
          }
        });

      //获取商品类型列表
      $http.get('../webapi/admin/goodsType.ashx?act=all')
        .success(function(response) {
          $scope.tlist = response.all || [];
        });

      //获取商品筛选条件
      $http.get('admin/data/goods.json')
        .success(function(response) {
          $scope.intros = response.intro;
          $scope.onsales = response.onsale;
          $scope.filters = response.filter;
          $scope.tools = response.tools;

          var newIntro = angular.copy($scope.intro),
            newOnsale = angular.copy($scope.onsale);

          $scope.intros.unshift(newIntro.cur);
          $scope.onsales.unshift(newOnsale.cur);

          $scope.filter.cur.text = $scope.filters[0].text;
          $scope.filter.cur.value = $scope.filters[0].value;
        });
      $scope.category = {
        cur1: {
          catId: 0,
          catName: '所有商品分类'
        },
        cur2: {
          catId: 0,
          catName: '转移到商品分类'
        }
      };
      $scope.brand = {
        cur: {
          brandId: 0,
          brandName: '所有品牌'
        }
      };
      $scope.suppliers = {
        cur: {
          suppliersId: 0,
          suppliersName: '所有供货商'
        }
      };
      $scope.intro = {
        cur: {
          text: '全部',
          value: ''
        }
      };
      $scope.onsale = {
        cur: {
          text: '全部',
          value: -1
        }
      };
      $scope.filter = {
        cur: {
          text: '',
          value: ''
        }
      };


      //上传文件缓存列表
      $scope.fileNameCache = [];
      $scope.thumbCache = [];
      $scope.galleryCache = [];

      $scope.currentPage = 1;
      $scope.maxSize = 5;
      $scope.itemsPerPage = 20;
      //$scope.totalItems = 2;
      $scope.checks = [];

      //全选checkbox
      $scope.checkAll = function() {
        for (var i in $scope.glist) {
          $scope.checks[i] = !$scope.all ? $scope.glist[i].goodsId.toString() : 0;
        }
      };

      //多条件搜索
      $scope.search = function() {
        var data = {
          catId: $scope.category.cur1.catId,
          brandId: $scope.brand.cur.brandId,
          suppliersId: suppliersId || $scope.suppliers.cur.suppliersId,
          intro: $scope.intro.cur.value,
          isOnSale: $scope.onsale.cur.value,
          isDelete: 0,
          pageIndex: $scope.currentPage,
          pageSize: $scope.itemsPerPage
        }
        data[$scope.filter.cur.value] = $scope.keywords || '';

        var sm = new SimpleModal({
          width: '20%',
          center: true,
          show: true,
          overlayOpacity: 0.1,
          clickBgClose: false,
          keyEsc: false,
          loading_icon: './images/loading.gif',
          skinClassName: 'loading'
        });
        sm.show({
          model: 'modal-loading'
        });

        $http.post('../webapi/admin/goods.ashx?act=list', data)
          .success(function(response) {
            $scope.glist = response.list || [];
            $scope.totalItems = response.totalItems || 0;
          })['finally'](function() {
            sm.hide();
          });
      };

      //点击分页触发的事件
      $scope.pageChanged = function() {
        $scope.search();
        //console.log('Page changed to: ' + $scope.currentPage);
      };

      //批量操作
      $scope.batchChanged = function(name, cid) {
        var gids = [];
        for (var i in $scope.checks) {
          parseInt($scope.checks[i]) && gids.push($scope.checks[i]);
        }
        if (gids.length < 1) {
          $window.alert('至少选择一项');
          return;
        }
        $http.post('../webapi/admin/goods.ashx?act=updateBatch', {
            intro: name,
            gids: gids.join(','),
            catId: cid || 0
          })
          .success(function(response) {
            $scope.checks.length = 0;
            $scope.all = false;
            $scope.search();
          });
      };

      //转移分类
      $scope.catChanged = function() {
        $scope.batchChanged('转移到分类', $scope.category.cur2.catId);
      };

      //上架开关
      $scope.toggleSale = function(item) {
        $http.post('../webapi/admin/goods.ashx?act=updateBatch', {
            intro: !item.isOnSale ? '上架' : '下架',
            gids: item.goodsId
          })
          .success(function(response) {
            item.isOnSale = !item.isOnSale;
          });
      };

      //精品开关
      $scope.toggleBest = function(item) {
        $http.post('../webapi/admin/goods.ashx?act=updateBatch', {
            intro: !item.isBest ? '精品' : '取消精品',
            gids: item.goodsId
          })
          .success(function(response) {
            item.isBest = !item.isBest;
          });
      };

      //新品开关
      $scope.toggleNew = function(item) {
        $http.post('../webapi/admin/goods.ashx?act=updateBatch', {
            intro: !item.isNew ? '新品' : '取消新品',
            gids: item.goodsId
          })
          .success(function(response) {
            item.isNew = !item.isNew;
          });
      };

      //热销开关
      $scope.toggleHot = function(item) {
        $http.post('../webapi/admin/goods.ashx?act=updateBatch', {
            intro: !item.isHot ? '热销' : '取消热销',
            gids: item.goodsId
          })
          .success(function(response) {
            item.isHot = !item.isHot;
          });
      };

      //移除
      $scope.remove = function(id) {

        var sm = new SimpleModal({
          width: 300,
          center: true,
          btn_ok: '确定',
          btn_cancel: '取消',
          callback: function() {
            sm.on('hidden', function() {

              $http.post('../webapi/admin/goods.ashx?act=updateIsDelete', {
                  goodsId: id,
                  isDelete: 1
                })
                .success(function(response) {
                  $scope.search();
                });

            }).hide();
          }
        });

        sm.show({
          model: 'modal-confirm',
          title: '确认操作',
          contents: '您确实要把该商品放入回收站吗？'
        });

      };

      //清除缓存
      $scope.clearAllCache = function() {

        $scope.fileNameCache.length && $http.post('../webapi/file.ashx?act=del', {
          files: angular.toJson($scope.fileNameCache)
        })['finally'](function() {
          $scope.fileNameCache.length =
            $scope.thumbCache.length =
            $scope.galleryCache.length = 0;
        });
      };

      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        if (response.result != undefined && response.result == "9999") {
          window.location.href = "/userlogin.aspx";
          return false;
        } else {
          $scope.$parent.setTitle();
          $scope.search();
        }
      });


      /////////////////////////////////////////////////////////////////


      //模态窗
      $scope.open = function(item) {
        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controllerAs: 'vm',
          controller: ['$modalInstance', function($modalInstance) {

            var vm = this;
            var promoteDate = new Date();

            var uploader = vm.uploader = [
              new FileUploader({
                url: '../webapi/file.ashx?act=upload&sizeLimit=300KB&fileType=jpg,gif,png,bmp',
                queueLimit: 1, //文件个数
                removeAfterUpload: true //上传后删除文件
              }),
              new FileUploader({
                url: '../webapi/file.ashx?act=upload&sizeLimit=300KB&fileType=jpg,gif,png,bmp',
                queueLimit: 10, //文件个数
                removeAfterUpload: true //上传后删除文件
              })
            ];

            uploader[0].filters.push({
              name: 'customFilter',
              fn: function(item /*{File|FileLikeObject}*/ , options) {
                return this.queue.length < 1;
              }
            });

            uploader[0].onSuccessItem = function(fileItem, response, status, headers) {

              $scope.thumbCache = response.fileInfo || [];

              if (response.msg.length) {
                alertSrv.addAlert('warning', response.msg);
              }

              if ($scope.thumbCache.length) {
                //显示缩率图
                vm.entity.goodsThumb = '/temp/' + $scope.thumbCache[0].fileName;
                //存入文件名缓存列表
                $scope.fileNameCache.push($scope.thumbCache[0].fileName);
              }
            };


            uploader[1].filters.push({
              name: 'customFilter',
              fn: function(item /*{File|FileLikeObject}*/ , options) {
                return this.queue.length < 10;
              }
            });

            uploader[1].onSuccessItem = function(fileItem, response, status, headers) {

              if (response.msg.length) {
                alertSrv.addAlert('warning', response.msg);
              }

              if (response.fileInfo.length) {

                var entity = angular.extend({}, response.fileInfo[0], {
                  desc: vm.imgDesc.shift() || ''
                });

                //存入相册信息缓存列表
                $scope.galleryCache.push({
                  thumbUrl: 'temp/' + entity.fileName,
                  imgOriginal: entity.fileName,
                  imgDesc: entity.desc
                });

                //存入文件名缓存列表
                $scope.fileNameCache.push(entity.fileName);
              }

            };

            vm._simpleConfig = {
              //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
              toolbars: [

                [
                  'undo', //撤销
                  'redo', //重做
                  'bold', //加粗
                  'indent', //首行缩进
                  'italic', //斜体
                  'underline', //下划线
                  'strikethrough', //删除线
                  'superscript', //上标
                  'subscript', //下标
                  'fontborder', //字符边框
                  'formatmatch', //格式刷
                  'blockquote', //引用
                  'horizontal', //分隔线
                  'removeformat', //清除格式
                  'time', //时间
                  'date', //日期
                  'fontfamily', //字体
                  'fontsize', //字号
                  'paragraph', //段落格式
                  //'attachment',
                  'insertimage', //多图上传
                  'edittable', //表格属性
                  'link', //超链接
                  'emotion', //表情
                  'spechars', //特殊字符
                  'insertvideo', //视频
                  'justifyleft', //居左对齐
                  'justifyright', //居右对齐
                  'justifycenter', //居中对齐
                  'justifyjustify', //两端对齐
                  'forecolor', //字体颜色
                  'backcolor', //背景色
                  'insertorderedlist', //有序列表
                  'insertunorderedlist', //无序列表
                  //'fullscreen', //全屏
                  'directionalityltr', //从左向右输入
                  'directionalityrtl', //从右向左输入
                  'rowspacingtop', //段前距
                  'rowspacingbottom', //段后距
                  'pagebreak', //分页
                  // 'imagenone', //默认
                  // 'imageleft', //左浮动
                  // 'imageright', //右浮动
                  // 'imagecenter', //居中
                  'lineheight', //行间距
                  'edittip ', //编辑提示
                  'customstyle', //自定义标题
                  'autotypeset', //自动排版
                  'touppercase', //字母大写
                  'tolowercase', //字母小写
                  'background', //背景
                  'inserttable', //插入表格
                  'drafts', // 从草稿箱加载
                ]
              ],
              //focus时自动清空初始化时的内容
              autoClearinitialContent: true,
              //关闭字数统计
              wordCount: false,
              //关闭elementPath
              elementPathEnabled: false
            };


            vm.entity = angular.extend({
              goodsId: 0,
              catId: 0,
              brandId: 0,
              suppliersId: suppliersId,
              goodsDesc: '',
              shopPrice: 0,
              userPrice: -1,
              marketPrice: 0,
              volumePrice: '',
              giveIntegral: -1,
              rankIntegral: -1,
              goodsThumb: '',
              integral: 0,
              promotePrice: 0,
              promoteStartDate: new Date(),
              promoteEndDate: promoteDate.setMonth(promoteDate.getMonth() + 1),
              goodsWeight: 0,
              goodsNumber: 0,
              warnNumber: 0,
              isOnSale: 0,
              sortOrder: 0,
              goodsType: 0,
              goodsAttr: '',
              originPlace: ''
            }, item || {});

            vm.clist = angular.copy($scope.clist);
            vm.blist = angular.copy($scope.blist);
            vm.slist = angular.copy($scope.slist);
            vm.tlist = angular.copy($scope.tlist);

            vm.clist[0].catName = '请选择...';
            vm.blist[0].brandName = '请选择...';
            if (!suppliersId) vm.slist[0].suppliersName = '不指定供货商属于本店商品';

            vm.tlist.unshift({
              catId: 0,
              catName: '请选择...'
            });

            vm.thumbUrl = publicSrv.isUrl(vm.entity.goodsThumb) ? vm.entity.goodsThumb : '';

            vm.galleryCache = $scope.galleryCache = [];
            vm.imgDesc = [];

            vm.sel = [];
            vm.all = [];
            vm.checks = {};

            vm.alerts = alertSrv.alerts = [];

            //获取商品信息
            $http.get('../webapi/admin/goods.ashx?act=entity&goodsId=' + vm.entity.goodsId)
              .success(function(data) {
                angular.extend(vm.entity, data.entity);

                vm.entity.promoteStartDate = new Date(vm.entity.promoteStartDate);
                vm.entity.promoteEndDate = new Date(vm.entity.promoteEndDate);

                //优惠价格列表
                vm.volumeList = vm.entity.volumePrice.length ?
                  vm.entity.volumePrice : [{
                    number: null,
                    price: null
                  }];

                //主动触发商品属性列表
                vm.entity.goodsType > 0 && vm.getAttr();
              });

            //获取商品相册列表
            $http.post('../webapi/admin/goodsGallery.ashx?act=list', {
                goodsId: vm.entity.goodsId
              })
              .success(function(response) {
                vm.galist = response.list || [];
              });

            //取消
            vm.cancel = function() {
              $modalInstance.dismiss('cancel');
            };

            //保存
            vm.save = function() {
              vm.button = true;
              vm.entity.promoteStartDate = vm.entity.promoteStartDate.getTime();
              vm.entity.promoteEndDate = vm.entity.promoteEndDate.getTime();
              vm.entity.goodsAttr = vm.getGoodsAttr();

              $http.post('../webapi/admin/goods.ashx?act=save', vm.entity)
                .success(function(resp) {
                  if (resp.result > 0) {

                    var deferA = $q.defer();
                    var deferB = $q.defer();

                    //上传缩略图
                    if ($scope.thumbCache.length || (vm.thumbUrl && vm.thumbUrl != vm.entity.goodsThumb)) {

                      $http.post('../webapi/admin/goods.ashx?act=upload', {
                          goodsId: vm.entity.goodsId || resp.entity.goodsId,
                          originalImg: $scope.thumbCache.length ? $scope.thumbCache[0].fileName : vm.thumbUrl
                        })
                        .success(function(resp) {
                          if (resp.result > 0)
                            deferA.resolve({
                              type: 'success',
                              msg: '缩率图上传成功'
                            });
                          else
                            deferA.resolve({
                              type: 'warning',
                              msg: resp.msg
                            });
                        })
                        .error(function(resp) {
                          deferA.reject({
                            type: 'danger',
                            msg: resp
                          });
                        });

                    } else {
                      deferA.resolve();
                    }

                    //上传相册
                    if ($scope.galleryCache.length) {

                      $http.post('../webapi/admin/goodsGallery.ashx?act=upload', {
                          goodsId: vm.entity.goodsId || resp.entity.goodsId,
                          gallery: angular.toJson($scope.galleryCache)
                        })
                        .success(function(resp) {
                          if (resp.result > 0)
                            deferB.resolve({
                              type: 'success',
                              msg: '相册上传成功'
                            });
                          else
                            deferB.resolve({
                              type: 'warning',
                              msg: resp.msg
                            });
                        })
                        .error(function(resp) {
                          deferB.reject({
                            type: 'danger',
                            msg: resp
                          });
                        });
                    } else {
                      deferB.resolve();
                    }

                    $q.all([
                        deferA.promise,
                        deferB.promise
                      ])
                      .then(function(result) {

                        var a = result[0];
                        var b = result[1];

                        a && alertSrv.addAlert(a.type, a.msg);
                        b && alertSrv.addAlert(b.type, b.msg);

                        alertSrv.addAlert('success', '保存成功', function() {
                          $modalInstance.close();
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
                  vm.button = false;
                });

            };

            //添加优惠价格
            vm.addVolume = function() {
              for (var i = 0, item; item = vm.volumeList[i++];) {
                if (item.number == null || item.price == null) {
                  $window.alert('优惠数量或优惠价格不能为空');
                  return;
                }
              };
              vm.volumeList.push({
                number: null,
                price: null
              });
            };

            //删除优惠价格
            vm.removeVolume = function(index) {
              vm.volumeList.splice(index, 1);
            };

            //计算价格
            vm.priceSetted = function() {
              vm.entity.marketPrice = publicSrv.changeTwoDecimal(vm.entity.shopPrice * 1.4);
            };

            //按市场价计算
            vm.marketPriceSetted = function() {
              vm.entity.shopPrice = publicSrv.changeTwoDecimal(vm.entity.marketPrice / 1.4);
            };

            //取整数
            vm.integralMarketPrice = function() {
              vm.entity.marketPrice = Math.round(vm.entity.marketPrice);
            };

            //初始化日期选择器
            vm.format = 'yyyy-MM-dd';
            vm.popup = {
              opened: [false, false]
            };

            vm.open = function($event, index) {
              $event.preventDefault();
              $event.stopPropagation();

              var ue = UE.getEditor('editor');

              vm.popup.opened[index] = true;
            };

            vm.getAttr = function() {
              $http.post('../webapi/admin/attribute.ashx?act=all', {
                  catId: vm.entity.goodsType
                })
                .success(function(response) {
                  vm.alist = response.all || [];
                  angular.forEach(vm.alist, function(e, i) {

                    e.attrType == 0 && (vm.sel[i] = e.goodsAttr[0].goodsAttrId);

                    angular.forEach(e.goodsAttr, function(e2) {

                      if (vm.entity.goodsAttr.indexOf('(' + e2.goodsAttrId + ')') >= 0) {
                        e.attrType == 0 && (vm.sel[i] = e2.goodsAttrId);
                        e.attrType > 0 && (vm.checks[e2.goodsAttrId] = e2.goodsAttrId);
                      } else {
                        e.attrType > 0 && (vm.checks[e2.goodsAttrId] = 0);
                      }
                    });
                  });
                });
            };

            vm.getGoodsAttr = function() {
              var goodsAttr = [];
              angular.forEach(vm.sel, function(e) {
                goodsAttr.push('(' + e + ')');
              });
              angular.forEach(vm.checks, function(value, key) {
                value && key != '' && goodsAttr.push('(' + key + ')');
              });
              return goodsAttr.join(',');
            };

            vm.checkAll = function(index, list) {
              angular.forEach(list, function(o) {
                vm.checks[o.goodsAttrId] = !vm.all[index] ? o.goodsAttrId.toString() : 0;
              });
            };

            //删除相册缓存
            vm.removeGalleryCache = function(i) {
              $scope.galleryCache.splice(i, 1);
            };

            //删除相册
            vm.removeGallery = function(i) {
              $http.post('../webapi/admin/goodsGallery.ashx?act=del', {
                  imgId: vm.galist[i].imgId
                })
                .success(function(response) {
                  response.result && vm.galist.splice(i, 1);
                });
            };

            //更新描述
            vm.updateDesc = function(i) {
              $http.post('../webapi/admin/goodsGallery.ashx?act=save', {
                imgDesc: vm.galist[i].imgDesc,
                imgId: vm.galist[i].imgId
              });
            };

            //上传
            vm.fileUpload = function() {

              vm.uploader[1].uploadAll();

              if (vm.fileUrl) {

                $scope.galleryCache.push({
                  thumbUrl: vm.fileUrl,
                  imgOriginal: vm.fileUrl
                });

                vm.fileUrl = '';
              }

            };

          }]
        });

        modalInstance.closed.then(function() {
          $scope.search();
        });

        //清除临时保存的缩率图与相册图片
        modalInstance.result.then(function() {
          $scope.clearAllCache();
        }, function() {
          $scope.clearAllCache();
        });
      };
    }],
    tpl: tpl
  };
});
