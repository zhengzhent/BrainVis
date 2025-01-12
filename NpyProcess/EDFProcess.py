import mne
import matplotlib.pyplot as plt
import numpy as np

# 读取 EDF 文件
file_path = "eeg_combined_01.edf"  # 替换为你的 EDF 文件路径
raw = mne.io.read_raw_edf(file_path, preload=True)

# 打印基本信息
print(raw.info)

# 获取数据和通道名称
data, times = raw.get_data(return_times=True)  # 获取信号数据和时间轴
channel_names = raw.info['ch_names']          # 通道名称

# 检查数据范围
print("信号最大值:", data.max())
print("信号最小值:", data.min())

# 第一张图：没有偏移的波形
plt.figure(figsize=(15, 10))  # 设置第一张图的大小
for i in range(data.shape[0]):  # 遍历所有通道
    plt.plot(times, data[i], label=channel_names[i])  # 没有动态偏移

# 图形设置
plt.xlabel('Time (s)')
plt.ylabel('Amplitude (uV)')
plt.title('All EEG Channels (Without Offset)')
plt.legend(loc='upper right', fontsize='small', ncol=2)  # 添加图例
plt.grid(True)
plt.tight_layout()
plt.show()  # 显示第一张图

# 第二张图：有偏移的波形
plt.figure(figsize=(15, 10))  # 设置第二张图的大小
for i in range(data.shape[0]):  # 遍历所有通道
    plt.plot(times, data[i] + i * 0.0001, label=channel_names[i])  # 动态偏移

# 图形设置
plt.xlabel('Time (s)')
plt.ylabel('Amplitude (uV)')
plt.title('All EEG Channels (With Offset)')
plt.legend(loc='upper right', fontsize='small', ncol=2)  # 添加图例
plt.grid(True)
plt.tight_layout()
plt.show()


# 1. 时域波形可视化（展示所有通道）
raw.plot(duration=5, n_channels=len(raw.info['ch_names']))  # 显示所有通道

# 2. 频域可视化（功率谱密度图）
raw.plot_psd(fmax=100)  # 显示最高到 50 Hz 的频谱


# 3. 事件检测（生成示范性事件，每 2 秒一个事件）
events = mne.make_fixed_length_events(raw, duration=2.0)
event_id = {'Stimulus': 1}

# 生成 Epochs
epochs = mne.Epochs(raw, events, event_id, tmin=-0.2, tmax=0.5, preload=True)

# 4. 时频分析
from mne.time_frequency import tfr_multitaper
tfr = tfr_multitaper(epochs, freqs=np.arange(6, 30, 3), n_cycles=3, return_itc=False)
tfr.plot([0], baseline=(-0.2, 0), mode='zscore', title='Time-Frequency')

# 5. 事件相关电位 (ERP) 可视化
evoked = epochs.average()
evoked.plot()