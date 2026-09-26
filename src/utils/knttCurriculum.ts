/**
 * knttCurriculum.ts
 * Chương trình môn Địa lí 12 – Bộ sách "Kết nối tri thức với cuộc sống"
 * Nhà xuất bản Giáo dục Việt Nam (NXBGDVN) – Chuẩn Chương trình GDPT 2018
 */

import { Question } from '../types';

export interface KnttPart {
  id: string;
  title: string;
  description: string;
  lessons: string[];
}

export const KNTT_PARTS: KnttPart[] = [
  {
    id: 'part_1',
    title: 'Phần 1: Địa lí tự nhiên',
    description: 'Vị trí địa lí, phạm vi lãnh thổ, thiên nhiên nhiệt đới ẩm gió mùa, sự phân hóa tự nhiên và bảo vệ môi trường',
    lessons: [
      'Bài 1: Vị trí địa lí và phạm vi lãnh thổ',
      'Bài 2: Thiên nhiên nhiệt đới ẩm gió mùa',
      'Bài 3: Sự phân hoá đa dạng của thiên nhiên',
      'Bài 4: Thực hành: Viết báo cáo về sự phân hóa tự nhiên Việt Nam',
      'Bài 5: Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường',
      'Bài 6: Thực hành: Tuyên truyền sử dụng hợp lí tài nguyên thiên nhiên hoặc bảo vệ môi trường ở địa phương',
    ]
  },
  {
    id: 'part_2',
    title: 'Phần 2: Địa lí dân cư',
    description: 'Quy mô, cơ cấu dân số, lao động và việc làm, quá trình đô thị hóa',
    lessons: [
      'Bài 7: Dân số Việt Nam',
      'Bài 8: Lao động và việc làm',
      'Bài 9: Đô thị hoá',
      'Bài 10: Thực hành: Viết báo cáo về một chủ đề dân cư ở Việt Nam',
    ]
  },
  {
    id: 'part_3',
    title: 'Phần 3: Địa lí các ngành kinh tế',
    description: 'Chuyển dịch cơ cấu kinh tế, nông nghiệp, lâm nghiệp, thủy sản, công nghiệp và các ngành dịch vụ',
    lessons: [
      'Bài 11: Chuyển dịch cơ cấu kinh tế',
      'Bài 12: Vấn đề phát triển ngành nông nghiệp',
      'Bài 13: Vấn đề phát triển ngành lâm nghiệp và thuỷ sản',
      'Bài 14: Tổ chức lãnh thổ nông nghiệp',
      'Bài 15: Thực hành: Tìm hiểu vai trò, tình hình phát triển và chuyển dịch cơ cấu ngành nông nghiệp, lâm nghiệp và thuỷ sản',
      'Bài 16: Chuyển dịch cơ cấu ngành công nghiệp',
      'Bài 17: Một số ngành công nghiệp',
      'Bài 18: Một số hình thức tổ chức lãnh thổ công nghiệp',
      'Bài 19: Thực hành: Vẽ biểu đồ, nhận xét và giải thích tình hình phát triển ngành công nghiệp',
      'Bài 20: Vai trò, các nhân tố ảnh hưởng đến sự phát triển và phân bố các ngành dịch vụ',
      'Bài 21: Giao thông vận tải và bưu chính viễn thông',
      'Bài 22: Thương mại và du lịch',
      'Bài 23: Thực hành: Tìm hiểu sự phát triển một số ngành dịch vụ',
    ]
  },
  {
    id: 'part_4',
    title: 'Phần 4: Địa lí các vùng kinh tế - xã hội',
    description: 'Khai thác thế mạnh và phát triển kinh tế - xã hội các vùng, kinh tế biển, đảo và an ninh quốc phòng',
    lessons: [
      'Bài 24: Khai thác thế mạnh ở Trung du và miền núi Bắc Bộ',
      'Bài 25: Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng',
      'Bài 26: Thực hành: Tìm hiểu vấn đề phát triển kinh tế biển ở Đồng bằng sông Hồng',
      'Bài 27: Phát triển kinh tế - xã hội ở Bắc Trung Bộ',
      'Bài 28: Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)',
      'Bài 29: Thực hành: Phân tích ý nghĩa của phát triển kinh tế - xã hội đối với quốc phòng, an ninh ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)',
      'Bài 30: Phát triển kinh tế - xã hội ở Đông Nam Bộ',
      'Bài 31: Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long',
      'Bài 32: Thực hành: Viết báo cáo về biến đổi khí hậu ở Đồng bằng sông Cửu Long',
      'Bài 33: Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo',
      'Bài 34: Thực hành: Viết báo cáo tuyên truyền về bảo vệ chủ quyền biển, đảo của Việt Nam',
    ]
  },
  {
    id: 'part_5',
    title: 'Phần 5: Địa lí địa phương & Bổ trợ ôn thi',
    description: 'Địa lí địa phương và chuyên đề khu vực Đông Nam Á (Lớp 11 KNTT)',
    lessons: [
      'Bài 35: Thực hành: Tìm hiểu địa lí địa phương',
      'Khu vực Đông Nam Á (Địa lí 11 - Kết nối tri thức)',
    ]
  }
];

// Toàn bộ 35 bài học chuẩn SGK Địa lí 12 KNTT + Đông Nam Á
export const KNTT_LESSONS: string[] = KNTT_PARTS.flatMap(p => p.lessons);

// 5 Chủ đề chuẩn KNTT
export const KNTT_TOPICS: string[] = [
  'Địa lí tự nhiên',
  'Địa lí dân cư',
  'Địa lí các ngành kinh tế',
  'Địa lí các vùng kinh tế - xã hội',
  'Khu vực Đông Nam Á (Lớp 11)'
];

/**
 * Chuẩn hóa câu hỏi sang bài học và chủ đề chuẩn SGK Kết nối tri thức với cuộc sống
 */
export function remapQuestionToKNTT(q: Question): { lesson: string; topic: string } {
  const qText = (q.text || '').toLowerCase();
  const qContext = (q.context || '').toLowerCase();
  const oldLesson = q.lesson || '';
  const oldTopic = q.topic || '';

  // 1. Đông Nam Á (Lớp 11)
  if (
    oldTopic.includes('Đông Nam Á') ||
    oldLesson.includes('Đông Nam Á') ||
    qText.includes('đông nam á') ||
    qText.includes('asean') ||
    qContext.includes('đông nam á')
  ) {
    return {
      topic: 'Khu vực Đông Nam Á (Lớp 11)',
      lesson: 'Khu vực Đông Nam Á (Địa lí 11 - Kết nối tri thức)'
    };
  }

  // 2. Vùng kinh tế - xã hội
  if (
    oldLesson.includes('Đồng bằng sông Cửu Long') ||
    qText.includes('đồng bằng sông cửu long') ||
    qText.includes('đbscl') ||
    qContext.includes('đồng bằng sông cửu long')
  ) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 31: Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long'
    };
  }

  if (oldLesson.includes('Đông Nam Bộ') || qText.includes('đông nam bộ') || qContext.includes('đông nam bộ')) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 30: Phát triển kinh tế - xã hội ở Đông Nam Bộ'
    };
  }

  if (
    oldLesson.includes('Tây Nguyên') ||
    oldLesson.includes('Nam Trung Bộ') ||
    qText.includes('tây nguyên') ||
    qText.includes('duyên hải nam trung bộ') ||
    qText.includes('nam trung bộ')
  ) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 28: Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)'
    };
  }

  if (oldLesson.includes('Bắc Trung Bộ') || qText.includes('bắc trung bộ')) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 27: Phát triển kinh tế - xã hội ở Bắc Trung Bộ'
    };
  }

  if (
    oldLesson.includes('Đồng bằng sông Hồng') ||
    qText.includes('đồng bằng sông hồng') ||
    qText.includes('đb sông hồng')
  ) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 25: Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng'
    };
  }

  if (oldLesson.includes('Trung du và miền núi') || qText.includes('trung du và miền núi')) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 24: Khai thác thế mạnh ở Trung du và miền núi Bắc Bộ'
    };
  }

  if (
    oldLesson.includes('Biển Đông') ||
    qText.includes('biển đông') ||
    qText.includes('hoàng sa') ||
    qText.includes('trường sa') ||
    qText.includes('hải đảo') ||
    qText.includes('kinh tế biển')
  ) {
    return {
      topic: 'Địa lí các vùng kinh tế - xã hội',
      lesson: 'Bài 33: Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo'
    };
  }

  // 3. Ngành dịch vụ
  if (
    oldLesson.includes('Giao thông') ||
    qText.includes('giao thông') ||
    qText.includes('đường bộ') ||
    qText.includes('đường sắt') ||
    qText.includes('đường biển') ||
    qText.includes('hàng không') ||
    qText.includes('bưu chính') ||
    qText.includes('viễn thông')
  ) {
    return {
      topic: 'Địa lí các ngành kinh tế',
      lesson: 'Bài 21: Giao thông vận tải và bưu chính viễn thông'
    };
  }

  if (
    oldLesson.includes('Thương mại') ||
    oldLesson.includes('du lịch') ||
    qText.includes('xuất khẩu') ||
    qText.includes('nhập khẩu') ||
    qText.includes('du lịch') ||
    qText.includes('nội thương') ||
    qText.includes('ngoại thương') ||
    qText.includes('cán cân xuất nhập khẩu')
  ) {
    return {
      topic: 'Địa lí các ngành kinh tế',
      lesson: 'Bài 22: Thương mại và du lịch'
    };
  }

  if (oldLesson.includes('dịch vụ') || qText.includes('ngành dịch vụ')) {
    return {
      topic: 'Địa lí các ngành kinh tế',
      lesson: 'Bài 20: Vai trò, các nhân tố ảnh hưởng đến sự phát triển và phân bố các ngành dịch vụ'
    };
  }

  // 4. Ngành công nghiệp
  if (
    oldLesson.includes('công nghiệp') ||
    oldLesson.includes('Công nghiệp') ||
    qText.includes('công nghiệp')
  ) {
    if (
      qText.includes('khu công nghiệp') ||
      qText.includes('trung tâm công nghiệp') ||
      qText.includes('tổ chức lãnh thổ')
    ) {
      return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 18: Một số hình thức tổ chức lãnh thổ công nghiệp' };
    }
    if (
      qText.includes('cơ cấu ngành công nghiệp') ||
      qText.includes('chuyển dịch cơ cấu công nghiệp')
    ) {
      return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 16: Chuyển dịch cơ cấu ngành công nghiệp' };
    }
    return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 17: Một số ngành công nghiệp' };
  }

  // 5. Ngành nông - lâm - thủy sản
  if (
    oldLesson.includes('nông nghiệp') ||
    oldLesson.includes('Nông nghiệp') ||
    qText.includes('nông nghiệp') ||
    qText.includes('lúa') ||
    qText.includes('cây ăn quả') ||
    qText.includes('cây công nghiệp') ||
    qText.includes('chăn nuôi') ||
    qText.includes('thủy sản') ||
    qText.includes('lâm nghiệp') ||
    qText.includes('trồng trọt')
  ) {
    if (
      qText.includes('thủy sản') ||
      qText.includes('hải sản') ||
      qText.includes('đánh bắt') ||
      qText.includes('nuôi trồng thủy sản') ||
      qText.includes('lâm nghiệp') ||
      qText.includes('trồng rừng') ||
      qText.includes('khai thác gỗ') ||
      qText.includes('độ che phủ rừng')
    ) {
      return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 13: Vấn đề phát triển ngành lâm nghiệp và thuỷ sản' };
    }
    if (
      qText.includes('vùng nông nghiệp') ||
      qText.includes('trang trại') ||
      qText.includes('vùng chuyên canh') ||
      qText.includes('tổ chức lãnh thổ')
    ) {
      return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 14: Tổ chức lãnh thổ nông nghiệp' };
    }
    return { topic: 'Địa lí các ngành kinh tế', lesson: 'Bài 12: Vấn đề phát triển ngành nông nghiệp' };
  }

  // 6. Chuyển dịch cơ cấu kinh tế
  if (
    oldLesson.includes('Chuyển dịch cơ cấu kinh tế') ||
    qText.includes('chuyển dịch cơ cấu kinh tế') ||
    qText.includes('cơ cấu kinh tế')
  ) {
    return {
      topic: 'Địa lí các ngành kinh tế',
      lesson: 'Bài 11: Chuyển dịch cơ cấu kinh tế'
    };
  }

  // 7. Dân cư - Đô thị - Lao động
  if (
    oldLesson.includes('Đô thị') ||
    qText.includes('đô thị') ||
    qText.includes('thành thị') ||
    qText.includes('thị dân')
  ) {
    return {
      topic: 'Địa lí dân cư',
      lesson: 'Bài 9: Đô thị hoá'
    };
  }

  if (
    qText.includes('lao động') ||
    qText.includes('việc làm') ||
    qText.includes('thất nghiệp') ||
    qText.includes('thiếu việc làm') ||
    qText.includes('nguồn lao động') ||
    qText.includes('chất lượng lao động')
  ) {
    return {
      topic: 'Địa lí dân cư',
      lesson: 'Bài 8: Lao động và việc làm'
    };
  }

  if (
    oldLesson.includes('dân số') ||
    oldLesson.includes('Dân số') ||
    qText.includes('dân số') ||
    qText.includes('sinh thô') ||
    qText.includes('tử thô') ||
    qText.includes('mật độ dân') ||
    qText.includes('gia tăng tự nhiên') ||
    qText.includes('cơ cấu dân số') ||
    qText.includes('dân tộc') ||
    qText.includes('già hóa')
  ) {
    return {
      topic: 'Địa lí dân cư',
      lesson: 'Bài 7: Dân số Việt Nam'
    };
  }

  // 8. Tự nhiên
  if (
    oldLesson.includes('Thiên tai') ||
    oldLesson.includes('tài nguyên') ||
    qText.includes('thiên tai') ||
    qText.includes('bão') ||
    qText.includes('ngập lụt') ||
    qText.includes('hạn hán') ||
    qText.includes('sạt lở') ||
    qText.includes('môi trường') ||
    qText.includes('tài nguyên thiên nhiên')
  ) {
    return {
      topic: 'Địa lí tự nhiên',
      lesson: 'Bài 5: Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường'
    };
  }

  if (
    oldLesson.includes('nhiệt đới ẩm') ||
    qText.includes('nhiệt đới ẩm') ||
    qText.includes('gió mùa') ||
    qText.includes('lượng mưa') ||
    qText.includes('nhiệt độ') ||
    qText.includes('khí hậu') ||
    qText.includes('bốc hơi')
  ) {
    return {
      topic: 'Địa lí tự nhiên',
      lesson: 'Bài 2: Thiên nhiên nhiệt đới ẩm gió mùa'
    };
  }

  if (
    oldLesson.includes('Vị trí địa lí') ||
    qText.includes('vị trí địa lí') ||
    qText.includes('tọa độ') ||
    qText.includes('tiếp giáp') ||
    qText.includes('vùng trời') ||
    qText.includes('vùng biển') ||
    qText.includes('đường biên giới') ||
    qText.includes('kinh độ') ||
    qText.includes('vĩ độ')
  ) {
    return {
      topic: 'Địa lí tự nhiên',
      lesson: 'Bài 1: Vị trí địa lí và phạm vi lãnh thổ'
    };
  }

  if (
    oldLesson.includes('phân hoá') ||
    qText.includes('địa hình') ||
    qText.includes('đồi núi') ||
    qText.includes('đồng bằng') ||
    qText.includes('đất đai') ||
    qText.includes('sinh vật') ||
    qText.includes('đất feralit')
  ) {
    return {
      topic: 'Địa lí tự nhiên',
      lesson: 'Bài 3: Sự phân hoá đa dạng của thiên nhiên'
    };
  }

  // Fallback
  return {
    topic: oldTopic || 'Địa lí tự nhiên',
    lesson: 'Bài 1: Vị trí địa lí và phạm vi lãnh thổ'
  };
}
