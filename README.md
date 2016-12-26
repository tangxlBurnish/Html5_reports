# Html5 Reports


##h5对象说明:
h5作为主要类,其中有三个方法:

1. h5.addPage(name)
2. h5.addComponent(name,outCfg);
3. h5.loader(firstPage);

###addPage(name)方法
我们首先需要通过构造函数去得到一个h5的组件;
>h5 = new H5();

然后添加第一页;

>h5.addPage(name);

这里name会在addPage内部添加成为class,具体的实现细节是

>name && page.addClass("h5_page" + name);


下面是addPage的内部完整实现:

~~~
this.addPage = function(name){
	//这里加上一个div页面
    //这里加上'section'是为了配合fullPage语法来产生整个页面;
    var page = $("<div class = 'h5_page section'>");
	 
	//这里设置页面的名称
    name && page.addClass("h5_page" + name);
    
    //目的是为了把这个addPage的页面添加到page和body的页面后面
    //也就是加入到文档流之中.
    this.page.push(page); 
    this.el.append(page);
    
    //这是为了实现链式调用
    return this; 
};

~~~

###addComponent(name,outCfg)

我们在h5对象后面函数式调用.addComponent(name,outCfg)会添加组件(图片或者echarts等);

这个name同样会添加到这个组件的class里面,原因是因为后面可能会添加统一的样式;
比如说,这个caption就会在css定制特定的样式:

~~~
.h5_component_name_caption{
    background-image:url("../imgs/caption.png");
    font-size:26px;
    top:15%;
    color:#D9D9D9;
    text-align:center;
    line-height:1.7;
}
~~~

然后通过链式的方法调用使用就可以先添加page,再添加合适的component;

>h5.addPage("page_1").addComponent("caption",outCfg1).addComponent("logo",outCfg2)

这个outCfg是传入的配置项,会经历几个过程:

~~~
//这个过程是为了给通用的component一个base的type;
//一般来说,可以在外面传入cfg的时候指定为base的type,如果没有指定,这里会默认添加
cfg = $.extend({
        type:"base"
    },cfg);


//根据添加的属性type来改变组件的cfg特性
//其实是相当于一个类型的工厂模式
switch(cfg.type){
	//默认的一个base的类型,会继承H5ComponentBase
    case "base":
        component = new H5ComponentBase(name,cfg);
        break;
        
    //如果是echart类型组件,那么会继承H5ComponentEcharts
    //但是在H5ComponentEcharts内部也会首先继承H5ComponentBase;
    case "echart":
        component = new H5ComponentEcharts(name,cfg);
        break;
    default:
        break;
}

~~~

下面是addComponent方法的具体实现:

~~~
this.addComponent = function(name, outCfg){
        var cfg = outCfg || {},
            component,
            
        //因为先执行了addPage,然后从addPage的后面链式调用addComponent;
        //因此需要从缓冲栈中获取刚刚传入的page
        page = this.page.slice(-1)[0];

        //如果cfg里面没有type属性,那么会在后面加入type属性
        cfg = $.extend({
            type:"base"
        },cfg);
        //根据添加的属性type来改变组件的cfg特性
        switch(cfg.type){
            case "base":
                component = new H5ComponentBase(name,cfg);
                break;
            case "echart":
                component = new H5ComponentEcharts(name,cfg);
                break;
            default:
                break;
        }
        page.append(component);
        return this;
    };

~~~


所以在页面的入口我们大概的工作模式就是:

首先添加一个page,然后添加不同的component,logo,caption等,然后再添加下页重复,最后调用loader()即可;

~~~
h5 = new H5();
h5
.addPage("page_1").addComponent(name,cfg).addComponent(name,cfg)
.addPage("page_2").addComponent(name,cfg).addComponent(name,cfg)
.addPage("page_3").addComponent(name,cfg)
.addPage("page_4").addComponent(name,cfg).addComponent(name,cfg)
//这个是为了最后的显示h5,之前配置是在H5类中第16行已经hide()
//如果没有loader()这个调用不会渲染,防止渲染过程出现不同步情况
.loader() 

~~~

##Javascript类说明:

####类继承关系:(其中[]表示可选)

h5ComponentBase --> [H5ComponentEcharts] --> h5

####设计思路:

首先h5ComponentBase是每个类的基类,然后如果是echarts组件的话,再继承了一个H5ComponentEcharts组件,最后生成一个h5的类;

~~~
//PATH:"../js/test-H5.js" 55行
//代码片段目的:给h5类加上一个.addComponent()方法中继承H5ComponentBase

    this.addComponent = function(name, outCfg){
        
        .....

        //如果cfg里面没有type属性,那么会在后面加入type属性
        cfg = $.extend({
            type:"base"
        },cfg);
        //根据添加的属性type来改变组件的cfg特性
        switch(cfg.type){
            case "base":
                component = new H5ComponentBase(name,cfg);
                break;
            case "echart":
                component = new H5ComponentEcharts(name,cfg);
                break;
            default:
                break;
        }
        .....
    };

~~~


####h5ComponentBase作用

1. 注册一个component,添加一些类名称;
2. 把outCfg的有关css的样式使用jquery.css()方法渲染UI(封装成为uiRender函数);
3. 注册组件的一个onLoad事件和onLeave事件.


#####1.注册一个component,添加一些类名称;

~~~
//如果没传入cfg就注册一个新的{};
var cfg = outerCfg||{};

//把type和name写入,以后会使用
var cls = "h5_component_" + cfg.type +" h5_component_name_" + name;

//生成一个component的div,然后供后面调用
var component = $( "<div class = 'h5_component " + cls + "' >" ); 
~~~

#####2. 把outCfg的有关css的样式使用jquery.css()方法渲染UI(封装成为uiRender函数);
~~~
//&&相当于,如果我前面的一项成立( e,g:cfg有text属性),那么我就执行后面的操作;
cfg.text   && component.text(cfg.text);

//这里需要判断string的原因是可能写入width:"50%"百分比情况
//如果不是string,那么只可能是数字,那么需要获得除以二,排除出现小数;
//width和height需要对半的原因是为了retina屏幕的配置问题,看这个文档最下面的知识链接;

cfg.width  && typeof cfg.width == "string"? component.width(cfg.width):component.width(Math.ceil(cfg.width/2));

cfg.height && component.height(Math.floor(cfg.height/2));

//大部分的css除了width,height之外,还需要其它的css样式定制都在这里定制;
cfg.css  && component.css( cfg.css );

//这里来传入图片的数据
cfg.bg   && component.css("backgroundImage", "url(" +cfg.bg+")");

//这里的设置中心位置的方法值得推广:
//如果我在cfg传入了center:true,那么这里会根据type类型来判断如何实现居中
//因为普通的居中是用第一种方法,echarts的居中使用第二种

if( cfg.center === true){
	//适用一般html对象的居中
    if(cfg.type !=="echart"){
        component.css({
            marginLeft : ( cfg.width/4 * -1) +"px",
            left : "50%"
        });
        
    //这里适用canvas的居中
    }else if(cfg.type === "echart"){
        //某些echarts的图无法使用,可能需要手动定位
        //因为只能让canvas居中,但是canvas中间的图片不是居中的
        component.css({
            paddingLeft:0,
            paddingRight:0,
            marginLeft:"auto",
            marginRight:"auto",
            display:"block"
        })
    }
}
~~~

#####3. 注册组件的一个onLoad事件和onLeave事件.

~~~

//因为在cfg可以设置delay的属性,来判断多少ms之后触发onload,实现一个慢加载功能

component.on("onLoad",function(){
	setTimeout(function(){
	    $(this).addClass(cls + "_load").removeClass(cls +"_leave");
	    //animate 是Jquery的动画方法,接受参数为最后的显示结果.
	    cfg.animateIn && component.animate(cfg.animateIn);
	},cfg.delay||0);
	
	//为了防止事件的冒泡传播所导致的循环问题
	return false;
});
	component.on("onLeave",function(){
	$(this).addClass(cls + "_leave").removeClass(cls +"_load");
	cfg.animateOut && component.animate(cfg.animateOut);
	return false;
});

~~~

####echartComponent类的说明:

唯一的功能就是把cfg.echartOption属性传入echarts.init()来渲染echarts

~~~

var H5ComponentEcharts = function(name,cfg){
	//还是先继承H5ComponentBase来继承几个载入和淡出的功能;
    var component = new H5ComponentBase(name,cfg);
    
    //不一定有cfg.echartOption,所以做一个安全判断
    var option = cfg.echartOption || {};
    
    //注册cfg.echartOption到echarts
	//这个dark是echarts的主题,可以把颜色变成黑色系
    var myChart = echarts.init(component[0],"dark");
    myChart.setOption(option);

    return component;
};

~~~

##更新文档说明:
1. V0.1 使用jquery,fullpage,echarts制作的html5可视化报表;

2. V0.2 添加了高清屏幕图片适配问题;[手机端相关知识(viewport,retina问题)](http://blog.csdn.net/maxbyzhou/article/details/53243982)