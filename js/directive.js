define(['angular','app'],function(angular,app){

	//首字母转大写
	var firstUpperCase = function(str){
	    return str.replace(/^\S/,function(s){
	    	return s.toUpperCase();
	    });
	};

	var validateRules = {
		email:function(value){
			var regexp = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
			return regexp.test(value);
		},
		url:function(value){
			var regexp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
			return regexp.test(value);
		},
		remote:function(key,value,opts){
			if(typeof opts === 'string'){
				var symbol = opts.indexOf('?') == -1 ? '?' : '&';
				opts = { method:'GET',url:opts + symbol + key + '=' + value };
			}
			else{
				opts.data || (opts.data = {});
				opts.data[key] = value;
			}
			return opts;
		},
		number:function(value){
			var regexp = /^\-?\d*$/;
			return regexp.test(value);
		},
		digits:function(value){
			var regexp = /^\+?[0-9]\d*$/;
			return regexp.test(value);
		},
		currency:function(value){
			var regexp = /^\d+\.?\d{0,2}$/;
			return regexp.test(value);
		},
		equal:function(v1,v2){
			return v1 == v2;
		},
		accept:function(v1,v2){
			var regexp = new RegExp( '\\.(' + v2.join('|') + ')$', 'gi');
			return regexp.test(v1);
		},
		tel:function(value){
			//区号+号码，区号以0开头，3位或4位，号码由7位或8位数字组成
			var regexp = /^0\d{2,3}-?\d{7,8}$/;
			return regexp.test(value);
		},
		mobile:function(value){
			//手机号由13,15,17,18和14开头，共11位
			var regexp = /^[1][35784][0-9]{9}$/;
			return regexp.test(value);
		},
		zip:function(value){
			//邮编开头不能为0，共6位
			var regexp = /^[1-9][0-9]{5}$/;
			return regexp.test(value);
		},
		qq:function(value){
			//qq号不能以0开头，只能是数字，5~15位
			var regexp = /^[1-9][0-9]{4,14}$/;
			return regexp.test(value);
		},
		username:function(value){
			//用户名大小写英文字母、数字、下划线组成，字母开头，6-12个字符
			var regexp = /^[a-zA-z]\w{5,11}$/;
			return regexp.test(value);
		},
		password:function(value){
			//密码大小写英文字母、数字、下划线组成，长度6-20个字符
			var regexp = /^\w{5,19}$/;
			return regexp.test(value);
		},
		range:function(v1,v2){
			return v1 > v2[0] && v1 < v2[1];
		},
		max:function(v1,v2){
			return v1 < v2;
		},
		min:function(v1,v2){
			return v1 > v2;
		}
	};
	
	app.directive('eehMetisMenu', ['$timeout', function ($timeout) {
	        return {
	            restrict: 'A',
	            link: function (scope, element, attributes) {
	                var menuElement = element.find('> nav > ul');
	                menuElement.addClass('metismenu');
	                var config = attributes.eehMetisMenu !== "" ? angular.fromJson(attributes.eehMetisMenu) : {};
	                $timeout(function () {
	                    menuElement.metisMenu(config);
	                });
	            }
	        };
	    }]);
	app.directive('repeatFinish',function(){
	    return {
	        link: function(scope,element,attr){
	            if(scope.$last == true){
	                scope.$eval(attr.repeatFinish);
	            }
	        }
	    };
	});

	app.directive('zoomPicture',function(){
	    return {
	        link: function(scope,element,attr){
	        	//attr.zoomPicture = {xzoom:418,yzoom:418}
	            element.jqueryzoom(scope.$eval(attr.zoomPicture));
	        }
	    };
	});

	app.directive('ngModelLimit',function($parse){
	    return {
	        link: function(scope,element,attr){

	        	//正整数（开头不能为0）
	        	var regexp = /^([1-9][0-9]*)$/;

	        	//获取最小值
	        	var min = scope.$eval(attr.modelMin);

	        	//解析属性值到一个函数中
	        	var model = $parse(attr.ngModelLimit);

	        	//调用函数获取表达式的值并赋值给文本框
				element.val(model(scope));

				//绑定键盘事件
		        element.on('keyup',function(){

		        	//获取最大值
		        	var max = scope.$eval(attr.ngDataModelMax);

		        	//文本框的值不是数字
					if(!regexp.test(element.val())){
						//更新表达式的值
						model.assign(scope,min);
						scope.$apply();

					//文本框的值大于最大值
					}else if(parseFloat(element.val()) > parseFloat(max)){
						model.assign(scope,max);
						scope.$apply();
					}else{
						model.assign(scope,element.val());
						scope.$apply();
					}

					//更新文本框的值
					element.val(model(scope));

		        });
	        }
	    };
	});


	app.directive('multiLevelSelect', function ($parse, $timeout, $window) {
		// 利用闭包，保存父级scope中的所有多级联动菜单，便于取值
		var selects = {};
		return {
			restrict: 'CA',
			scope: {
				// 用于依赖声明时指定父级标签
				name: '@name',
				// 依赖数组，逗号分割
				dependents: '@dependents',
				// 提供具体option值的函数，在父级change时被调用，允许同步/异步的返回结果
				// 无论同步还是异步，数据应该是[{text: 'text', value: 'value'},]的结构
				source: '=source',
				// 是否支持控制选项，如果是，空值的标签是什么
				empty: '@empty',
				// 用于parse解析获取model值（而非viewValue值）
				modelName: '@ngModel'
			},
			template: ''
				// 使用ng-show而非ng-if，原因上文已经提到
				+ '<option ng-show="empty" value="">{{empty}}</option>'
				// 使用朴素的ng-repeat
				+ '<option ng-repeat="item in items" value="{{item.value}}">{{item.text}}</option>',
			require: 'ngModel',
			link: function (scope, elem, attr, model) {

				var dependents = scope.dependents ? scope.dependents.split(',') : false;
				var parentScope = scope.$parent;

				scope.name = scope.name || 'multi-select-' + Math.floor(Math.random() * 900000 + 100000);

				// 将当前菜单的getValue函数封装起来，放在闭包中的selects对象中方便调用
				selects[scope.name] = {
					getValue: function () {
						return $parse(scope.modelName)(parentScope);
					}
				};

				// 保存初始值，原因上文已经提到
				var initValue = selects[scope.name].getValue();

				var inited = !initValue;

				model.$setViewValue('');

				// 父级标签变化时被调用的回调函数
				function onParentChange() {

					var values = {};

					// 获取所有依赖的菜单的当前值
					if (dependents) {
						$.each(dependents, function (index, dependent) {
							values[dependent] = selects[dependent].getValue();
						});
					}

					// 利用闭包判断io造成的异步过期
					(function (thenValues) {

						// 调用source函数，取新的option数据
						var returned = scope.source ? scope.source(values) : false;

						// 利用多层闭包，将同步结果包装为有then方法的对象
						!returned || (returned = returned.then ? returned : {
							then: (function (data) {
								return function (callback) {
									callback.call($window, data);
								};
							})(returned)
						}).then(function (items) {

							// 防止由异步造成的过期
							for (var name in thenValues) {
								if (thenValues[name] !== selects[name].getValue()) {
									return;
								}
							}

							scope.items = items;

							$timeout(function () {

								// 防止由同步（严格的说也是异步，注意事件队列）造成的过期
								if (scope.items !== items) return;

								// 如果有空值，选择空值，否则选择第一个选项
								if (scope.empty) {
									model.$setViewValue('');
								} else {
									model.$setViewValue(scope.items[0].value);
								}

								// 判断恢复初始值的条件是否成熟
								var initValueIncluded = !inited && (function () {
									for (var i = 0; i < scope.items.length; i++) {
										if (scope.items[i].value === initValue) {
											return true;
										}
									}
									return false;
								})();

								// 恢复初始值
								if (initValueIncluded) {
									inited = true;
									model.$setViewValue(initValue);
								}

								model.$render();
							});
						});
					})(values);
				}

				// 是否有依赖，如果没有，直接触发onParentChange以还原初始值
				!dependents ? onParentChange() : scope.$on('selectUpdate', function (e, data) {
					if ($.inArray(data.name, dependents) >= 0) {
						onParentChange();
					}
				});

				// 对当前值进行监听，发生变化时对其进行广播
				parentScope.$watch(scope.modelName, function (newValue, oldValue) {
					if (newValue || '' !== oldValue || '') {
						scope.$root.$broadcast('selectUpdate', {
							// 将变动的菜单的name属性广播出去，便于依赖于它的菜单进行识别
							name: scope.name
						});
					}
				});
			}
		};
	});


	angular.forEach(validateRules,function(rule,name){

		var directName = 'ng' + firstUpperCase(name);

		app.directive(directName,function($http){

			return {
				require: 'ngModel',
				link: function (scope, elem, attr, ctrl) {

					var attrVal = attr[directName];

					if(name == 'remote'){

						elem.bind('keyup', function() {

							var opts = rule(attr.name,elem.val(),scope.$eval(attrVal));

							$http(opts).
							success(function(data, status, headers, config) {
								ctrl.$setValidity('remote', angular.equals(data,'true'));
							}).
							error(function(data, status, headers, config) {
								ctrl.$setValidity('remote', false);
							});
						});

					}else{

						ctrl.$parsers.push(function(value) {
							var validity = ctrl.$isEmpty(value) || rule(value,scope.$eval(attrVal));
							ctrl.$setValidity(name, validity);
							//return validity ? value : void 0;
							return value;
						});

					}
				}
			};

		});

	});

});
