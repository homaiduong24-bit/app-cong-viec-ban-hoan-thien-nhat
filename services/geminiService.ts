
import { GoogleGenAI, Type } from "@google/genai";
import { Task, ChannelType, Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getDaysDiff = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const past = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - past.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

export const generateScheduleSuggestions = async (
  dateStr: string,
  existingTasks: Task[],
  products: Product[],
  userFocus: string = "",
  shift: string = "full"
): Promise<Task[]> => {
  try {
    const inventoryList = products.map(p => {
      const refDate = p.lastScheduledAt || p.createdAt;
      const daysPending = getDaysDiff(refDate);
      
      let status = "Mới";
      if (daysPending > 14) status = "CẦN XỬ LÝ GẤP (Tồn > 2 tuần)";
      else if (daysPending > 7) status = "Ưu tiên (Tồn > 1 tuần)";

      return `- ID: ${p.id} 
        | Tên: ${p.name} 
        | Kênh: ${p.channel}${p.subCategory ? ` > ${p.subCategory}` : ''}
        | Mô tả: ${p.description} 
        | Tags: ${p.tags.join(', ')}
        | Trạng thái: ${status} (Chờ ${daysPending} ngày)`;
    }).join('\n');

    let timeWindow = "00:00 đến 23:59 (Hệ 24 giờ)";
    if (shift === 'morning') timeWindow = "05:00 đến 12:00";
    if (shift === 'afternoon') timeWindow = "12:00 đến 18:00";
    if (shift === 'evening') timeWindow = "18:00 đến 02:00 (Sáng hôm sau)";

    const prompt = `
      Bạn là AI Planner chuyên nghiệp cho Content Creator. Hệ thống hoạt động trên lịch 24 GIỜ.
      
      NGỮ CẢNH:
      - Ngày: ${dateStr}.
      - Khung giờ yêu cầu: ${timeWindow}.
      - Mục tiêu của User: "${userFocus || 'Sắp xếp công việc thông minh, ưu tiên hàng tồn lâu ngày'}"
      
      KHO HÀNG (Dữ liệu đầu vào):
      ${inventoryList || "(Kho đang trống - hãy tự gợi ý các task chung về sáng tạo nội dung)"}

      NHIỆM VỤ:
      1. Phân bổ lịch trình hợp lý, không chồng chéo.
      2. Sử dụng định dạng 24h (HH:mm).
      3. **TRỌNG TÂM**: Ưu tiên sản phẩm có trạng thái "GẤP" hoặc "Chờ nhiều ngày".
      4. **LIÊN KẾT**: Phải giữ đúng 'productId' để hệ thống truy vết.
      5. **GHI CHÚ**: Notes phải cực kỳ chi tiết.

      CẤU TRÚC JSON: Array các đối tượng Task.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              title: { type: Type.STRING },
              channel: { type: Type.STRING },
              startTime: { type: Type.STRING },
              duration: { type: Type.INTEGER },
              priority: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["productId", "title", "channel", "startTime", "duration", "priority", "notes"]
          }
        }
      }
    });

    const rawTasks = JSON.parse(response.text || "[]");

    return rawTasks.map((t: any) => ({
      id: crypto.randomUUID(),
      title: t.title,
      channel: t.channel, // Không còn kiểm tra cứng, AI lấy trực tiếp từ data inventory
      date: dateStr,
      startTime: t.startTime,
      duration: t.duration,
      isCompleted: false,
      priority: (['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium'),
      notes: t.notes,
      notionSynced: false,
      productId: t.productId
    }));

  } catch (error) {
    console.error("AI Planner Error:", error);
    return [];
  }
};
