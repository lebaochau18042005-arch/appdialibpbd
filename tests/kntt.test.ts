import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, lessons, topics, KNTT_PARTS, KNTT_LESSONS } from '../src/data.ts';
import { remapQuestionToKNTT } from '../src/utils/knttCurriculum.ts';

test('KNTT_LESSONS contains all official lessons of SGK Kết nối tri thức', () => {
  assert.equal(KNTT_LESSONS.length, 36);
  assert.ok(KNTT_LESSONS.includes('Bài 1: Vị trí địa lí và phạm vi lãnh thổ'));
  assert.ok(KNTT_LESSONS.includes('Bài 2: Thiên nhiên nhiệt đới ẩm gió mùa'));
  assert.ok(KNTT_LESSONS.includes('Bài 3: Sự phân hoá đa dạng của thiên nhiên'));
  assert.ok(KNTT_LESSONS.includes('Bài 5: Vấn đề sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường'));
  assert.ok(KNTT_LESSONS.includes('Bài 7: Dân số Việt Nam'));
  assert.ok(KNTT_LESSONS.includes('Bài 8: Lao động và việc làm'));
  assert.ok(KNTT_LESSONS.includes('Bài 9: Đô thị hoá'));
  assert.ok(KNTT_LESSONS.includes('Bài 11: Chuyển dịch cơ cấu kinh tế'));
  assert.ok(KNTT_LESSONS.includes('Bài 12: Vấn đề phát triển ngành nông nghiệp'));
  assert.ok(KNTT_LESSONS.includes('Bài 13: Vấn đề phát triển ngành lâm nghiệp và thuỷ sản'));
  assert.ok(KNTT_LESSONS.includes('Bài 16: Chuyển dịch cơ cấu ngành công nghiệp'));
  assert.ok(KNTT_LESSONS.includes('Bài 17: Một số ngành công nghiệp'));
  assert.ok(KNTT_LESSONS.includes('Bài 21: Giao thông vận tải và bưu chính viễn thông'));
  assert.ok(KNTT_LESSONS.includes('Bài 22: Thương mại và du lịch'));
  assert.ok(KNTT_LESSONS.includes('Bài 24: Khai thác thế mạnh ở Trung du và miền núi Bắc Bộ'));
  assert.ok(KNTT_LESSONS.includes('Bài 25: Phát triển kinh tế - xã hội ở Đồng bằng sông Hồng'));
  assert.ok(KNTT_LESSONS.includes('Bài 27: Phát triển kinh tế - xã hội ở Bắc Trung Bộ'));
  assert.ok(KNTT_LESSONS.includes('Bài 28: Phát triển kinh tế - xã hội ở Duyên hải Nam Trung Bộ và Tây Nguyên (Nam Trung Bộ)'));
  assert.ok(KNTT_LESSONS.includes('Bài 30: Phát triển kinh tế - xã hội ở Đông Nam Bộ'));
  assert.ok(KNTT_LESSONS.includes('Bài 31: Sử dụng hợp lí tự nhiên để phát triển kinh tế ở Đồng bằng sông Cửu Long'));
  assert.ok(KNTT_LESSONS.includes('Bài 33: Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông và các đảo, quần đảo'));
  assert.ok(KNTT_LESSONS.includes('Bài 35: Thực hành: Tìm hiểu địa lí địa phương'));
  assert.ok(KNTT_LESSONS.includes('Khu vực Đông Nam Á (Địa lí 11 - Kết nối tri thức)'));
});

test('KNTT_PARTS correctly defines 5 main parts of the curriculum', () => {
  assert.equal(KNTT_PARTS.length, 5);
  assert.equal(KNTT_PARTS[0].id, 'part_1');
  assert.equal(KNTT_PARTS[0].title, 'Phần 1: Địa lí tự nhiên');
  assert.equal(KNTT_PARTS[1].id, 'part_2');
  assert.equal(KNTT_PARTS[1].title, 'Phần 2: Địa lí dân cư');
  assert.equal(KNTT_PARTS[2].id, 'part_3');
  assert.equal(KNTT_PARTS[2].title, 'Phần 3: Địa lí các ngành kinh tế');
  assert.equal(KNTT_PARTS[3].id, 'part_4');
  assert.equal(KNTT_PARTS[3].title, 'Phần 4: Địa lí các vùng kinh tế - xã hội');
  assert.equal(KNTT_PARTS[4].id, 'part_5');
  assert.equal(KNTT_PARTS[4].title, 'Phần 5: Địa lí địa phương & Bổ trợ ôn thi');
});

test('100% of questions are mapped to valid KNTT lessons and topics', () => {
  assert.equal(questions.length, 347);
  for (const q of questions) {
    assert.ok(q.lesson, `Question ${q.id} must have a lesson`);
    assert.ok(KNTT_LESSONS.includes(q.lesson), `Question ${q.id} has invalid lesson: ${q.lesson}`);
    assert.ok(topics.includes(q.topic), `Question ${q.id} has invalid topic: ${q.topic}`);
  }
});

test('remapQuestionToKNTT accurately categorizes specific geography domains', () => {
  const q1 = remapQuestionToKNTT({
    id: 'test_q1',
    type: 'multiple_choice',
    topic: 'Địa lí tự nhiên',
    text: 'Căn cứ vào Atlat Địa lí Việt Nam, vị trí tiếp giáp lãnh thổ nước ta ở phía tây là',
    options: ['Lào', 'Thái Lan', 'Campuchia', 'Trung Quốc'],
    correctAnswerIndex: 0
  });
  assert.equal(q1.lesson, 'Bài 1: Vị trí địa lí và phạm vi lãnh thổ');
  assert.equal(q1.topic, 'Địa lí tự nhiên');

  const q2 = remapQuestionToKNTT({
    id: 'test_q2',
    type: 'multiple_choice',
    topic: 'Địa lí dân cư',
    text: 'Cơ cấu dân số theo độ tuổi ở nước ta hiện nay đang có xu hướng già hóa',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0
  });
  assert.equal(q2.lesson, 'Bài 7: Dân số Việt Nam');
  assert.equal(q2.topic, 'Địa lí dân cư');

  const q3 = remapQuestionToKNTT({
    id: 'test_q3',
    type: 'multiple_choice',
    topic: 'Địa lí dân cư',
    text: 'Tình trạng thiếu việc làm ở khu vực nông thôn nước ta chủ yếu do',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0
  });
  assert.equal(q3.lesson, 'Bài 8: Lao động và việc làm');
  assert.equal(q3.topic, 'Địa lí dân cư');

  const q4 = remapQuestionToKNTT({
    id: 'test_q4',
    type: 'multiple_choice',
    topic: 'Địa lí các vùng kinh tế - xã hội',
    text: 'Vùng kinh tế trọng điểm phía Nam gắn với sự phát triển của vùng Đông Nam Bộ',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0
  });
  assert.equal(q4.lesson, 'Bài 30: Phát triển kinh tế - xã hội ở Đông Nam Bộ');
  assert.equal(q4.topic, 'Địa lí các vùng kinh tế - xã hội');
});
