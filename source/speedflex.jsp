<script src="/scripts/gauge.js" type="text/javascript"></script>

<style type="text/css">
    #speedflex-test .pop_box {width:auto; color:#6e6f6f;overflow:hidden;margin:0 auto; background: #fff;padding:0px 15px;}
    #speedflex-test .con_760{width:auto;font-size: 14px; padding:25px 20px;overflow: hidden; line-height: 25px;}
    #speedflex-test table {width:auto;}
    #speedflex-test table tbody{background: inherit;}
    #speedflex-test .head_title h1{width:300px; float:left;font-size: 26px;font-weight: normal; color:#6e6f6f; overflow: hidden;}
    #speedflex-test .result {float:left; margin:20px; padding:10px 0px; width:120px; border:1px solid #ccc; text-align: center;}
</style>

<div id="speedflex-test">
    <div class="pop_box">
        <div class="head_title">
            <h1><%S("UN_SpeedFlex");%></h1>
        </div>

        <div class="con_760">
            <div id="speedflex-main" style="width:800px;height:180px; overflow:hidden;"></div>
            <div style="padding:0px 20px;">
                <table id="status" width="100%" align="center">
                    <tr>
                        <td><img id="srv-icon" src="/admin/images/ap-image.png" /></td>
                        <td width="100%" style="text-align:center;"><div id="progress" style="zoom:1;"></div></td>
                        <td><img id="client-icon" src="/admin/images/ap-image.png" /></td>
                    </tr>
                    <tr>
                        <td style="text-align:center;"><span id="server-name"><%S("UN_Master");%></td>
                        <td width="100%" style="text-align:center;"><div id="wait" style="color:#ef9440;"><%S("UN_SpeedFlex_Waiting");%></div></td>
                        <td style="text-align:center;"><span id="client-name"><%S("UN_Member");%></span></td>
                    </tr>
                </table>
            </div>
            
            <!-- test result -->
            <div id="speedflex-test-result">
                <div class="result">
                    <div><span><%S("UN_Downlink");%></span></div>
                    <div style="margin:10px 0px;"><span id="downlink-speed" style="font-size: 30px;">0</span><span>Mbps</span></div>
                    <div><span id="downlink-pktloss" style="font-size:10px;">pkt-loss: 0%</span></div>
                </div>
                <div class="result">
                    <div><span><%S("UN_Uplink");%></span></div>
                    <div style="margin:10px 0px;"><span id="uplink-speed" style="font-size: 30px;">0</span><span>Mbps</span></div>
                    <div><span id="uplink-pktloss" style="font-size:10px;">pkt-loss: 0%</span></div>
                </div>
            </div>
            <div id="download" style="text-align: center; display:none;">
                <div><span><%S("UN_Download_SpeedFlex");%></span></div>
                <div>
                    <a href="/tools/SpeedFlex.exe">Windows</a><br>
                    <a href="/tools/mac/SpeedFlex.zip">Mac (Intel)</a><br>
                    <a href="/tools/android/SpeedFlex.apk">Android</a>
                </div>
            </div>
        </div>

        <div style="text-align:right; margin-top:25px; margin-bottom:5px;">
            <input type="button" value="<%S('UN_SpeedFlex_TestAgain');%>" id="speedflex-test-start" class="ok">
            <input type="button" value="<%S('UN_Exit');%>" id="speedflex-test-cancel" class="ok">
        </div>
    </div>
</div>

<%
var remoteAddress = request.remoteAddress;
%>