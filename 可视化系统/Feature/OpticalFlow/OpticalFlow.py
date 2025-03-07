import cv2 
import numpy as np 
import os 
 
def compute_motion_energy(video_path, output_path):
    """
    计算视频的逐帧运动能量，并保存结果。
    
    Args:
        video_path (str): 输入视频文件路径 
        output_path (str): 输出结果保存路径（CSV 文件）
    """
    # 初始化视频捕获 
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): 
        raise ValueError("无法打开视频文件")
    
    # 视频基本信息 
    fps = cap.get(cv2.CAP_PROP_FPS) 
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) 
    print(f"视频帧率: {fps} FPS")
    print(f"总帧数: {total_frames}")
    
    # 初始化 Farneback 光流对象 
    flow = cv2.optflow.createOptFlow_Farneback() 
    flow.setUse_gpu(False)   # 启用 GPU 加速（如果支持）
    flow.setNumPyramidsToBuild(5) 
    flow.setPyrScale(0.8) 
    flow.setLevels(1) 
    flow.setWinsize(15) 
    flow.setIterations(3) 
    flow.setPolyN(5) 
    flow.setPolySigma(1.1) 
    flow.setFlags(0) 
    
    # 存储逐帧运动能量 
    motion_energies = []
    
    # 读取第一帧 
    ret, frame = cap.read() 
    if not ret:
        raise ValueError("无法读取第一帧")
    prev_frame = cv2.cvtColor(frame,  cv2.COLOR_BGR2GRAY)
    
    # 开始逐帧处理 
    for frame_idx in range(total_frames - 1):
        ret, frame = cap.read() 
        if not ret:
            break 
        
        curr_frame = cv2.cvtColor(frame,  cv2.COLOR_BGR2GRAY)
        
        # 计算光流场 
        flow_result = flow.calc(prev_frame,  curr_frame, None)
        
        # 提取水平和垂直分量 
        u = flow_result[:, :, 0]
        v = flow_result[:, :, 1]
        
        # 计算运动能量 
        motion_energy = np.sqrt(u**2  + v**2).mean()  # 使用平均值作为帧级运动能量 
        
        # 存储结果 
        motion_energies.append(motion_energy) 
        
        # 更新上一帧 
        prev_frame = curr_frame.copy() 
        
        # 显示进度 
        if frame_idx % 100 == 0:
            print(f"处理进度: {frame_idx + 1}/{total_frames - 1}")
    
    # 释放资源 
    cap.release() 
    
    # 保存结果到 CSV 文件 
    np.savetxt(output_path,  motion_energies, delimiter=',')
    print(f"结果已保存至: {output_path}")
 
# 使用示例 
if __name__ == "__main__":
    video_path = "D:\MyWork\Program\BrainVis\可视化系统\SEED-DV\Video\\1st_10min.mp4"   # 输入视频路径 
    output_path = "\MyWork\Program\BrainVis\可视化系统\SEED-DV\Video\OpticalFlow\motion_energies.csv"   # 输出结果路径 
    
    # 创建输出目录（如果不存在）
    output_dir = os.path.dirname(output_path) 
    if not os.path.exists(output_dir): 
        os.makedirs(output_dir) 
    
    compute_motion_energy(video_path, output_path)