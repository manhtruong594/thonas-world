## 1. Mô phỏng độ loang mực bằng Procedural Noise

Trong tranh thủy mặc, ranh giới giữa sáng và tối không hề sắc nét mà có độ loang lấm tấm do mực ngấm vào thớ giấy dó xốp. Trong Shader Graph, ta thay thế hàm Step thông thường bằng phép phối trộn giữa `Perlin Noise` và góc chiếu sáng `NdotL`.

## 2. Thuật toán viền Sobel Outline

Để tạo nét cọ viền quanh kiếm khách hoặc ngọn núi, ta lấy đạo hàm chiều sâu (Depth Normal) theo ma trận hạt nhân Sobel:

```hlsl
// SobelFilter.hlsl
void SobelDepthOutline_float(float2 UV, float Thickness, out float Outline)
{
    float2 d = float2(Thickness, Thickness) / _ScreenParams.xy;
    
    float d0 = SampleSceneDepth(UV + float2(-d.x, -d.y));
    float d1 = SampleSceneDepth(UV + float2(0, -d.y));
    float d2 = SampleSceneDepth(UV + float2(d.x, -d.y));
    float d3 = SampleSceneDepth(UV + float2(-d.x, 0));
    float d5 = SampleSceneDepth(UV + float2(d.x, 0));
    float d6 = SampleSceneDepth(UV + float2(-d.x, d.y));
    float d7 = SampleSceneDepth(UV + float2(0, d.y));
    float d8 = SampleSceneDepth(UV + float2(d.x, d.y));

    float sobelX = (d2 + 2.0 * d5 + d8) - (d0 + 2.0 * d3 + d6);
    float sobelY = (d6 + 2.0 * d7 + d8) - (d0 + 2.0 * d1 + d2);

    Outline = saturate(sqrt(sobelX * sobelX + sobelY * sobelY) * 10.0);
}
```

## 3. Tối ưu cho Mobile Hardware

Bằng cách sử dụng Custom Post-Processing Render Feature trong Universal Renderer Data thay vì nhiều Camera phụ, hiệu ứng viền cọ chỉ tiêu tốn chưa đến 0.4ms trên GPU Mali/Adreno tầm trung.
