;(function($){

	var LightBox = function(){
		//保存LightBox
		var self = this;

		//创建遮罩和弹出框
		this.popupMask=$('<div id="G-lightbox-mask">');
		this.popupWin=$('<div id="G-lightbox-popup">');
		//保存body
		this.bodyNode=$(document.body);
		//调用方法渲染剩余的dom,并插入body
		//this.renderDOM();

		//在body中进行事件委托，获取组数据
		this.groupName = null;//定义组别
		this.groupData = [];//定义数组存储同一组的数据
		//delegate() 方法为指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序，并规定当这些事件发生时运行的函数。
		//使用 delegate() 方法的事件处理程序适用于当前或未来的元素（比如由脚本创建的新元素）。
		//$(selector).delegate(childSelector,event,data,function)
		//当class=js-lightbox || 属性data-role=lightbox
		this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]","click",function(e){
			//阻止事件冒泡,防止click事件冒泡到别的事件中
			//event.stopPropagation()终止事件在传播过程的捕获、目标处理或起泡阶段进一步传播。调用该方法后，该节点上处理该事件的处理程序将被调用，事件不再被分派到其他节点。
			e.stopPropagation();

			//点击图片时，获取信息
			var currentGroupName = $(this).attr("data-group");
			//如果当前组名不相等时，重新获取
			if(currentGroupName != self.groupName){
				self.groupName = currentGroupName;
				//根据当前的组名获取同一组数据
				self.getGroup();
			}

		});


	};
	LightBox.prototype={
		
		getGroup:function(){
			var self =this;
			//根据当前的组名获取所有相同组别的对象
			var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]");
			//需要清空之前所获取的数据
			self.groupData.length=0;
			groupList.each(function(){
				self.groupData.push({
					src:$(this).attr("data-source"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				});

			});
			console.log(self.groupData);
		},
		//定义渲染剩余的dom并插入body的方法
		renderDOM:function(){

			//以String形式保存DOM
			var strDOM= '<div class="lightbox-pic-view">'+
				'<span class="lightbox-btn lightbox-prev-btn"></span>'+
				'<img class="lightbox-image" src="images/2-2.jpg" width="100%" >'+
				'<span class="lightbox-btn lightbox-next-btn"></span>'+
			'</div>'+
			'<div class="lightbox-pic-caption">'+
				'<div class="lightbox-caption-area">'+
					'<p class="lightbox-pic-desc"></p>'+
					'<span class="lightbox-of-index">当前索引：</span>'+
				'</div>'+
				'<span class="lightbox-close-btn"></span>'+
			'</div>';
			//插入到this.popupWin
			this.popupWin.html(strDOM);
			//把遮罩和弹出框插到body中
			this.bodyNode.append(this.popupMask,this.popupWin);

		},

	};
	window["LightBox"]=LightBox;
})(jQuery);