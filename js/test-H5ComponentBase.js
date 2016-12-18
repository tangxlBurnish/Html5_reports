/**
 * Created by wuyifan on 16/11/21.
 */
//基本图文组件对象

var H5ComponentBase = function( name, outerCfg ) {
    //测试,如果传入的outerCfg为空,就赋值使用空对象;
    var cfg = outerCfg||{};

    //因为作为一个base组件,需要知道是什么类型的组件,因此赋值className(class);
    var cls = "h5_component_" + cfg.type +" h5_component_name_" + name;

    //这里有很多class的组件,比如说h5_component,h5_component_base,h5_component_name
    //h5_component 这是表示一个组件,可以通过 $(this).find(".h5_component") 找到所有组件
    //h5_component_base 表示这是某个类型的图文组件 base, echarts等表示某些样式的附加
    //h5_component_name_myName 是为了pinpoint某一个组件来指定css
    var component = $( "<div class = 'h5_component " + cls + "' >" ); // id='" +id+"'


    /**
     * @aims 这个函数是把cfg配置项通过jquery渲染到css
     * @param cfg:传入的配置项
     */
    function uiRender(cfg){
        //&&相当于,如果我前面的一项成立( e,g:cfg有text属性),那么我就执行后面的操作;
        cfg.text   && component.text(cfg.text);
        cfg.width  && component.width(cfg.width);
        cfg.height && component.height(cfg.height);
        cfg.css  && component.css( cfg.css );
        cfg.bg   && component.css("backgroundImage", "url(" +cfg.bg+")");

        //设置一个组件位置居中的语法糖
        if( cfg.center === true){
            component.css({
                marginLeft : ( cfg.width/2 * -1) +"px",
                left : "50%"
            });
        }
    }

    /**
     * @aims 给component组件注册事件
     * @param component 需要注册事件的组件
     * @param cfg 需要cfg配置项的animateIn/Out的属性来控制如何添加动画监听
     */
    function eventsListen(component,cfg){
        //这里给 component 绑定两个事件,但是 base ,所以无法知晓绑定之后要做什么,所以先绑定之后就标注下class
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

    }

    uiRender(cfg);
    eventsListen(component,cfg);
    return component;
};

