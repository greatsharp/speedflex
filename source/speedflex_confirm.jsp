<style type="text/css">
	#speedflex-confrim .pop_box {width:auto; color:#6e6f6f;overflow:hidden;margin:0 auto; background: #fff;padding:0px 15px;}
	#speedflex-confrim .con_760{width:auto;font-size: 14px; padding:25px 20px;overflow: hidden; line-height: 25px;}
	#speedflex-confrim .head_title h1{width:300px; float:left;font-size: 26px;font-weight: normal; color:#6e6f6f; overflow: hidden;}
</style>

<div id="speedflex-confrim">
	<div class="pop_box">
		<div class="head_title">
	        <h1><%S("UN_SpeedFlex");%></h1>
	    </div>

	    <div class="con_760">
	        <span><%S("UN_SpeedFlex_Confirm1");%></span>
	        <br/>
	        <br/>
	        <span style="color:#ef9440;"><%S("UN_Warning");%>: </span><span><%S("UN_SpeedFlex_Confirm2");%></span>
	    </div>

	    <div style="text-align:right; margin-top:25px; margin-bottom:5px;">
	        <input type="button" value="<%S('UN_Start');%>" id="speedflex-confirm-start" class="ok">
	        <input type="button" value="<%S('UN_Cancel');%>" id="speedflex-confirm-cancel" class="ok">
	    </div>
    </div>
</div>