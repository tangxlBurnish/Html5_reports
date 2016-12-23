/**
 * Created by wuyifan on 16/11/23.
 */

/**
 * 返回一个H5对象
 * @returns {H5} H5对象,拥有addPage,addComponent的方法;
 * @constructor
 */

var H5 = function(){
    //给这对象一个ID用于辨识
    // this.id = ("h5_" + Math.random()).replace(".","_");

    //后面有一个hide的原因是可能中途加载不完全就显示了, 因此等所有的元素先hide,然后等都加载完成再显示(使用提供的loader方法)
    this.el = $("<div class='h5'>").hide();
    $("body").append(this.el);

    //每次新增的page丢在这个数组里面, 这是为了实现链式调用的中间缓冲栈,每次在addPage就丢进去,然后addComponent就拿出来;
    this.page = [];

    /**
     * 新增一个页面
     * @param {string} name 组建的名称,会加入到ClassName中
     * @param text {string} 页内的默认文本
     * @returns {H5} H5对象,可以重复适用H5对象支持的方法
     * @future: 这个函数未来的重构中要加入H5的原型中;
     */
    this.addPage = function(name, text){
        //@improve:这里我在思考这里的page需不需要加上this;我觉得不加,就是一个闭包,并不会产生一个变量;但是可能有性能的问题;

        //这里加上section名称是为了配合fullPage来产生一个可以滑动的页面;
        var page = $("<div class = 'h5_page section'>");

        name && page.addClass("h5_page" + name);
        text && page.text(text);
        
        this.page.push(page);
        this.el.append(page);
        return this;
    };
    /**
     * 新增一个组件
     * @param name {string} 组件的名称
     * @param outCfg   {object} 组件的配置文件
     * @returns {H5}
     */
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
    /**
     * H5对象初始化呈现
     * @firstPage {number} 如果添加了这个参数,那么相当于初次读取就跳转到这页
     */
    this.loader = function( firstPage ){
        this.el.fullpage({
            onLeave: function( index, nextIndex, direction){
                $(this).find(".h5_component").trigger("onLeave");
            },
            afterLoad:function( anchorLink, index){
                $(this).find(".h5_component").trigger("onLoad");
            }
        });
        this.el.show();
        // firstPage && $.fn.fullpage.moveTo( firstPage );
    };

    return this;
};


