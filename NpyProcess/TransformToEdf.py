import os
import numpy as np
import pyedflib

# 加载数据
data = np.load('sub10.npy')  # 数据形状 (7, 62, 104000)

# 将七个块的数据在时间维度上拼接
combined_data = np.hstack(data)  # 合并后形状为 (62, 728000)

# 缩放信号到微伏级
combined_data *= 1e6

# 确保目标目录存在
output_dir = r"D:\我在大图\脑电数据可视化\脑电数据处理\eeg_video"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "eeg_combined_10.edf")


with pyedflib.EdfWriter(output_file, n_channels=combined_data.shape[0]) as edf_writer:
    channel_labels = [f"Ch-{i + 1}" for i in range(combined_data.shape[0])]
    sample_frequency = 200
    # 数据会自行截断，自动保留小数
    edf_writer.setSignalHeaders([
        {
            "label": channel_labels[i],
            "dimension": "uV",
            "sample_rate": sample_frequency,
            "physical_min": combined_data.min(),
            "physical_max": combined_data.max(),
            "digital_min": -32768,
            "digital_max": 32767
        }
        for i in range(combined_data.shape[0])
    ])
    edf_writer.writeSamples(combined_data)
print(f"修正后的 EDF 文件已保存为 {output_file}")
