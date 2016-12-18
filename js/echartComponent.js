/**
 * Created by wuyifan on 16/12/18.
 */

var H5ComponentEcharts = function(name,cfg){
    var component = new H5ComponentBase(name,cfg);
    var option = cfg.echartOption || {};

    var myChart = echarts.init(component[0],"dark");
    myChart.setOption(option);

    return component;
};
