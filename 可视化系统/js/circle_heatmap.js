// 方案一：从js目录向上回溯到data目录
$.getJSON('data/5bands_3_with_opacity_converted.json', function(data) {

// 方案二：基于网站根目录的绝对路径（需本地服务器）
// $.getJSON('/data/5bands_3_with_opacity.json', function(data) {
    var chart = new G2.Chart({
        container: 'up',
        forceFit: true,
        height: document.getElementById('up').offsetHeight, // 动态获取容器高度
        padding: 40,
        animate: false // 提升渲染性能
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
        innerRadius: 0.05,
        outerRadius: 0.95
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
                return  text; // 显示为 Channel 1, Channel 2 等
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
    // 修改多边形样式配置
    chart.polygon()
        .position('channel*class')
        .color('value', '#FFFFFF-#808080-#000000')
        .tooltip('channel*class*value')
        .style({
            stroke: '#fff',
            lineWidth: 1,
            opacity: 'opacity' // 绑定透明度到数据中的opacity字段
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

    // 增加单个单元快块的高亮功能
    chart.on('polygon:mouseenter', function(ev) {
        var shape = ev.shape;
        shape.attr('fillOpacity', 0.7); // 鼠标悬停时增加透明度
    });

    chart.on('polygon:mouseleave', function(ev) {
        var shape = ev.shape;
        shape.attr('fillOpacity', 1); // 鼠标移开时恢复透明度
    });

    chart.render();

    // 过滤数据的函数
    // 恢复波段过滤功能
    window.filterData = function(band) {
        var filteredData = processedData.filter(function(item) {
            return item.class === band;
        });
        chart.changeData(filteredData);
        chart.repaint();
    };

    // 恢复 showAll 函数
    window.showAll = function() {
        chart.changeData(processedData);
    };

    // 新增通道高亮函数
    // 处理数据，保持 opacity 字段
    var processedData = [];
    data.forEach(function(item) {
        processedData.push({
            class: item.class,
            channel: item.channel,
            value: item.value,
            opacity: item.opacity // 保留 opacity 字段
        });
    });

    // 修改后的通道高亮函数
    window.highlightChannel = function(channel) {
        var filteredData = processedData.filter(function(item) {
            return item.channel === String(channel);
        });
        chart.changeData(filteredData);
        chart.repaint();
    };

    // 恢复全部数据的函数

    
    // 保持原有 showAll 函数不变
    const channelGroups = {
      '1': ['FP1', 'FPZ', 'FP2'],  
      '2': ['F7', 'F3', 'FZ','F4','F8'], 
      '3': ['T7','T8'],  
      '4': ['C3', 'CZ', 'C4'],  
      '5': ['P7', 'P3', 'PZ', 'P4', 'P8'],  
      '6': ['O1', 'OZ', 'O2'],  
      // 可以添加更多脑区映射
    };
    
    window.filterByChannelGroup = function(groupId) {
      if (groupId === 'all') {
        chart.changeData(processedData);
        return;
      }
    
      const targetChannels = channelGroups[groupId] || [];
      var filteredData = processedData.filter(function(item) {
        return targetChannels.includes(item.channel);
      });
      
      chart.changeData(filteredData);
      chart.repaint();
    };

    window.showAll = function() {
        chart.changeData(processedData);
    };
});