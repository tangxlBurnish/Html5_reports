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

我们在h5对象后面函数式调用.addComponent(name,outCfg)会添加组件(图片或者echarts等)

>h5.addPage("page_1").addComponent("caption",outCfg1).addComponent("logo",outCfg2)

>

下面是方法的具体实现:

~~~
this.addComponent = function(name, outCfg){
        var cfg = outCfg || {},
            component,
            
        //因为先执行了addPage,然后从addPage的后面链式调用addComponent;
        //因此需要从缓冲栈中获取第一个page
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




##Javascript类说明:

####类继承关系:(其中[]表示可选)

h5ComponentBase --> [H5ComponentEcharts] --> h5

####设计思路:

首先h5ComponentBase是每个类的基类,然后如果是echarts组件的话,再继承了一个H5ComponentEcharts组件,最后生成一个h5的类;

~~~
//PATH:"../js/test-H5.js" 55行
//代码片段目的:给h5类加上一个.addComponent()方法.

    this.addComponent = function(name, outCfg){
        var cfg = outCfg || {},
            component,
            
        //因为先执行了addPage,然后从addPage的后面链式调用addComponent;因此需要从缓冲栈中获取第一个page
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


####h5ComponentBase
1.


##更新文档说明:
1. V0.1 使用jquery,fullpage,echarts制作的html5可视化报表;

2. V0.2 添加了高清屏幕图片适配问题;[手机端相关知识(viewport,retina问题)](http://blog.csdn.net/maxbyzhou/article/details/53243982)