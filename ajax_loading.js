/**
 * Created by Administrator on 2015/6/5.
 * 功能: 辅助ajax请求
 * 范例：
 * -------------------------------------------------------------
 * <ul>
 *     <li data-url="sub_page1.html"></li>
 *     <li data-url="sub_page2.html"></li>
 * </ul>
 * <div id="container">
 *     <h3>子页面如下：</h3>
 *     <div id="wrapper"></div>
 * </div>
 * $('ul li').ajaxLoading('#wrapper','#container','mouseenter')
 * --------------------------------------------------------------
 * 调用方法：$('selector').ajaxLoading(target,cover,event),
 *          或$('selector').ajaxLoading(target),
 *          或$('selector').ajaxLoading(target,cover),
 *          或$('selector').ajaxLoading(target,cover,event,options)
 *          或$('selector').ajaxLoading(options),
 * 参数：target: 类型为选择器字符串或DOM元素或jQuery对象,ajax请求返回的HTML代码写入的位置,相当于$(target).html(data);
 *      cover：类型为选择器字符串或DOM元素或jQuery对象,ajax请求等待服务器返回过程中需要遮盖的区域,遮盖区域禁止操作,默认与response同值;
 *      event: 类型为选择器字符串或DOM元素或jQuery对象,触发ajax请求的事件,默认为click(form元素则默认为submit);
 *      options: 类型为对象,每个属性名和意义如下defaults变量。
 */
(function($,f){
    if ( typeof define === "function" && define.amd ) {
        define(['jquery'],f);
    }
    else if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = f($);
    }
    else{
        f($);
    }
}
})(window.jQuery,function($){
    var defaults = {
        occurEvent: 'click.default',  // 触发Ajax请求的事件,默认为click(form元素则默认为submit)
        stopPropagation: false,
        preventDefault: true,
        stopImmediatePropagation: false,
        type: 'radio',  // 如果是复选框,则type设为'checkbox',否则用默认
        cover: undefined,  // 在哪个div中显示loading状态,此div在loading时不能操作
        activeClass: 'active',  // 给触发过指定事件的元素添加类
        delay: 0,  // 事件触发后延迟Ajax请求的时间
        target: undefined,  // 服务器返回的数据将写到指定选择器的div中
        autoReset: true,  // 请求失败时是否自动恢复form数据和activeClass所在的元素
        form: undefined,  // 提交此form内的所有数据到action属性指定的url
        method: 'get', //默认用get方法,form元素或者设定form属性则使用form的method值
        data: undefined,  // 提交的数据,和form数据合并
        url: undefined,  // 请求的url,选择优先级为options.url > form.action > data-url > a.href
        success: undefined,  // 请求成功的回调函数
        error: undefined,  // 请求失败的回调函数
        beforeSend: undefined  // 请求前的处理函数,函数中return false可取消请求
    };
    $.fn['ajaxLoading'] = function(params) {
        var idDelay;
        var options = $.extend({},defaults);
        var optionsCustom = {};
        /*处理不同调用方法*/
        if(typeof params == 'string' || params instanceof $){
            var keys = ['target','cover','occurEvent'];
            $.each(arguments,function(index){
                if(index < 3){
                    var elem = this instanceof String ? this+'' : this;
                    optionsCustom[keys[index]] = elem;
                    options[keys[index]] = elem;
                }
                else{
                    $.extend(optionsCustom, this);
                    $.extend(options, this);
                    return false;
                }
            });
        }
        else{
            $.extend(optionsCustom,arguments[0]);
            $.extend(options,optionsCustom);
        }
        /*兼容以前版本*/
        optionsCustom.cover = optionsCustom.loadingContainer || optionsCustom.cover;
        optionsCustom.target = optionsCustom.responseContainer || optionsCustom.target;
        optionsCustom.autoReset = optionsCustom.autoRecover===undefined ? optionsCustom.autoReset : optionsCustom.autoRecover;
        options.cover = options.loadingContainer || options.cover;
        options.target = options.responseContainer || options.target;
        options.autoReset = options.autoRecover===undefined ? options.autoReset : options.autoRecover;
        /*特殊情况参数设置*/
        if(options.cover === undefined){//cover默认与target相同
            options.cover = options.target;
        }
        if(options.delay === true){//delay为true则表示请求延迟800ms
            options.delay = 800;
        }

        var $form = $(options.form);
        var $container = $(options.cover);
        var $target = $(options.target).addClass('ajaxLoading-target');
        var $btn = $(this);
        var $btnActive = $btn.filter((options.activeClass?('.'+options.activeClass+','):'')+'input:checked');
        var $btnActiveTmp = $btnActive;
        var cbRecover = function(){
            $btn.not($btnActive).removeClass(options.activeClass);
            $btnActive.addClass(options.activeClass);
            if($btn.not('input').length == 0){
                if ($.fn.iCheck) {
                    $btn.not($btnActive).iCheck('uncheck');
                    $btnActive.iCheck('check');
                }
                else {
                    $btn.not($btnActive).prop('checked', false);
                    $btnActive.prop('checked', true);
                }
            }
            if(typeof options.onRecover == 'function') {
                options.onRecover($btnActive);
            }
            if(typeof options.onReset == 'function') {
                options.onReset($btnActive);
            }
        };
        var fAjaxError = function() {
            $container.isLoading({
                text: "加载失败",
                position: "overlay",
                autohide: 2000,
                onAutohide: options.autoReset ? cbRecover : undefined,
                'class': 'icon-warning-sign',
                spin: false
            });
            if(typeof options.error == 'function') {
                options.error();
            }
            $target.trigger('ajaxLoading.error');
        };
        var fAjaxRequest = function($self){
            var url,data;
            /*单个元素的特殊参数设置*/
            $form = $form.length==0? $self.filter('form') : $form;// form元素不设置options.form则默认为自身
            options.method = optionsCustom.method || $form.attr('method') || options.method;
            url = $form.attr('action');
            url = options.url ? options.url : url;
            url = url || $self.data('url') || $self.attr('href');
            data = typeof options.data == 'string' ? options.data : $.param(options.data||'');
            data = data == '' ? $form.serialize() : data + '&' + $form.serialize();
            if(url !== undefined){
                $.ajax({
                    url: url,
                    data: data,
                    method: options.method,
                    beforeSend: function(xhr,settings){
                        $container.isLoading({
                            text: "点我取消",
                            position: "overlay",
                            onClickLoader: function () {
                                xhr.abort();
                                $container.isLoading('hide');
                                if(options.autoReset){
                                    cbRecover();
                                }
                            },
                            delay: 1000
                        }).data('xhr',xhr);  // 保存Ajax对象,方便取消
                        if(typeof options.beforeSend == 'function') {
                            if(options.beforeSend(xhr,settings,$self) === false){
                                return false;
                            }
                        }
                    },
                    success: function(data,textStatus,jqXHR) {
                        if(data.match('页面不存在')){
                            fAjaxError();
                            return;
                        }
                        $container.isLoading('hide');
                        $target.html(data);
                        $btnActive = $btnActiveTmp;
                        if(typeof options.success == 'function'){
                            options.success(data,textStatus,jqXHR,$self);
                        }
                        $target.trigger('ajaxLoading.success');
                    },
                    error: fAjaxError
                });
            }
            else{
                fAjaxError();
            }
        };

        return this.each(function() {
            /*单个元素的特殊参数设置*/
            var occurEvent = options.occurEvent;
            if($(this).is('form') && !optionsCustom.occurEvent){ //form的默认时间为submit
                occurEvent = 'submit';
            }
            if(options.target === undefined){
                $target = $(this).parents('.ajaxLoading-target').eq(0);
            }
            if(options.cover === undefined){
                $container = $target;
            }

            $(this).data('ajaxLoading',{}).on(occurEvent,function(event,data) {
                $(this).data('ajaxLoading').eventData = data;
                var xhr = $container.data('xhr');
                if(typeof xhr == 'object' && xhr !== null){  // 取消上一次Ajax请求
                    xhr.abort();                    $container.data('xhr',null);
                }
                var $self = $(this);
                switch (options.type){
                    case 'radio':
                        $self.addClass(options.activeClass);
                        $btn.not($self).removeClass(options.activeClass);
                        $btnActiveTmp = $self;
                        break;
                    case 'checkbox':
                        if($self.hasClass(options.activeClass)){
                            $self.removeClass(options.activeClass);
                            $btnActiveTmp = $btnActiveTmp.not($self);
                        }
                        else{
                            $self.addClass(options.activeClass);
                            $btnActiveTmp = $btnActiveTmp.add($self);
                        }
                        break;
                }
                clearTimeout(idDelay);
                if(options.delay > 0){
                    idDelay = setTimeout(function(){fAjaxRequest($self);},options.delay);
                }
                else{
                    fAjaxRequest($self);
                }
                options.stopPropagation && event.stopPropagation();
                options.stopImmediatePropagation && event.stopImmediatePropagation();
                options.preventDefault && event.preventDefault();
            });
        });
    }
    return $;
});