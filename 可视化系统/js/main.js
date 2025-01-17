//3.初始化实例对象 echarts.init(dom容器)
var myChart = echarts.init(document.querySelector(".right-5EEG"));
//定义不同的图表类型
var option = {
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};
//5.将配置项设置给echarts实例对象，使用刚指定的配置项和数据显示图表。
myChart.setOption(option);



// 选择所有按钮
const buttons = document.querySelectorAll(".btn1, .btn2 ,.btn3,.btn4, .btn5");

// 用于存储当前选中按钮的变量
let currentButton = null;

// 遍历所有按钮并添加点击事件监听器
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // 如果当前有选中的按钮，恢复其原始颜色
        if (currentButton) {
            currentButton.style.backgroundColor = '';
        }
        // 设置当前点击的按钮为选中状态并改变颜色
        this.style.backgroundColor = 'gray';
        currentButton = this;
    });
});
