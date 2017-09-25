define(['angular','app'],function(angular,app){

	app.service('publicSrv',function () {

		this.popover = {
			'title':'工作时间：9:00-17:00',
			'content':'<br>电话：18963068100'
		};

		this.order = {
			//orderStatus:['未确认','已确认','取消','无效','退货','已分单','部分分单'],
			orderStatus:['待审核','审核中','订单取消','审核完成','退货','已分单','部分分单'],
			shippingStatus:['未发货','已发货','收货确认','配货中','已发货(部分商品)','发货中'],
			payStatus:['未付款','已付款']
		};

		this.originalPath = function(path){
			return path ? path.match('/([^/]*)+')[1] : '';
		};

		this.isUrl = function(path){
			var regexp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
			return path && regexp.test(path);
		};

		//return [[item,item,item],[item,item,item],[item,item,item].....]
		this.array2Matrix = function (source,group) {
			var list = [];
	        group = group || 1;

	        for(var i=0; i<source.length; i+=group){
	            list.push(source.slice(i,i+group));
	        }
	        return list;
		};

		this.changeTwoDecimal = function (x) {
			return Math.round(x*100)/100;
		};

		this.bulidTree = function(data,id,i,arr,options){

			options = (options || {});
			var params = {
				id:options.id || 'id',
				text:options.text || 'text',
				pid:options.pid || 'pid'
			};
			//每向下一层，多一个缩入单位
        	i++;

			var tmp = [];
			angular.forEach(data,function(item){
				if(item[params.pid] == id){
					tmp.push(item);
				}
			});

			var strPading = ''; //缩入字符

        	//通过i来控制缩入字符的长度，我这里设定的是一个全角的空格
        	for (var j = 0; j < i; j++){
            	strPading += '　';
			}

			angular.forEach(tmp,angular.bind(this,function(item){
				item[params.text] = strPading + item[params.text];
				arr.push(item);
				this.bulidTree(data,item[params.id],i,arr,params);
			}));
			i--;
		};

	});


	app.service('alertSrv',function () {

		this.typeAlert = {
			'danger':'<strong></strong>',
			'success':'<strong>成功!</strong>',
			'info':'<strong>提示!</strong>',
			'warning':'<strong>警告!</strong>'
		};

		this.addAlert = function(type,msg,close){
			this.alerts.push({
				type:type,
				msg:this.typeAlert[type] + ' ' + msg,
				close:angular.bind(this,function(index){
					typeof close === 'function' && close(index);
					this.closeAlert.call(this,index);
				})
			});
		};

		this.closeAlert = function(index){
			this.alerts.splice(index,1);
		};

	});

});
