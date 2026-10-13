## 1. Cái bẫy chết người của GameManager.Instance

Trong giai đoạn Prototype, việc truy cập nhanh `GameManager.Instance.PlayerScore` mang lại cảm giác tiện lợi. Nhưng khi quy mô dự án phình to, Singleton trở thành một "Thần linh toàn năng" (God Object) nắm giữ mọi logic, khiến việc kiểm thử Unit Test trở nên bất khả thi và Scene không thể chạy độc lập.

## 2. Event-Driven Architecture bằng ScriptableObject

Thay vì các lớp tham chiếu trực tiếp đến nhau, ta sử dụng một Asset ScriptableObject đóng vai trò như một kênh phát thanh truyền tin (Broadcaster).

```csharp
// GameEventSO.cs
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "NewGameEvent", menuName = "Events/Game Event")]
public class GameEventSO : ScriptableObject
{
    private readonly List<System.Action> listeners = new List<System.Action>();

    public void Raise()
    {
        for (int i = listeners.Count - 1; i >= 0; i--)
        {
            listeners[i]?.Invoke();
        }
    }

    public void RegisterListener(System.Action action)
    {
        if (!listeners.Contains(action)) listeners.Add(action);
    }

    public void UnregisterListener(System.Action action)
    {
        listeners.Remove(action);
    }
}
```

## 3. Lợi ích cho Đội ngũ Indie

Khi GameEvent trở thành Asset trong Project View, Designer và Sound Artist có thể tự kéo thả sự kiện để kích hoạt hiệu ứng âm thanh hoặc giao diện mà không cần lập trình viên can thiệp vào mã nguồn điều khiển nhân vật.
