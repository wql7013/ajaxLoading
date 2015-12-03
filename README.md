# ajaxLoading
jquery plugin for ajax

## 范例：
```html
 <ul>
     <li data-url="sub_page1.html"></li>
     <li data-url="sub_page2.html"></li>
 </ul>
 <div id="container">
     <h3>子页面如下：</h3>
     <div id="wrapper"></div>
 </div>
 $('ul li').ajaxLoading('#wrapper','#container','mouseenter')
```
## 调用方法：
- $('selector').ajaxLoading(target,cover,event),
- $('selector').ajaxLoading(target),
- $('selector').ajaxLoading(target,cover),
- $('selector').ajaxLoading(target,cover,event,options)
- $('selector').ajaxLoading(options),
## 参数：
- target: 类型为选择器字符串或DOM元素或jQuery对象,ajax请求返回的HTML代码写入的位置,相当于$(target).html(data);
- cover：类型为选择器字符串或DOM元素或jQuery对象,ajax请求等待服务器返回过程中需要遮盖的区域,遮盖区域禁止操作,默认与response同值;
- event: 类型为选择器字符串或DOM元素或jQuery对象,触发ajax请求的事件,默认为click(form元素则默认为submit);
- options: 类型为对象,每个属性名和意义如下defaults变量。