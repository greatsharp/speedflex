图形使用的是百度的ECharts库里的gauge仪表盘类型http://echarts.baidu.com/demo.html#gauge-car-dark,
当然使用Highcharts (http://www.highcharts.com/demo/gauge-solid) 等替代也是可以的。

这里只是列出了主要的源代码和接口API使用的xml格式
程序的主入口是speedflex.js里的initSpeedFlexTest函数，简单的调用方式如下


jQuery("#capSpeedFlex").click(function(e){
    var fn = function() {
        jQuery("#speedflex-confirm-start").on('click',function(e) {

            var obj = {
                ip : jQuery("#capSpeedFlex").attr("ip"),
                mac : jQuery("#capSpeedFlex").attr("mac"),
                name : jQuery("#capSpeedFlex").attr("name"),
                syspmtu : jQuery("#capSpeedFlex").attr("syspmtu"),
                meshType : jQuery("#capSpeedFlex").attr("meshType"),
                type : 'ap'
            };

            var fn = function() {
                var speedflex = new fnSpeedFlex();
                speedflex.initSpeedFlexTest(obj);
                jQuery("#speedflexDiv").addPopup({mask:true});
            }
            $LAB.script("/tools/speedflex.js")
                .wait(function(){
                    jQuery("#speedflexDiv").load("/tools/speedflex.jsp", fn);
            });            
        });

        jQuery("#speedflex-confirm-cancel").on('click',function(e) {
            jQuery('#speedflexDiv').removePopup(function(){jQuery('#speedflexDiv').empty();});
        });
        jQuery("#speedflexDiv").addPopup({mask:true});
    };
    jQuery("#speedflexDiv").load("/tools/speedflex_confirm.jsp", fn);
});
