/**
 * log输出
 */
var log = function(obj) {
    console.log(JSON.stringify(obj));
};
function closeWin(){
    api.closeWin();
}
var Enum = {
    RechargeStatus: [{"key": "0,1,2,3", "value": "全部"}, {"key": "1", "value": "充值中"}, {"key": "2", "value": "充值成功"}, {"key": "3", "value": "充值失败"}],
    WithdrawStatus: [{"key": "0,1,2,3", "value": "全部"}, {"key": "1", "value": "提现中"}, {"key": "2", "value": "提现成功"}, {"key": "3", "value": "提现失败"}],
    IPOStatus: [{"key": "0", "value": "未完成"}, {"key": "1", "value": "已完成"}, {"key": "2", "value": "已退市"}],
    RecordType: { Recharge: 1, Withdraw: 2},
    DealType: { Buy: 0, Sell: 1},
    InvestorStatus: [{"key": "0", "value": "待审核"}, {"key": "1", "value": "审核通过"}, {"key": "2", "value": "审核拒绝"}],
    IPOPrice: 5,
};
var Tool = {
    /**
     * 打开一个新窗口
     */
    openWin: function(param) {
        api.openWin({
            name: param.name || new Date().getTime(),
            url: api.wgtRootDir + param.url,
            reload: true,
            vScrollBarEnabled: false,
            slidBackEnabled: false,
            bounces: false,
            delay : param.delay || 300,
            animation: {
                type: "movein",
                subType: "from_right",
                duration: 300
            },
            pageParam : param.param
        });
    },
    openHeader: function(param) {
    	api.openWin({
    		name : param.name || new Date().getTime(),
    		url : api.wgtRootDir + '/publicWin.html',
    		reload : true,
    		bounces : false,
    		vScrollBarEnabled : false,
    		slidBackEnabled : false,
    		delay : param.delay || 300,
    		pageParam : {
    			title : param.frame.title,
    			frameName : param.frame.name || new Date().getTime(),
    			frameUrl : param.frame.url,
    			text : param.frame.text,
    			eveObj : param.frame.eveObj,
    			param : param.frame.param || {}
    		}
    	});
    },
    confirm: function(msg, event){
        api.openFrame({
            name: 'dialog',
            url: api.wgtRootDir + '/home/dialog.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            },
            pageParam: {
                msg: msg,
                event: event
            }
        });
    },
    showOrHideFG: function(name, bool){
        api.setFrameGroupAttr({
            name: name,
            hidden: !bool
        });
    },
    showOrHideFrame: function(name, bool){
        api.setFrameAttr({
            name: name,
            hidden: !bool
        });
    },
    /**
     * 关闭当前窗口
     */
    closeWin: function() {
        api.closeWin();
    },
    /**
     * 关闭到指定 window，最上面显示的 window 到指定 name 的 window 间的所有 window 都会被关闭
     */
    closeToWin: function(name) {
        api.closeToWin({
            name: name
        });
    },
    /**
     * 监听安卓返回键,执行closeToWin
     */
    keyBackToWin: function(name) {
        api.addEventListener({
            name: 'keyback'
        }, function(ret, err) {
            Tool.closeToWin(name);
        });
    },
    /**
     * 退出App
     */
    exitApp: function(str) {
        var tip = str || '您即将退出App?';
        if (confirm(tip)) {
            api.closeWidget({
                id: api.appId,
                silent: true
            });
        }
    },
    /**
     * 判断登陆状态，进入登录界面
     */
    isLogin: function(){
        var isLogin = $api.getStorage('isLogin');
        if(isLogin === 'false'){
            api.addEventListener({
                name: 'goLogin'
            }, function(ret, err){
                Tool.openWin({
                    name: 'signIn',
                    url: '/home/signIn.html'
                });
            });
            Tool.confirm('请先登录', 'goLogin');
        }
    },
    /**
     * 验证交易密码
     */
    hasDealPwd: function(event){
        api.ajax({
            url: SERVER_PATH + 'User/checkDealPasswordIsSet',
            method: 'post',
            data: {
                values: {
                    accessToken: $api.getStorage('token'),
                    investorId: $api.getStorage('userId')
                }
            }
        }, function(ret, err) {
            var bool = false;
            if (ret && ret.code == 0) {
                bool = true;
            }
            api.sendEvent({
                name: event,
                extra: {
                    hasDealPwd: bool
                }
            });
        });
    },
    /**
     * 验证交易密码
     */
    checkDealPwd: function(event){
        api.openFrame({
            name: 'dialog',
            url: api.wgtRootDir + '/home/dialog.html',
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.winHeight
            },
            pageParam: {
                title: '输入交易密码',
                event: event,
                input: true,
                inputType: 'password',
            }
        });
    },
    /**
     * 返回当前是否联网
     */
    isOnLineStatus: function(callback) {
        var s = api.connectionType;
        s = s.toLowerCase();
        if ((s.indexOf('wifi') != -1) || (s.indexOf('3g') != -1) || (s.indexOf('4g') != -1) || (s.indexOf('2g') != -1)) {
            callback(true, s);
        } else {
            callback(false, s);
        }
    },
    /**
     * toast提示信息
     */
    toastInfo: function(msg, time, pos){
        var time = time || 1500;
        api.toast({
            msg: msg,
            duration: time,
            location: pos || 'middle'
        });
    },
    /**
     * toast提示并关闭当前窗口
     */
    toastInfoThenClose: function(msg, time, pos){
        var time = time || 1500;
        api.toast({
            msg: msg,
            duration: time,
            location: pos || 'middle'
        });
        setTimeout(function() {
    		closeWin();
    	}, (time+500));
    },
    /**
     * 加载更多
     */
    loadMore: function(fn){
        api.addEventListener({
    		name : 'scrolltobottom',
    		extra : {
    			threshold : 30
    		}
    	}, function(ret, err) {
    		fn();
    	});
    },
    /**
     * 刷新
     */
    refreshPage: function(fn){
        api.setRefreshHeaderInfo({
    		visible : true,
    		loadingImg : 'widget://image/refresh.png',
    		bgColor : '#ccc',
    		textColor : '#fff',
    		textDown : '下拉刷新...',
    		textUp : '松开刷新...',
    		showTime : true
    	}, function(ret, err) {
    		//这里写重新渲染页面的方法
    		api.refreshHeaderLoadDone();
    		fn();
    	});
    },
    sendEvent: function(event, ret, err){
        api.sendEvent({
            name: event,
            extra: {
                ret: ret,
                err: err
            }
        });
    },
    /**
     * 选择上传图片方式
     */
    getPicture: function(type, event){
        api.getPicture({
    		sourceType : type,
    		encodingType : 'png',
    		mediaValue : 'pic',
    		destinationType : 'url',
    		allowEdit : false,
            targetWidth: 750,
    		saveToPhotoAlbum : false
    	}, function(ret, err) {
            Tool.sendEvent(event, ret, err);
    	});
    },
    /**
     * 上传图片
     */
    uploadImage: function(url, file, event){
        api.showProgress();
        api.ajax({
            url : url,
            method : 'POST',
            cache : false,
            dataType : 'json',
            data : {
                files: {
                    file: file
                }
            }
        }, function(ret, err) {
            api.hideProgress();
            Tool.sendEvent(event, ret, err);
        });
    },
    /**
     * 查看图片
     */
    viewImage: function(imgArr, index){
        var imageBrowser = api.require('imageBrowser');
		imageBrowser.openImages({
			imageUrls : imgArr,
            showList: false,
            activeIndex: index
		});
    },
    /**
     * 格式化金额
     */
    formatMoney: function(money){
        money = +money;
        money = money.toFixed(2);
        money += '';
        int = money.substring(0,money.indexOf(".")).replace( /\B(?=(?:\d{3})+$)/g, ',' );//取到整数部分
        dot = money.substring(money.length,money.indexOf("."))//取到小数部分
        money = int + dot;
        return money;
    },
    /**
     * 格式化日期
     * date : new Date()
     * fmt : "yyyy-mm-dd"
     */
    formatDate: function (date, fmt){
        var o = {
            "m+" : date.getMonth() + 1, //月份
            "d+" : date.getDate(), //日
            "H+" : date.getHours(), //小时
            "i+" : date.getMinutes(), //分
            "s+" : date.getSeconds(), //秒
            "q+" : Math.floor((date.getMonth() + 3) / 3), //季度
            "S" : date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    /**
     * 排序函数 type:-1 从小到大；tyoe:1 从大到小
     */
    arrSort: function(arr, key, type){
        var _arr = [].concat(arr);
        var _type = type || -1;
        _arr.sort(function(a, b){
            if(a[key] > b[key]){
                return _type;
            }else if(a[key] < b[key]){
                return _type * -1;
            }else{
                return 0;
            }
        });
        return _arr;
    },
    imageCache: function(dataArr, str, fn){
        var _len = dataArr.length,
            i = 0;
        if(!_len) return;
        dataArr.forEach(function(item){
            api.imageCache({
                url: item[str],
            }, function(ret, err) {
                i++;
                item[str] = ret.url;
                if(_len == i){
                    fn();
                }
            });
        });
    }
};

//正则验证
/**
 * 手机号验证
 */
var isPhone = function(phone) {
    return /^((17[0-9])|(14[0-9])|(13[0-9])|(15[^4,\D])|(18[0-9]))\d{8}$/.test(phone);
};
/**
 * 邮箱验证
 */
var isEmail = function(email) {
    return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
};
/**
 * 匹配正整数
 */
var isInt = function(num) {
    return /^[1-9]\d*$/.test(num);
}
/**
 * 匹配金额
 */
var isMoney = function(text) {
    return /^[0-9]+(.[0-9]{1,2})?$/.test(text) && (text != 0);
}
/**
 * 密码验证,6~16位数字字母
 */
var isPwd = function(pwd) {
    return /^[0-9A-Za-z]{6,16}$/.test(pwd);
}
/**
 * 验证码验证,6位数字
 */
var isCaptcha = function(captcha) {
    return /^[0-9]{4}$/.test(captcha);
}
//验证身份证号
var isIdCard = function(text) {
    return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(text);
}
//验证银行卡号
var isBankCard = function(text) {
    return /^(\d{16}|\d{19})$/.test(text);
}
/**
 * K线数据处理函数
 */
function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumns = [];
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumns.push(rawData[i][4]);
    }
    return {
        categoryData: categoryData,
        values: values,
        volumns: volumns
    };
}

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(+(sum / dayCount).toFixed(3));
    }
    return result;
}
function drawKLine(myChart, rawData){
    var data = splitData(rawData);
    myChart.setOption(option = {
        backgroundColor: '#21202D',
        animation: false,
        legend: {
            show: false,
            bottom: 10,
            left: 'center',
            data: ['Dow-Jones index', 'MA5']
        },
        tooltip: {
            show: false,
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            extraCssText: 'width: 170px'
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},
            label: {
                backgroundColor: '#777'
            }
        },
        toolbox: {
            show: false,
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                brush: {
                    type: ['lineX', 'clear']
                }
            }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        grid: [
            {
                left: '5%',
                right: '10%',
                top: '5%',
                height: '70%'
            },
            {
                left: '5%',
                right: '10%',
                bottom: '5%',
                height: '12%'
            }
        ],
        xAxis: [
            {
                type: 'category',
                data: data.categoryData,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false, lineStyle: {color: '#444'}},
                splitLine: {show: false},
                axisLabel: {
                    textStyle: {
                        color: '#8392A5'
                    }
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                show: true,
                gridIndex: 1,
                data: data.categoryData,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false, lineStyle: {color: '#444'}},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    label: {
                        formatter: function (params) {
                            var seriesValue = (params.seriesData[0] || {}).value;
                            return params.value
                            + (seriesValue != null
                                ? '\n' + echarts.format.addCommas(seriesValue)
                                : ''
                            );
                        }
                    }
                }
            }
        ],
        yAxis: [
            {
                scale: true,
                position: 'right',
                axisLabel: {
                    textStyle: {
                        color: '#8392A5'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#444',
                    }
                },
                splitLine: {show: false}
            },
            {
                scale: true,
                position: 'right',
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {
                    textStyle: {
                        color: '#8392A5'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#444',
                    }
                },
                splitLine: {show: false}
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 0,
                end: 100
            },
        ],
        series: [
            {
                name: 'Dow-Jones index',
                type: 'candlestick',
                data: data.values,
                barWidth: 10,
                itemStyle: {
                    normal: {
                        color: '#FA0000',
                        color0: '#06B800',
                        borderColor: null,
                        borderColor0: null
                    }
                },
            },
            {
                name: 'MA5',
                type: 'line',
                data: calculateMA(5, data),
                smooth: true,
                lineStyle: {
                    normal: {opacity: 0.5}
                }
            },
            {
                name: '成交量',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                barWidth: 10,
                data: (function(){
                    var arr = [];
                    data.volumns.forEach(function(item, index){
                        arr.push({
                            value: item,
                            itemStyle: {
                                normal: {
                                    color: Number(data.volumns[index]) > Number(data.volumns[index-1]) ? '#FA0000' : '#06B800'
                                }
                            }
                        })
                    })
                    return arr;
                })()
            }
        ]
    }, true);
}
function handleData(data) {
    if (!data.length) return;
    var res = {
        value: [],
        date: []
    };
    data.forEach(function(item) {
        res.value.push(item.value);
        res.date.push(item.createTime);
    });
    return res;
}
function drawFSLine(myChart, data){
    var option = {
        backgroundColor: '#21202D',
        // legend: {
        //     //data: data.title
        //     show: false
        // },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                textStyle: {
                    color: '#8392A5'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#444',
                }
            },
            data: data.date,
        },
        yAxis: {
            type: 'value',
            position: 'right',
            axisLabel: {
                textStyle: {
                    color: '#8392A5'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#444',
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#444',
                }
            },
        },
        series: [{
            name: '价格',
            type: 'line',
            data: data.value
        }]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}
