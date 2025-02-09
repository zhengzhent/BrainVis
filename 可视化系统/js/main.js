// 在文件最开始添加
console.log('123 - JavaScript 文件已加载');
const chart = echarts.init(document.querySelector('.chart_5')); 
let currentData = null;
let timeIndex = 0;
let intervalId = null;
let isPlaying = true;
const numChannels = 21;
const frameInterval = 10;

// 定义21种优雅的颜色
const colors = [
    '#FF6B6B', // 玫瑰红
    '#4ECDC4', // 青色
    '#45B7D1', // 天蓝色
    '#96CEB4', // 淡绿色
    '#FFEEAD', // 淡黄色
    '#D39BCA', // 紫色
    '#8C8C8C', // 灰色
    '#FFD93D', // 柠檬黄
    '#85C1E9', // 蓝绿色
    '#9B9B9B', // 中灰
    '#E67E22', // 橙色
    '#B34747', // 深红色
    '#8E44AD', // 紫罗兰
    '#2980B9', // 深蓝色
    '#27AE60', // 深绿色
    '#F39C12', // 橙红色
    '#E74C3C', // 红色
    '#3498DB', // 蓝色
    '#1ABC9C', // 鲜绿色
    '#F1C40F', // 黄色
    '#95A5A6'  // 烟灰色
];

// 初始配置
const option = {
    title: { text: '选择频段查看数据', left: 'center' },
    tooltip: {
        trigger: 'axis',
        formatter: (params) => {
            let content = `时间: ${params[0].name}<br/>`;
            params.forEach((param)  => {
                content += `${param.seriesName}:  ${param.value}<br/>`; 
            });
            return content;
        },
    },
    grid: {
        left: '4%',
        right: '5%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
    },
    dataZoom: [
        { type: 'slider', xAxisIndex: 0, start: 0, end: 100 },
        { type: 'inside', xAxisIndex: 0 },
    ],
    xAxis: {
        type: 'category',
        name: '时间 (ms)',
        nameLocation: 'middle',     // 标题位置：'start'（左）, 'middle'（中）, 'end'（右）
        nameGap: 10,               // 标题与轴线之间的距离，可以调整这个值
        nameTextStyle: {           // 标题文字样式
            padding: [10, 0, 0, 0]  // 上右下左的内边距
        },
        data: []
    },
    yAxis: { type: 'value', name: '电压 (μV)', splitLine: { show: false } },
    series: [],
};

chart.setOption(option); 

// 加载数据并初始化图表
function loadData(band) {
    clearInterval(intervalId);
    isPlaying = false;
    timeIndex = 0;

    option.title.text = `${band} 频段脑电波`;
    option.xAxis.data = [];
    option.series = [];
    chart.clear();

    for (let i = 0; i < numChannels; i++) {
        option.series.push({
            name: `通道 ${i + 1}`,
            type: 'line',
            data: [],
            lineStyle: {
                color: colors[i],
                width: 1.5,
            },
            showSymbol: false,
            smooth: true,
        });
    }

    fetch(`data/${band}.json`)
        .then((response) => response.json())
        .then((data) => {
            currentData = data;
            chart.setOption(option);
            document.querySelectorAll('.band-btn').forEach(btn =>
                btn.classList.remove('active'));
            document.querySelector(`[data-band="${band}"]`).classList.add('active');
        })
        .catch((error) => {
            console.error('加载数据失败:', error);
            console.error(`尝试加载的文件路径: data/${band}.json`);
        });
}

// 动态更新图表
function updateChart() {
    if (!currentData || timeIndex >= currentData[0].length) return;

    if (isPlaying) {
        const timeData = Array.from({  length: currentData[0].length }, (_, i) => i);
        const nextTime = timeData[timeIndex];

        option.xAxis.data.push(nextTime); 
        for (let i = 0; i < numChannels; i++) {
            option.series[i].data.push(currentData[i][timeIndex]); 
        }

        chart.setOption(option); 
        timeIndex++;
    }
}

// 按钮事件绑定
document.querySelectorAll('.band-btn').forEach(button  => {
    button.addEventListener('click',  () => {
        loadData(button.dataset.band); 
    });
});

document.getElementById('playButton_5').addEventListener('click',  () => {
    if (!isPlaying) {
        isPlaying = true;
        intervalId = setInterval(updateChart, frameInterval);
    }
});

document.getElementById('pauseButton_5').addEventListener('click',  () => {
    isPlaying = false;
    clearInterval(intervalId);
});

// 默认加载Beta数据
loadData('Beta');