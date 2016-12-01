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
		this.renderDOM();

		this.picViewArea = this.popupWin.find('div.lightbox-pic-view');//图片预览区域
		this.popupPic = this.popupWin.find('img.lightbox-image');//图片
		this.picCaptionArea = this.popupWin.find('div.lightbox-pic-caption');//图片描述
		this.nextBtn = this.popupWin.find('span.lightbox-next-btn');
		this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');
		this.caption = this.popupWin.find('p.lightbox-pic-desc');//图片标题
		this.currentIndex = this.popupWin.find('span.lightbox-of-index');//当前索引
		this.closeBtn = this.popupWin.find('span.lightbox-close-btn');//关闭按钮

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
			};
				//初始化弹框,把需要的参数传过去
				self.initPopup($(this));
		});

		//关闭弹出
		this.popupMask.click(function(){
			$(this).fadeOut();//关闭遮蔽层
			self.popupWin.fadeOut();//关闭弹出层
			this.clear = false;
		});
		this.closeBtn.click(function(){//注意关闭按钮控件的z-index
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			this.clear = false;
		});

		//绑定上下切换按钮 
		this.flag=true;//用于优化快速切换的bug
		//$(selector).hover(inFunction,outFunction)
		this.nextBtn.hover(function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).addClass("lightbox-next-btn-show");
			};
		},function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).removeClass("lightbox-next-btn-show");
			};
		}).click(function(e){//切换功能
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("next");//用goto方法

			};
		});

		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).addClass("lightbox-prev-btn-show");
			};
		},function(){
			if(!$(this).hasClass("disabled")&& self.groupData.length>1){
				$(this).removeClass("lightbox-prev-btn-show");
			};
		}).click(function(e){//切换功能
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			};
		});

		//绑定窗口调整事件
		var timer =null;
		this.clear = false;//用于当弹窗关闭时不执行自动适应窗口大小
		//当调整浏览器窗口的大小时，发生 resize 事件。 resize() 方法触发 resize 事件，或规定当发生 resize 事件时运行的函数。
		$(window).resize(function(){
			if(self.clear){
				window.clearTimeout(timer);
			//setTimeout() 方法用于在指定的毫秒数后调用函数或计算表达式。 setTimeout(code,millisec)
			timer = window.setTimeout(function(){
				self.loadPicSize(self.groupData[self.index].src);
			},500);
			};
			
			
		});

	};
	LightBox.prototype={
		//上下切换
		goto:function(dir){
			if(dir === "next"){
				this.index++;
				if(this.index>= this.groupData.length-1){//当图片是最后一张时
					this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
				};
				if(this.index != 0){//当图片不止一张时
					this.prevBtn.removeClass("disabled");
				}

				var src = this.groupData[this.index].src;//拿到下一张图片的src
				this.loadPicSize(src);

			}else if(dir === "prev"){
				this.index--;
				if(this.index<=0){//当图片是第一张时
					this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
				};
				if(this.index != this.groupData.length-1){//当图片不是最后一张
					this.nextBtn.removeClass("disabled");
				}

				var src = this.groupData[this.index].src;//拿到下一张图片的src
				this.loadPicSize(src);

				
			};
		},


		loadPicSize:function(sourceSrc){
			var self = this;

			//初始化一个宽高并隐藏起来 防止再次调用时直接使用了上次的宽高
			this.popupPic.css({width:"auto",height:"auto"}).hide();
			this.picCaptionArea.hide();

			this.preLoadImg(sourceSrc,function(){//用于看图片是否加载完成
				self.popupPic.attr("src",sourceSrc);//获取地址
				//保存图片大小
				var picWidth=self.popupPic.width();
				var picHeight=self.popupPic.height();
				
				//根据图片实际大小改变view的大小
				self.changePic(picWidth,picHeight);
			});
		},

		changePic:function(width,height){
			var self =this;
			//当前视口的宽高
			winWidth=$(window).width();
			winHeight=$(window).height();
			//如果图片的宽高溢出视口，就根据当前视口的宽高来设定合适的宽高
			var scale=Math.min(winWidth/(width+10),winHeight/(height+10),1);//+10是由于border 
			width=width*scale;
			height=height*scale;
			this.picViewArea.animate({
				width:width-10,
				height:height-10
			});
			this.popupWin.animate({
				width:width,
				height:height,
				marginLeft:-width/2,
				top:(winHeight-height)/2
			},function(){//过渡执行完毕后
				self.popupPic.css({//images
					width:width-10,
					height:height-10,
				}).fadeIn();
				self.picCaptionArea.fadeIn();//caption
				self.flag = true;
				self.clear = true;

			});
			//设置描述文字和当前索引
			this.caption.text(this.groupData[this.index].caption);//通过index在数组中查找对应的信息
			this.currentIndex.text("当前索引："+(this.index+1)+" of "+this.groupData.length);
		},

		preLoadImg:function(src,callback){
			var img = new Image();
			//处理浏览器兼容
			if(!! window.ActiveXObject){//IE
				img.onreadystatechange = function(){
					if(this.readyState == "complete"){//判断是否加载完成
						callback();//Callback 函数在当前动画 100% 完成之后执行。
					};
				};
			}else{
				//onload 事件会在页面或图像加载完成后立即发生。
				img.onload = function(){
					callback();
				};
			};
			img.src=src;

		},


		showMaskAndPopup:function(sourceSrc,currentId){
			var self = this;

			//隐藏内容
			this.popupPic.hide();
			this.picCaptionArea.hide();

			//淡出遮罩层
			this.popupMask.fadeIn();
			//获取当前视口大小  弹出层初始宽高设为当前视口宽高的一半
			var winWidth = $(window).width();
			var winHeight = $(window).height();
			this.picViewArea.css({
				width:winWidth/2,
				height:winHeight/2
			});
			this.popupWin.fadeIn();

			var viewHeight = winHeight/2+10;
			this.popupWin.css({
				width:winWidth/2+10,//+10 是为了保留5px border
				height:viewHeight,
				marginLeft:-(winWidth/2+10)/2,
				top:-viewHeight,
			}).animate({
				top:(winHeight-viewHeight)/2//垂直居中
			},function(){//进行回调 加载图片
				self.loadPicSize(sourceSrc);//获取图片实际大小
			});


			//根据当前点击的元素ID获取在当前组别里面的索引,来确定是否显示上下切换按钮
			this.index = this.getIndexOf(currentId);
			//如果当这个组别只有一张图片就不启用显示上下切换按钮的方法
			var groupDataLength=this.groupData.length;
			if(groupDataLength>1){
				if(this.index===0){
					//当是第一张图片时，增加clasname disabled 还使向上切换按钮不显示
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");//清除以前设置的
				}else if(this.index===groupDataLength-1){
					this.nextBtn.addClass("disabled");
					this.prevBtn.removeClass("disabled");
				}else{
					this.prevBtn.removeClass("disabled");
					this.nextBtn.removeClass("disabled");
				};
			};
		},
		//定义获取当前索引的方法
		getIndexOf:function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				index=i;
				if(this.id === currentId){
					return false;
				}
			});
			return index;
		},
		initPopup:function(currentObj){
			var self = this;
			var sourceSrc = currentObj.attr("data-source");
				currentId = currentObj.attr("data-id");
			//调用方法显示
			this.showMaskAndPopup(sourceSrc,currentId);
		},

		
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
				'<img class="lightbox-image" src="images/2-2.jpg" >'+
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