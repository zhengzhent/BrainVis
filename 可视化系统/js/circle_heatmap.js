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
        innerRadius: 0.15,
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
    // 确保不显示 class 轴
    chart.axis('class', false);

    // 绘制多边形
    // 修改多边形样式配置
    chart.polygon()
        .position('channel*class')
        .color('value', '#F6FBF0-#A3DBB6-#0E6DA7-#084A8C') // 绿白 → 浅绿 → 蓝绿 → 深蓝
        .tooltip('channel*class*value')
        .style({
            stroke: '#fff',
            lineWidth: 1,
            opacity: 'opacity'
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
      'All Channels': [], // 全部通道
      'Frontal Poles': ['Fp1', 'Fpz', 'Fp2'],
      'Frontal Lobes': ['F7', 'F3', 'Fz', 'F4', 'F8'],
      'Temporal Lobes': ['T7', 'T8'],
      'Central': ['C3', 'CZ', 'C4'],
      'Parietal Lobes': ['P7', 'P3', 'Pz', 'P4', 'P8'],
      'Occipital Lobes': ['O1', 'Oz', 'O2']
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

// 添加按钮事件绑定
document.querySelectorAll('.group-button').forEach(button => {
  button.addEventListener('click', function() {
    const groupId = this.getAttribute('data-group');
    if (groupId === 'All Channels') {
      window.showAll();
    } else {
      window.filterByChannelGroup(groupId);
    }
  });
});