define(['angular','app'],function(angular,app){

	app.factory('ScrollPagination',function($window,$document,$http){

		var $win = angular.element($window),
			$doc = $document;

	    var defaults = {
	    	url: null,
            postData: null,
            onError: null,
            beforeLoad: null,
            afterLoad: null,
            finished: null,
            pageIndex: 1,
            pageSize: 20,
            totalItems: 0,
            offset: 0
	    };

		var ScrollPagination = function(options){

			this.opts = angular.extend({},defaults,options);

			this.enabled = true;

        	$win.on('scroll',angular.bind(this,function(e){
				if (this.enabled)
					this.loadContent();
				else 
					e.stopPropagation();
			}));

			this.loadContent();
		};

		ScrollPagination.prototype.loadContent = function(){

			var mayLoadContent = $win.scrollTop() + this.opts.offset >= $doc.outerHeight(true) - $win.outerHeight(true);
			if (mayLoadContent){

				var url = typeof this.opts.url === 'function' ? this.opts.url(this.opts.pageIndex) : this.opts.url;

				var ajaxCallback = angular.bind(this,function(data){
					this.opts.afterLoad && this.opts.afterLoad(data,this.opts.pageIndex,this.opts.totalItems);
					//Math.ceil : 向上取整，有小数就整数部分加1
					if(this.opts.pageIndex >= Math.ceil(this.opts.totalItems / this.opts.pageSize)){
						this.opts.finished && this.opts.finished(this.opts.pageIndex,this.opts.totalItems);
					}else{
						++this.opts.pageIndex;
						this.enabled = true;
					}
				});

				if(this.opts.beforeLoad && this.opts.beforeLoad(this.opts.pageIndex,this.opts.totalItems) === false){
					return;
				}

				this.enabled = false;

				if(this.opts.postData)
					$http.post(url, this.opts.postData).success(ajaxCallback).error(this.opts.onError);
				else
					$http.get(url).success(ajaxCallback).error(this.opts.onError);
			}
	    };

	    ScrollPagination.prototype.reset = function(options,enabled){
	    	angular.extend(this.opts,options);
	    	this.enabled = !!enabled;
	    };

	    return ScrollPagination;

	});

});