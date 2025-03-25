const mainGraphContainer = document.getElementById('mountNode');

$.getJSON('../data/5bands_3.json', function(data) {
    var chart = new G2.Chart({
        container: 'mountNode',
        forceFit: true,
        width:mainGraphContainer.clientWidth,
        height: mainGraphContainer.clientHeight,
        padding: 40
    });

    // 处理数据，将其转换为适合绘图的格式
    var processedData = [];
    data.forEach(function(item) {
        processedData.push({
            class: item.class, // 使用 class 作为时间轴
            channel: item.channel, // 使用 channel 作为周轴
            value: item.value // 使用 value 作为热力图的值
        });
    });

    chart.source(processedData);
    chart.tooltip({
        showTitle: null
    });

    // 设置极坐标
    chart.coord('polar', {
        innerRadius: 0.2,
        outerRadius: 0.8
    });

    chart.legend(false);

    // 设置坐标轴
    chart.axis('channel', {
        title: {
            text: 'Channel',
            position: 'end'
        },
        label: {
            formatter: function(text) {
                return 'Channel ' + text; // 显示为 Channel 1, Channel 2 等
            }
        }
    });
    chart.axis('class', {
        title: {
            text: 'Class',
            position: 'end'
        }
    });

    // 绘制多边形
    chart.polygon().position('channel*class').color('value', '#BAE7FF-#1890FF-#0050B3').tooltip('channel*class*value').style({
        stroke: '#fff',
        lineWidth: 1
    });

    // 添加文本标签
    var values = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'];
    values.forEach(function(val, idx) {
        chart.guide().text({
            top: true,
            position: [val, 1], // 根据 class 位置调整到最上层
            content: val,
            style: {
                fill: '#FF0000', // 更加突出的颜色
                textAlign: 'center',
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, .45)'
            }
        });
    });

    chart.render();
}); 