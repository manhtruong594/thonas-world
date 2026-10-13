## 1. Căn nguyên chứng bệnh "GC Spikes"

Trong Unity, Garbage Collector (Boehm GC) hoạt động theo cơ chế Stop-the-world hoặc Incremental. Khi bộ nhớ đệm Managed Heap vượt ngưỡng phân bổ, hệ thống buộc phải tạm dừng luồng chính (Main Thread) để quét và thu hồi bộ nhớ. Kết quả là khung hình bị giật cục (frame drops), làm mất hoàn toàn nhịp điệu chiến đấu của người chơi.

Những kẻ thù ngầm thường gặp nhất chính là:

- Ép kiểu ngầm định (Boxing/Unboxing struct sang object).
- Sử dụng chuỗi cộng dồn `str += count` trong vòng lặp hiển thị UI.
- LINQ queries (`Where()`, `ToList()`) cấp phát IEnumerator mỗi lần duyệt.
- Khởi tạo Delegate/Lambda ẩn trong hàm gọi sự kiện.

## 2. Tuyệt kỹ Struct-Based Object Pool

Để triệu hồi hàng nghìn mũi tên, đạn pháo hoặc kiếm khí mà không sinh dù chỉ 1 byte GC, giải pháp kinh điển là kiến trúc **Object Pooling** tiền cấp phát bộ nhớ cố định ngay từ lúc nạp cảnh (Awake/Start).

```csharp
// FastProjectilePool.cs
using System.Collections.Generic;
using UnityEngine;

public class FastProjectilePool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int initialCapacity = 256;

    private readonly Queue<GameObject> poolQueue = new Queue<GameObject>(256);

    private void Awake()
    {
        for (int i = 0; i < initialCapacity; i++)
        {
            var obj = Instantiate(prefab, transform);
            obj.SetActive(false);
            poolQueue.Enqueue(obj);
        }
    }

    public GameObject Spawn(Vector3 position, Quaternion rotation)
    {
        GameObject projectile = poolQueue.Count > 0 ? poolQueue.Dequeue() : Instantiate(prefab, transform);
        projectile.transform.SetPositionAndRotation(position, rotation);
        projectile.SetActive(true);
        return projectile;
    }

    public void Despawn(GameObject obj)
    {
        obj.SetActive(false);
        poolQueue.Enqueue(obj);
    }
}
```

## 3. Kiểm chứng qua Unity Profiler

Bật tab **CPU Profiler** và lọc theo cột *GC Alloc*. Một khung hình chuẩn của game hành động lý tưởng phải có giá trị **0 B (Zero Bytes)** trong tất cả các hàm `Update()`, `FixedUpdate()` và `LateUpdate()`.
