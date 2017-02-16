var fnSpeedFlex = function() {
	this.curClient = null;
	this.curClientMac = null;

	this.wcid = null;
	this.monId = null;
	this.progress = null;
	this.link = 'downlink';
	this.maxDuration = 0;

	this.duration=30;
	this.maxRepeat=13;
	this.curIdx=0;
	this.prevIdx=-1;
	this.repeatCount=0;
	this.toRestart=false;
	this.isHost=false;
	this.type = 'ap';

	this.initSpeedFlexTest = function(params) {
		this.setTestObj(params);
		this.registerUIEvents();
		this.setEChartsConf(jQuery("#speedflex-main")[0]);

		var me = this;
		var obj = this.getTestObj();
		if(!obj.ip) {
			this.isHost = true;
			this.curClient = remoteAddress;
		} else {
			this.curClient = obj.ip;
		}
		this.type = obj.type || ''; // '' means client
		this.syspmtu = obj.syspmtu || 1500;
		this.curClientMac = obj.mac || '';

		if (this.type == 'ap') {
	        $('client-icon').src = '/admin/images/ap-image.png';
	        if(obj.meshType == 'mesh') {
				$('server-name').innerHTML = Msg.MN_RootAp;
				$('client-name').innerHTML = Msg.MN_MeshAp;
			} else if(obj.meshType == 'eMesh') {
				$('server-name').innerHTML = Msg.MN_RootAp;
				$('client-name').innerHTML = Msg.MN_LinkAp;
			}else {
				$('server-name').innerHTML = Msg.UN_Master;
				$('client-name').innerHTML = Msg.UN_Member;
			}
	    } else {
	    	$('client-icon').src = '/admin/images/speedflex-client.png';
	    	$('client-name').innerHTML = 'Client';
	    }

	    if(!this.progress) {
	    	this.progress = new Progress('progress', 120, 20);
	    }

		this.startTest();
	}

	this.registerUIEvents = function() {
		var me = this;
		jQuery("#speedflex-test-start").on('click',function(e) {
			me.clearGauge();
			me.clearTestResult();
            me.startTest();
        });
        jQuery("#speedflex-test-cancel").on('click',function(e) {
            jQuery('#speedflexDiv').removePopup(function(){jQuery('#speedflexDiv').empty();});
            clearInterval(me.timeTicket);
            me = null;
        });
	}

	this.clearGauge = function() {
		var option = this.getChartOption();
	    option.series[0].axisLine.lineStyle.color[0][0] = 0;
	  	option.series[0].data[0].value = 0;
	  	this.getMyChart().setOption(option, true);
	}

	this.clearTestResult = function() {
		H.j_setHTML('downlink-speed', 0);
       	H.j_setHTML('downlink-pktloss', 'pkt-loss: 0%');
       	H.j_setHTML('uplink-speed', 0);
       	H.j_setHTML('uplink-pktloss', 'pkt-loss: 0%');
	}

	this.startTest = function() {
		j_setEnabled(false, $('speedflex-test-start'));
		jQuery('#speedflex-test-start').removeClass('ok').addClass('cancel');

		$('wait').innerHTML = Msg.UN_SpeedFlex_Waiting;
		this.duration = 30;
		this.toRestart = false;
		this.fireWc('', this.curClient, true);
	}

	this.initParams = function() {
	    this.curIdx = 0;
	    this.prevIdx = -1;
	    this.repeatCount = 0;
	    this.hasAlert = false;
	    this.wcStarted = false;
	}
	this.fireWc = function(srvIp, client, isDownlink) {
		j_setVisible(false, $('download'));
		this.initParams();
		this.progress.setValue(0);
		this.progress.setDirection(isDownlink ? 1 : -1);

		var me = this;
	    var options;
	    if (! client) client = this.curClient;
	    this.link = isDownlink ? 'downlink' : 'uplink';
	    options = {'tool':isDownlink?'zap-down':'zap-up', 'client':client, 'zap-type':'udp',
	        fnComplete: function(response) {
	            var ok = ARF.j_getAttr(response, 'type', -1);
	            if (ok!=0) {
	                alert('Another test is in process. Please wait ' + ARF.j_getAttr(response, 'etf', 5) + ' seconds');
	                return;
	            }
	            me.wcid = ARF.j_getAttr(response, 'wcid', 0);

	            // call the updating thread
	            if (Prototype.Browser.IE) j_setVisible(true, $('progress'));	                
	            setTimeout(function() {
	            	$('wait').innerHTML = (me.link=='downlink'?Msg.UN_SpeedFlex_DownlinkTesting:Msg.UN_SpeedFlex_UplinkTesting);
	            	me.poll();
	            }, 1000);
	        }
	    };
	    if (srvIp != '') {
	        options.server = srvIp;
	    }
	    options.syspmtu = this.syspmtu;

	    new Command('zapd', 'wc', options);
	}

	this.monitorPoll = function(toSchedule) {
		// check if the data has been updated
	    // if curIdx did not change for a period of time, it is considered as Zapd down or connection broken
	    if (this.prevIdx == this.curIdx) this.repeatCount++;
	    else if (this.repeatCount != 0) this.repeatCount = 0;
	    if (this.repeatCount >= this.maxRepeat) {
	        this.toRestart = true;
	        //stop gauge
	        alert("System is not responding to the SpeedFlex request. Verify the testing device is connected, and then try again.");
	        // return gauge init state
	        if (Prototype.Browser.IE) j_setVisible(false, $('progress'));
	        this.stop();
	        return;
	    }

	    this.prevIdx = this.curIdx;
	    // schedule next monitor
	    var me = this;
	    this.monId = toSchedule ? setTimeout(function(){
	    	me.monitorPoll(true);
	    }, 1500) : null;
	}
	this.stop = function() {
		j_setEnabled(true, $('speedflex-test-start'));
		jQuery('#speedflex-test-start').removeClass('cancel').addClass('ok');
		$('wait').innerHTML = Msg.UN_SpeedFlex_Finished;
	}

	this.poll = function() {
		var me = this;
	    this.monId = setTimeout(function(){
	    	me.monitorPoll(true);
	    }, 1500);
	    
	    new Command('zapd', 'wc-poll', {'wcid': this.wcid, disableTimeout: '',
	        fnComplete: function(response) {
	            clearTimeout(me.monId);
	            var ok = ARF.j_getAttr(response, 'type', -1);
	            if (ok!=0) {
	                var msg = ARF.j_getAttr(response, 'msg', 'Unknown');

	                if (msg=='E_ClientNoZapd') {
	                	if(me.isHost) {
	                    	alert("Your computer does not have SpeedFlex running. Click the OK button, download the SpeedFlex application for your operating system, and then double-click SpeedFlex.exe to start the application. When SpeedFlex is running on your computer, click Start again to continue with the wireless performance test.");
	                	} else if (me.type == 'hop' || me.type == 'trace') {
	                        var txNode = (me.link == 'uplink')? '':me.curClient;
	                        txNode = (txNode == '')? 'Unleashed':'AP['+ txNode + ']';
	                        alert("A component required by the SpeedFlex client has not been started on "+ txNode +". " + txNode +" needs to be restarted to start the required component. Please notify your network administrator.");
	                    } else {
	                		alert("The client["+me.curClient+"] does not have SpeedFlex running. Click the OK button, download the SpeedFlex application for the client's operating system, and then send it to the wireless client user for installation. Instruct the user to double-click SpeedFlex.exe to start the application. After SpeedFlex is installed and running on the client, run the SpeedFlex test again from the Unleashed Web interface.");
	                	}
	                	if (me.type != 'hop' && me.type !='trace') {
                        j_setVisible(true, $('download'));
                        me.stop();
                    }
	                }
	                else if (msg=='E_ServerNoZapd') {
	                    alert("The system does not have SpeedFlex running. Click the OK button, download the SpeedFlex application for your operating system, and then double-click SpeedFlex.exe to start the application. When SpeedFlex is running on your computer, click Start again to continue with the wireless performance test.");	                }
	                else if (msg=='E_CygwinNoZapd') {
	                    me.test();
	                }
	                else if (msg=='E_ClientRspSlow') {
	                    alert("The connection to SpeedFlex client is slow. System cannot get any response from SpeedFlex client. Please notify your network administrator.");
	                }
	                else if (msg=='E_OtherZapdIssue') {
	                    alert("System is not responding to the SpeedFlex request. Please restart the testing AP, and then try again.");
	                }
	                return;
	            }
	            else if (ARF.j_getAttr(response, 'etf', 0)==0) {
	                if (me.toRestart == true) return;
	                me.curIdx = parseInt(ARF.j_getAttr(response, 'id', -1));
	                // done
	                var downlink = ARF.j_getAttr(response, 'downlink', -1);
	                var pktloss = ARF.j_getAttr(response, 'pkt-loss', -1);
	                if (downlink >= 0) {
	                   	var speed = (downlink/1000).toFixed(0);	//transfer from 'K' to 'M'
	                   	var option = me.getChartOption(speed > 200 ? false : true);
					    option.series[0].axisLine.lineStyle.color[0][0] = me.getGaugeValue(speed);
					  	option.series[0].data[0].value = speed;
					  	me.getMyChart().setOption(option, true);
					  	
	                   	H.j_setHTML(me.link + '-speed', speed);
	                   	H.j_setHTML(me.link + '-pktloss', 'pkt-loss: ' + pktloss + '%');
	                }
	                me.progress.setValue(100);
	                // check if there is uplink needed to do
	                if (me.link == 'downlink') {	                    
	                    setTimeout(function() {
	                    	$('wait').innerHTML = Msg.UN_SpeedFlex_Waiting;
	                    	me.clearGauge();
	                    	me.fireWc('',me.curClient);
	                    }, 4000);
	                }
	                else {
	                    var downResult = '', upResult = '', option;
	                    if (me.type != '') { // type == 'trace' || type == 'ap' || type == 'hop'
	                        downResult = $('downlink-speed').innerHTML + ', ' + $('downlink-pktloss').innerHTML.substr(10) + ' loss'; 
	                        upResult = $('uplink-speed').innerHTML + ', ' + $('uplink-pktloss').innerHTML.substr(10) + ' loss'; 
	                        option = {'client':me.curClient, 'clntmac':me.curClientMac, 'clntdesc':'', 'clntname':'', 'model':me.type, 
	                                  'downlink':downResult, 'uplink':upResult};
	                        option.syspmtu = me.syspmtu;
	                        new Command('zapd', 'wc-end', option);
	                    }
	                    //stop test
						me.stop();
	                }
	                return;
	            }
	            else {
	                if (me.toRestart == true) return;

	                // update current frame index
	                me.curIdx = parseInt(ARF.j_getAttr(response, 'id', -1));
	                // it may take more than 3 seconds before zapd starts to collect data
	                // wcStarted flag will help to mark starting point
	                if (me.wcStarted == false && me.curIdx >= 0) {
	                    me.wcStarted = true;
	                }  
	                // check the wc_out.txt is update.
	                if (me.wcStarted) // we checked it only when wc is started
	                    me.monitorPoll(false);

	                // set the gauge value
	                var downlink = ARF.j_getAttr(response, 'downlink', -1);
	                var pktloss = ARF.j_getAttr(response, 'pkt-loss', -1);
	                if (downlink >= 0) {
	                   	var speed = (downlink/1000).toFixed(0);	//transfer from 'K' to 'M'
	                   	var option = me.getChartOption(speed > 200 ? false : true);
					    option.series[0].axisLine.lineStyle.color[0][0] = me.getGaugeValue(speed);
					  	option.series[0].data[0].value = speed;
					  	me.getMyChart().setOption(option, true);
					  	
	                   	H.j_setHTML(me.link + '-speed', speed);
	                   	H.j_setHTML(me.link + '-pktloss', 'pkt-loss: ' + pktloss + '%');
	               	}
	               	var etf = parseInt(ARF.j_getAttr(response, 'etf', 0));
	               	if (me.maxDuration == 0) {
	                   	me.maxDuration = etf + 1;
	               	}
	               	me.progress.setValue((me.maxDuration-etf) * 100 / me.maxDuration);
	               	setTimeout(function() {
	               		me.poll();
	               	}, 1000);
	           }
	       }
	    });
	}

	this.getGaugeValue = function(v) {
		if(v>1000) {	//large than 1G
			return 0.99;
		}
		if(v > 200) {	//use 0~1000 scale
			return v/1000 - 0;
		} else {	//use 0~200 scale
			return v = v/200 - 0;
		}
	}

	this.test = function() {
		j_setEnabled(false, $('speedflex-test-start'));
		jQuery('#speedflex-test-start').removeClass('ok').addClass('cancel');
	    this.duration = 10;
	    this.fireWc('', 'localhost', this.link=='downlink');
	}
	this.setTestObj = function(obj) {
		this.testObj = obj;
	}
	this.getTestObj = function() {
		return this.testObj;
	}
	this.setMyChart = function(myChart) {
		this.myChart = myChart;
	}
	this.getMyChart = function() {
		return this.myChart;
	}
	this.setEChartsConf = function(divId) {
		require.config({
            paths: {
                echarts: 'lib/echarts',
                'echarts/chart/gauge':  'lib/chart/gauge',
            }
        });

        var me = this;
		require([
            'echarts',
            'echarts/chart/gauge'
        ],
        function (ec) {
        	var myChart = ec.init(divId);
        	me.setMyChart(myChart);
        	myChart.setOption(me.getChartOption());
        });
	}

	this.getChartOption = function(isNetworkSlow) {
		var axisLabel = {
            show: true,
            formatter: function(v){
                switch (v+''){
                	case '0': return '0M'; 
                    case '200': return '200M';
                    case '400': return '400M';
                    case '600': return '600M';
                    case '800': return '800M';
                    case '1000': return '1G';
                    default: return '';
                }
            },
            textStyle: {
                color: '#333'
            }
        };

        if(isNetworkSlow) {
        	axisLabel = {
	            show: true,
	            formatter: function(v){
	                switch (v+''){
	                	case '0': return '0M';
	                    case '40': return '40M';
	                    case '80': return '80M';
	                    case '120': return '120M';
	                    case '160': return '160M';
	                    case '200': return '200M';
	                    default: return '';
	                }
	            },
	            textStyle: {
	                color: '#333'
	            }
	        };
        }

		return {
		    tooltip : {
		        formatter: "{a} <br/>{b} : {c}%"
		    },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    series : [
		        {
		            name:'SpeedFlex',
		            type:'gauge',
		            center : ['20%', '80%'],    //
		            radius : [0, '140%'],
		            startAngle: 180,
		            endAngle : 0,
		            min: 0,                     //
		            max: isNetworkSlow ? 200: 1000,	//if network speed very slow, minimize the gauge scale
		            precision: 0,               //
		            splitNumber: 10,             //
		            axisLine: {            //
		                show: true,        //
		                lineStyle: {       //
		                    color: [[0.0, '#5598d8'],[1, '#e0e0e0']], 
		                    width: 30
		                }
		            },
		            axisTick: {            //
		                show: false,        //
		                splitNumber: 5,    //
		                length :5,         //
		                lineStyle: {       //
		                    color: '#fff',
		                    width: 1,
		                    type: 'solid'
		                }
		            },
		            axisLabel: axisLabel,
		            splitLine: {           //
		                show: false,        //
		                length :30,         //
		                lineStyle: {       //
		                    color: '#eee',
		                    width: 2,
		                    type: 'solid'
		                }
		            },
		            pointer : {
		                show : false,
		                length : '80%',
		                width : 8,
		                color : 'auto'
		            },
		            title : {
		                show : true,
		                offsetCenter: ['-65%', -10],       //
		                textStyle: {       //
		                    color: '#333',
		                    fontSize : 15
		                }
		            },
		            detail : {
		                show : true,
		                backgroundColor: 'rgba(0,0,0,0)',
		                borderWidth: 0,
		                borderColor: '#ccc',
		                width: 100,
		                height: 40,
		                offsetCenter: [0, -30],       //
		                formatter:'{value}\nMbps',
		                textStyle: {       //
		                    color: '#5598d8',
		                    fontSize : 20
		                }
		            },
		            data:[{value: '0', name: ''}]
		        }
		    ]
		};
	}

}